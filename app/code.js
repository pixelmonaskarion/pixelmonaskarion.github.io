var state;
var user;
var projects = [];
var TheProject;
var activeFile = 0;
function createElements(){
  textInput("projectName", "name");
  hideElement("projectName");
  button("save", "save");
  hideElement("save");
  button("newFile", "new file");
  hideElement("newFile");
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
  activeFile = 0;
  for (var i = 0; i<projects.length; i++){
    hideElement(projects[i]);
  }
  TheProject = project;
  setScreen("ide");
  var files = JSON.parse(project.files);
  if (files.length > 0){
    console.log(files);
    if (files != undefined){
      setText("ide_text",files[activeFile].text);
    } else {
      
    }
  }
}
onEvent("newFile","click", function(){
  if (state == "ide"){
    var files = JSON.parse(TheProject.files);
    files.push({"name":"test", "text":""});
    TheProject.files = JSON.stringify(files);
    
    updateRecord("projects", TheProject);
  }
});
onEvent("save","click", function(){
  if (state == "ide"){
    var files = JSON.parse(TheProject.files);
    files.push({"name":"test", "text":""});
    TheProject.files = JSON.stringify(files);
    updateRecord("projects", TheProject);
  }
});
