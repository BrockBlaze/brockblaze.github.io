function checkedToggle() {
  var checkBox = document.getElementById("checkbox"); 
  var root = document.documentElement.style;
  if (checkBox.checked){
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("checked", "true");
    }
  } else {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("checked", "false");
    }
  }
  /*if (localStorage.getItem("checked") == "true")
  {
    root.setProperty("--bgcolor", "cornflowerblue");
    root.setProperty("--bdcolor", "rgb(244, 244, 244)");
    root.setProperty("--fgcolor", "white");
    root.setProperty("--footercolor", "black");
  }
  if (localStorage.getItem("checked") == "false")
  {
    root.setProperty("--bgcolor", "rgb(7, 46, 78)");
    root.setProperty("--bdcolor", "#8b8b8b");
    root.setProperty("--fgcolor", "rgb(163, 163, 163)");
    root.setProperty("--footercolor", "white");
  }*/
  /*if (checkBox.checked) {
    root.setProperty("--bgcolor", "cornflowerblue");
    root.setProperty("--bdcolor", "rgb(244, 244, 244)");
    root.setProperty("--fgcolor", "white");
    root.setProperty("--footercolor", "black");
  } else {
    root.setProperty("--bgcolor", "rgb(7, 46, 78)");
    root.setProperty("--bdcolor", "#8b8b8b");
    root.setProperty("--fgcolor", "rgb(163, 163, 163)");
    root.setProperty("--footercolor", "white");
  }*/

  checkToggle();

}

function checkToggle() {
  var checkBox = document.getElementById("checkbox"); 
  var toggle = localStorage.getItem("checked");
  //document.getElementById("result").innerHTML = toggle;
  var root = document.documentElement.style;
  if (localStorage.getItem("checked") == "true" && toggle == "true")
  {
    root.setProperty("--bgcolor", "cornflowerblue");
    root.setProperty("--bdcolor", "rgb(244, 244, 244)");
    root.setProperty("--fgcolor", "white");
    root.setProperty("--footercolor", "black");
  }
  if (localStorage.getItem("checked") == "false" && toggle == "false")
  {
    root.setProperty("--bgcolor", "rgb(7, 46, 78)");
    root.setProperty("--bdcolor", "#8b8b8b");
    root.setProperty("--fgcolor", "rgb(163, 163, 163)");
    root.setProperty("--footercolor", "white");
  }
  if (toggle == "true")
  {
    checkBox.checked = true;
  }
  if (toggle == "false"){
    checkBox.checked = false;
  }
}
