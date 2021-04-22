var state;
var user;
var projects = [];
var TheProject;
var activeFile = 0;
function createElements(){
  setPosition("ide_save", 200,100);
}
function login(){
  state = "login";
  setScreen("login");
}
function createAccount(){
  state = "create account";
  setScreen("create_account");
}
createElements();
login();
onEvent("login_create", "click", function(){
    createAccount();
});
onEvent("CA_create", "click", function() {
  var username = getText("CA_username");
    var password = getText("CA_password");
    readRecords("users", {"username":username}, function(records){
      if (records.length == 0){
        //console.log(username);
        createRecord("users", {"username":username, "password":password});
        user = username;
        projectPage();
      } else {
        login();
      }
    });
});
onEvent("login_go", "click", function(){
    var username = getText("login_username");
    var password = getText("login_password");
    readRecords("users", {"username":username, "password":password}, function(records){
      if (records.length == 1){
        user = username;
        projectPage();
      }
    });
});
onEvent("create_go", "click", function() {
  var name = getText("create_project_name");
    createRecord("projects", {"users":user, "name":name, "files":JSON.stringify([])}, function(record) {
      openProject(record);
    });
})

function projectPage(){
  state = "projects";
  setScreen("projects_pg");
  readRecords("projects", {}, function(records){
    for (var i = 0; i<records.length; i++){
      if (records[i].users == user) {
        var projectid = "project"+i;
        projects.push(projectid);
        button(projectid, records[i].name);
        setProperty(projectid, "background-color", rgb(0, 162, 255));
        onEvent(projectid, "click", function(){
          if (state == "projects"){
            readRecords("projects", {"name":getText(projectid)}, function(records){
            openProject(records[0]);
            });
          }
        });
      }
    }
  });
}
onEvent("createProject", "click", function(){
  if (state == "projects"){
    state = "new project";
    setScreen("create_project_pg");
  }
});

function openProject(project) {
  state = "ide";
  for (var i = 0; i<projects.length; i++){
    hideElement(projects[i]);
  }
  TheProject = project;
  setScreen("ide");
  var files = JSON.parse(project.files);
  if (files.length > 0){
    //console.log(files);
    if (files != undefined){
      setText("ide_text",files[activeFile].text);
    } else {
      
    }
    options = 'dropdown("ide_dropdown","change file",';
    for (var i = 0; i<files.length; i++) {
      options = options + '"'+files[i].name+'"';
      if (i+1 != files.length) {
        options = options + ",";
      } else {
        options = options + ");";
      }
    }
    console.log(options);
    deleteElement("ide_dropdown");
    eval(options);
    setPosition("ide_dropdown", 100,30);
    onEvent("ide_dropdown", "change", function(){
      if (getProperty("ide_dropdown", "index") != 0) {
        text = getProperty("ide_dropdown", "options")[getProperty("ide_dropdown", "index")];
      activeFile = getFileIndex(JSON.parse(TheProject.files), text); 
      deleteElement("ide_dropdown");
      openProject(TheProject);
      }
    });
  }
}
onEvent("ide_new_file","click", function(){
    setScreen("new_file");
    
});
onEvent("new_file_go", "click", function(){
  var files = JSON.parse(TheProject.files);
  files.push({"name":getText("new_file_name"), "text":"//I wish this was java"});
  TheProject.files = JSON.stringify(files);
  updateRecord("projects", TheProject);
  openProject(TheProject);
});
onEvent("ide_save","click", function(){
  var files = JSON.parse(TheProject.files);
  files[activeFile] = {"name":files[activeFile].name, "text":getText("ide_text")};
  TheProject.files = JSON.stringify(files);
  updateRecord("projects", TheProject);
});
function getFileIndex(files, name) {
  for (i = 0; i < files.length; i++) {
    if (files[i].name == name) {
      console.log(files[i].name);
      return i;
    } else {
      //console.log(files[i].name);
    }
  }
  //console.log(name);
  return null;
}

