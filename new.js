var canvas = document.getElementById("canvas");
var cvWidth = canvas.width;
var cvHeight = canvas.height;
var ctx = canvas.getContext("2d");
var x = 0;
var keysDown = [];
var tiles = [];
var liquids = [];
var particles = [];
var size = 1000;
var zoom = 30;
var textures = false;
var h = document.createElement("H1");
var grassImg = null;//document.getElementById("grass");
var stoneImg = null;//document.getElementById("stone");
var dirtImg = null;//document.getElementById("dirt");
//grassImg.remove();
//dirtImg.remove();
//stoneImg.remove();
//log(typeof(img));
noise.seed(Math.random());
for (var x = 0; x < size; x++) {
	var height = Math.floor((noise.perlin2(x/10, 0)+10)*5);
	for (var y = 0; y < size; y++) {
		var cave = Math.abs(noise.perlin2(x/50,y/50))*255;
		var value = 0;
		var color = "";
		var img = null;
		if (y < height) {
			value = 255;
			color = {"r":255, "g":255, "b":255};
		//} else if (y == height) {
			//color = {"r":0, "g":255, "b":0};
		//} else if (y-5 < height) {
			//color = {"r":100, "g":50, "b":0};
		} else {
			color = {"r":100, "g":100, "b":100};
			img = stoneImg;
		}
		if (cave > 80) {
			value = 255;
			color = {"r":255, "g":255, "b":255};
			img = null;
		}
		//tiles[x * size + y] = {"x":x, "y":y, "color":"rgb(" + 200+random(0,55) + ", " + random(0,10) + ", " + 0 + ")"};
		//tiles[x * size + y] = {"x":x, "y":y, "color":"rgb(" + range(0,20) + ", " + (200+range(0, 55)) + "," + range(0,5) + ")"};
		tiles[x * size + y] = {"x":x, "y":y, "color":color, "type":value/255, "light":0, "img":img};
	}
	var by = getTopBlock(x).y;
	getBlock(x,by).img = grassImg;
	getBlock(x, by).color = {"r":0, "g":255, "b":0};
	for (var dirt = 1; dirt < 6; dirt++) {
		if (getBlock(x,by+dirt).type == 0) {
			getBlock(x,by+dirt).img = dirtImg;
			getBlock(x, by+dirt).color = {"r":100, "g":50, "b":0};
		}
	}
	//tiles[0] = {"x":0, "y":0 "color":"rgb(0,0,0)", "type":"0"};
}
for (var i = 0; i < size/10; i++) {
	var position = {"x":Math.floor(Math.random()*size),"y":Math.floor(Math.random()*size)};
	for (var length = 0; length < 10; length++) {
		var dir = noise.perlin2(position.x / 10, position.y / 10)*10;
		for (var step = 0; step < 4; step++) {
			var radius = 5;
			for (var dx = -radius; dx  < radius+1; dx++) {
				for (var dy = -radius; dy  < radius+1; dy++) {
					var bx = position.x+dx;
					var by = position.y+dy;
					var dist = Math.abs(Math.sqrt(Math.pow(position.x-bx, 2) + Math.pow(position.y-by, 2)));
					//log(dist);
					if (dist < radius) {
						getBlock(bx, by).type = 1;
						getBlock(bx, by).color = {"r":255, "g":255, "b":255};
						getBlock(bx, by).img = null;
					}
				}
			}
			position.x += Math.floor(Math.sin(dir)*3);
			position.y += Math.floor(Math.cos(dir)*3);
		}
	}
}



for (var x = 0; x < size; x++) {
	liquids.push({"x":x, "y":0, "type":0, "dir":1, "evap":0, "amount":1});
}

//for (var b = 0; b < tiles.length; b++) {
	//lightUpdate(b);
//}
var player = {"x": 0, "y": 0, "sy":0, inAir:10, "hook":null, jumped:false};
var speed = 0.2;
var scrollX = 0;
var scrollY = 0;
var ticks = 0;

document.addEventListener('keydown', keyWentDown);
document.addEventListener('keyup', keyWentUp);
var mouseDown = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    mouseDownCount = 0;
document.body.onmousedown = function(evt) { 
  ++mouseDown[evt.button];
  ++mouseDownCount;
}
document.body.onmouseup = function(evt) {
  --mouseDown[evt.button];
  --mouseDownCount;
}
var mx = 0;
var my = 0;
document.onmousemove = handleMouseMove;
function handleMouseMove(evt) {
	mx = evt.clientX-8;//canvas position on the document
	my = evt.clientY-8;
}

