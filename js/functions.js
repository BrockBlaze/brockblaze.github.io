var c = localStorage.getItem("c");
var checkBox = document.getElementById("checkbox");

function checkedToggle() {
  var checkBox = document.getElementById("checkbox"); 
  if (checkBox.checked) {
    localStorage.setItem("c", true);
  } else {
    localStorage.setItem("c", false);
  } 
}

var root = document.documentElement.style;
if (c == true)
{
  root.setProperty("--bgcolor", "cornflowerblue");
    root.setProperty("--bdcolor", "rgb(244, 244, 244)");
    root.setProperty("--fgcolor", "white");
    root.setProperty("--footercolor", "black");
  } else {
    root.setProperty("--bgcolor", "rgb(7, 46, 78)");
    root.setProperty("--bdcolor", "#8b8b8b");
    root.setProperty("--fgcolor", "rgb(163, 163, 163)");
    root.setProperty("--footercolor", "white");
  }
}