function secondJump() {
	if (player.jumped == 1) {
		player.sy = -1;
		player.jumped = 2;
			for (var i = 0; i < 5; i++) {
			var dir = (Math.random()*10)%Math.PI-Math.PI/2;
			particles.push({"x":player.x+zoom/2, "y":player.y+zoom/2, "sx":Math.sin(dir)*10, "sy":Math.cos(dir)*10, "time":100, "maxTime":100, "dir":45});
		}
	}
}

function animate() {
// call again next time we can draw
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, cvWidth, cvHeight);
  ticks++;
  ctx.canvas.width  = window.innerWidth-16;
  ctx.canvas.height = window.innerHeight-16;
  cvWidth = window.innerWidth-16;
  cvHeight = window.innerHeight-16;
  
  if (keysDown.includes("w")) {
    if (player.jumped == 0) {
		player.jumped = 1;
		player.sy += -0.7;
	}
  }

  //if (keysDown.includes("s")) {
  //  moveY(speed*zoom);
  //}
  player.sy += 0.05;
  player.inAir += 1;
  moveY(player.sy*zoom);

  if (keysDown.includes("a")) {
    moveX(-speed*zoom);
  } 

  if (keysDown.includes("d")) {
    moveX(speed*zoom);
  }

  //for (var i = 0; i < tiles.length; i++) {
  //  drawTile(tiles[i]);
  //}
  for (var x = Math.floor((scrollX-cvWidth/2)/zoom); x < Math.floor((scrollX+cvWidth/2+zoom)/zoom); x++) {
	for (var y = Math.floor((scrollY-cvHeight/2)/zoom); y < Math.floor((scrollY+cvHeight/2+zoom)/zoom); y++) {
		var index = y + size * x;
		if (index > -1 && index < size*size) {
			drawTile(tiles[index]);
		}
	}		
  }
  var i = 0;
  while (i < liquids.length) {
	  i += drawLiquid(liquids[i]);
	  i++;
  }
  //ctx.fillText(liquids.length, 100, 100);
  for (var i = liquids.length-1; i > -1; i--) {
	  if (liquids[i].amount < 0.1) {
		liquids.splice(i, 1);
	  }
  }
  //getBlock(Math.floor(player.x/zoom), Math.floor(player.y/zoom)).color = "rgb(255,0,0)";
  ctx.fillStyle = "red";
  ctx.fillRect(player.x-scrollX+cvWidth/2, player.y-scrollY+cvHeight/2, zoom, zoom);
  
  for (var i = 0; i < particles.length; i++) {
	  ctx.globalAlpha = particles[i].time/particles[i].maxTime;
	ctx.save();

	ctx.translate(particles[i].x-scrollX+cvWidth/2+5, particles[i].y-scrollY+cvHeight/2+5);
	ctx.rotate(ticks*10%360 * Math.PI/180);

	//ctx.fillRect(x, y, w, h);
	ctx.fillStyle = "hsl("+(particles[i].maxTime-particles[i].time)*5+", 100%, 50%)";
	ctx.fillRect(-5, -5, 10, 10);

	ctx.restore();
	  
	  ctx.globalAlpha = 1;
	  particles[i].time--;
	  if (getBlock(Math.floor(particles[i].x/zoom), Math.floor(particles[i].y/zoom)).type == 1) {
		particles[i].y += particles[i].sy;
		particles[i].x += particles[i].sx;
	  }
	  particles[i].sx *= 0.9;
	  particles[i].sy *= 0.9;
	  particles[i].sy += 0.5;
  }
  
  var finalL = particles.length;
  for (var i = finalL-1; i > -1; i--) {
	  if (particles[i].time <= 0) {
		  particles.splice(i, 1);
	  }
  }
  
  //getBlock(Math.floor(player.x/zoom), Math.floor(player.y/zoom)).light = 100;
  if (mouseDown[0] == 1 || keysDown.includes("x")) {
		var mbx = Math.floor((mx+scrollX-cvWidth/2)/zoom);
		var mby = Math.floor((my+scrollY-cvHeight/2)/zoom);
		getBlock(mbx, mby).type = 1;
		getBlock(mbx, mby).color = {"r":255, "g":255, "b":255};
		getBlock(mbx, mby).img = null;
		//ctx.fillText("("+mbx+","+mby+")", mx, my);
  }
  if (mouseDown[1] == 1 || keysDown.includes("c")) {
		var mbx = Math.floor((mx+scrollX-cvWidth/2)/zoom);
		var mby = Math.floor((my+scrollY-cvHeight/2)/zoom);
		getBlock(mbx, mby).type = 0;
		getBlock(mbx, mby).color = {"r":0, "g":0, "b":0};
		getBlock(mbx, mby).img = null;
  }
  if (keysDown.includes("l")) {
		var mbx = Math.floor((mx+scrollX-cvWidth/2)/zoom);
		var mby = Math.floor((my+scrollY-cvHeight/2)/zoom);
		getBlock(mbx, mby).type = 1;
		getBlock(mbx, mby).color = {"r":255, "g":255, "b":0};
		getBlock(mbx, mby).img = null;
  }
  scroll();
  //ctx.fillRect(0,0,100,100);
  drawOutline();
}

function scroll() {
  scrollX += (player.x-scrollX)/10;
  scrollY += (player.y-scrollY)/20;
}

function drawTile(tile) {
	if (tile.x*zoom-scrollX+cvWidth/2 > -size && tile.x*zoom-scrollX+cvWidth/2 < cvWidth) {
		if (tile.y*zoom-scrollY+cvHeight/2 > -size && tile.y*zoom-scrollY+cvHeight/2 < cvHeight) {
			lightUpdate(tile.x * size + tile.y);
			if (tile.img == null || textures != true) {
				if (tile.type == 1) {
					ctx.fillStyle = colorToString(colorMultiply(tile.color, Math.min(tile.light, 1)));
					ctx.fillRect(tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2, zoom+1, zoom+1);
				} else {
					ctx.fillStyle = colorToString(tile.color);
					ctx.fillRect(tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2, zoom+1, zoom+1);
				}
			} else {
				ctx.drawImage(tile.img, tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2, zoom+1, zoom+1);
			}
			//ctx.fillStyle = "red";
			//ctx.fillText((y-getTopBlock(tile.x).y)/1000, tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2);
			//if (getTopBlock(tile.x).y < tile.y) {
			//	ctx.fillStyle = "rgb(0,0,0)";
			//	ctx.fillRect(tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2, zoom+5, zoom+5);
			//}
			//ctx.fillText("x: " + tile.x + " y: " + tile.y + "index: " + (tile.x + (size * tile.y)), tile.x*zoom-scrollX+cvWidth/2, tile.y*zoom-scrollY+cvHeight/2);
		}
	}
}

function drawLiquid(liquid) {
	if (liquid.x*zoom-scrollX+cvWidth/2 > -size && liquid.x*zoom-scrollX+cvWidth/2 < cvWidth) {
		if (liquid.y*zoom-scrollY+cvHeight/2 > -size && liquid.y*zoom-scrollY+cvHeight/2 < cvHeight) {
			ctx.fillStyle = colorToString(colorMultiply({"r":0, "g":0, "b":255}, Math.min(getBlock(liquid.x, liquid.y).light, 1)));
			ctx.fillRect(liquid.x*zoom-scrollX+cvWidth/2, liquid.y*zoom-scrollY+cvHeight/2+zoom-((zoom+1)*liquid.amount), zoom+1, (zoom+1)*liquid.amount);
		}
	}
	if (getBlock(liquid.x, liquid.y+1).type == 1 && getLiquid(liquid.x, liquid.y+1) == null) {
		liquid.y++;
		liquid.evap++;
	} else {
		if (getBlock(liquid.x+liquid.dir, liquid.y).type == 1 && getLiquid(liquid.x+liquid.dir, liquid.y) == null) {
			liquid.x += liquid.dir;
			liquid.evap++;
			//liquids.push({"x":liquid.x+liquid.dir, "y":y, "type":0, "dir":1, "evap":0, "amount":liquid.amount/2});
			//liquids[getLiquidIndex(liquid.x, liquid.y)].amount = liquid.amount/2;
		} else {
			liquid.dir *= -1;
		}
	}
	if (getLiquid(liquid.x+liquid.dir, liquid.y) != null) {
		if (getLiquid(liquid.x+liquid.dir, liquid.y).amount < liquid.amount) {
			var half = (getLiquid(liquid.x+liquid.dir, liquid.y)-liquid.amount)/2
			//getLiquid(liquid.x+liquid.dir, liquid.y).amount += half;
			//liquids[getLiquidIndex(liquid.x, liquid.y)].amount -= half;
		}
	}
	if (liquid.evap > 100) {
		var li = getLiquidIndex(liquid.x, liquid.y);
		liquids.splice(li, 1);
		return -1;
	}
	return 0;
}

function getLiquid(x, y) {
	for (var i = 0; i < liquids.length; i++) {
		if (liquids[i].x == x && liquids[i].y == y) {
			return liquids[i];
		}
	}
	return null;
}

function getLiquidIndex(x, y) {
	for (var i = 0; i < liquids.length; i++) {
		if (liquids[i].x == x && liquids[i].y == y) {
			return i;
		}
	}
	return -1;
}

function lightUpdate(tileIndex) {
	var color = tiles[tileIndex].color;
	if (color.r == 255 && color.g == 255 && color.b == 0) {
		tiles[tileIndex].light = 1;
		return;
	}
	if (tiles[tileIndex].y <= getTopBlock(tiles[tileIndex].x).y) {
		tiles[tileIndex].light = 1;
		return;
	}
	var u = getBlock(tiles[tileIndex].x, tiles[tileIndex].y-1).light;
	if (getBlock(tiles[tileIndex].x, tiles[tileIndex].y-1).type == 0) {
		u = 0.1;
	}
	var d = getBlock(tiles[tileIndex].x, tiles[tileIndex].y+1).light;
	if (getBlock(tiles[tileIndex].x, tiles[tileIndex].y+1).type == 0) {
		d = 0.1;
	}
	var r = getBlock(tiles[tileIndex].x+1, tiles[tileIndex].y).light;
	if (getBlock(tiles[tileIndex].x+1, tiles[tileIndex].y).type == 0) {
		r = 0.1;
	}
	var l = getBlock(tiles[tileIndex].x-1, tiles[tileIndex].y).light;
	if (getBlock(tiles[tileIndex].x-1, tiles[tileIndex].y).type == 0) {
		l = 0.1;
	}
	tiles[tileIndex].light = (u+d+r+l)/4;
	tiles[tileIndex].light = Math.max(Math.min(tiles[tileIndex].light, 1), 0.05);
}

function colorMultiply(color, mult) {
	return {"r":color.r*mult, "g":color.g*mult, "b":color.b*mult};
}

function colorToString(color) {
	return "rgb("+color.r+","+color.g+","+color.b+")";
}

function getTopBlock(x) {
	for (var y = 0; y < size; y++) {
		if (getBlock(x,y).type == 0) {
			return getBlock(x,y);
		}
	}
	return getBlock(x,size);
}

function drawOutline() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, cvWidth, 10);
	ctx.fillRect(0, 0, 10, cvHeight);
	ctx.fillRect(0, cvHeight-10, cvWidth, 10);
	ctx.fillRect(cvWidth-10, 0, 10, cvHeight);
}

animate();



function keyWentDown(e) {
  if (!keysDown.includes(e.key.toLowerCase())) {
    keysDown.push(e.key.toLowerCase());
  }
  if (e.key.toLowerCase() == "t") {
	 // textures = !textures;
  }
  if (e.key.toLowerCase() == "w") {
	  secondJump();
  }
}

function getBlock(x, y) {
	if (x > -1 && x < size && y > -1 && y < size) {
		var block = tiles[y + (size * x)];
		return block;
	} else {
		return {"x":x, "y":y, "type":1, "color":"white", "light":1};
	}
}

function playerBlocks() {
	var blocks = [];
	blocks.push(getBlock(Math.floor((player.x+1)/zoom), Math.floor((player.y+1)/zoom)));
	blocks.push(getBlock(Math.floor((player.x+zoom-1)/zoom), Math.floor((player.y+zoom-1)/zoom)));
	blocks.push(getBlock(Math.floor((player.x+zoom-1)/zoom), Math.floor((player.y+1)/zoom)));
	blocks.push(getBlock(Math.floor((player.x+1)/zoom), Math.floor((player.y+zoom-1)/zoom)));
	return blocks;
}

function playerTouchingBlocks() {
	//if (player.x > size*zoom || player.x < 0 || player.y > size*zoom || player.y < 0) return true;
	var blocks = playerBlocks();
	for (var i = 0; i < blocks.length; i++) {
		if (blocks[i] != null) {
			if (blocks[i].type == 0) {
				return true;
			}
		}
	}
	return false;
}

function log(text) {
	//var t = document.createTextNode(text + "\n");
	//h.appendChild(t); 
	var h = document.createElement("H1");
  var t = document.createTextNode(text);
  h.appendChild(t);
  document.body.appendChild(h);
}

function moveX(x) {
	player.x += x;
	while(playerTouchingBlocks()) {
		player.x -= x/Math.abs(x);
	}
}

function moveY(y) {
	player.y += y;
	if (player.jumped != 2) {
		player.jumped = 1;
	}
	while(playerTouchingBlocks()) {
		player.y -= y/Math.abs(y);
		player.sy = 0;
		if (y > 0) {
			player.jumped = 0;
		}
	}
}

function keyWentUp(e) {
  const index = keysDown.indexOf(e.key.toLowerCase());
  if (index > -1) {
    keysDown.splice(index, 1);
  }
}

function range(min, max) {
  return min+Math.floor(Math.random() * max+1-min);
}