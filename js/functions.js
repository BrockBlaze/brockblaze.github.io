function checkedToggle() {
  var checkBox = document.getElementById("checkbox");
  var root = document.documentElement.style;
  if (checkBox.checked) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem("checked", "true");
    }
  } else {
    if (typeof Storage !== "undefined") {
      localStorage.setItem("checked", "false");
    }
  }
  checkToggle();
}

if (!window.getComputedStyle) {
  // Fallback for obsolete IE
  window.getComputedStyle = function (e) {
    return e.currentStyle;
  };
}

function ham() {
  var nav = document.getElementById("navB");
  if (getComputedStyle(nav).display === "none") {
    nav.style.display = "flex";
  } else {
    nav.style.display = "none";
  }
}

function resize() {
  var nav = document.getElementById("navB");
  if (window.outerWidth > 700) {
    nav.style.display = "flex";
  }
  if (window.outerWidth < 700) {
    nav.style.display = "none";
  }
}

function checkToggle() {
  var checkBox = document.getElementById("checkbox");
  var toggle = localStorage.getItem("checked");
  //document.getElementById("result").innerHTML = toggle;
  var root = document.documentElement.style;
  if (localStorage.getItem("checked") == "true" && toggle == "true") {
    root.setProperty("--bgcolor", "cornflowerblue");
    root.setProperty("--bdcolor", "rgb(244, 244, 244)");
    root.setProperty("--fgcolor", "white");
    root.setProperty("--footercolor", "black");
  }
  if (localStorage.getItem("checked") == "false" && toggle == "false") {
    root.setProperty("--bgcolor", "rgb(7, 46, 78)");
    root.setProperty("--bdcolor", "#8b8b8b");
    root.setProperty("--fgcolor", "rgb(163, 163, 163)");
    root.setProperty("--footercolor", "white");
  }
  if (toggle == "true") {
    checkBox.checked = true;
  }
  if (toggle == "false") {
    checkBox.checked = false;
  }

  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  if (!localStorage.getItem("name") && !localStorage.getItem("race")) {
    newPlayerCreation.style.display = "none";
    gameMenu.style.display = "none";
    gamePlay.style.display = "none";
    stats.style.display = "none";
    fight.style.display = "none";
    town.style.display = "none";
    home.style.display = "none";
  }
  if (localStorage.getItem("name") && !localStorage.getItem("race")) {
    newPlayer.style.display = "none";
    gameMenu.style.display = "none";
    gamePlay.style.display = "none";
    stats.style.display = "none";
    fight.style.display = "none";
    town.style.display = "none";
    home.style.display = "none";
  }
  if (localStorage.getItem("name") && localStorage.getItem("race")) {
    document.getElementById("output").innerHTML =
      "Welcome " + localStorage.getItem("name");
    newPlayer.style.display = "none";
    newPlayerCreation.style.display = "none";
    gamePlay.style.display = "none";
    stats.style.display = "none";
    fight.style.display = "none";
    town.style.display = "none";
    home.style.display = "none";
  }
}

function EnterName() {
  var name = document.getElementById("name").value;
  if (name.value == "") {
    document.getElementById("output").innerHTML = "Please enter a Name";
  } else {
    storeName(name);
    location.reload();
    return false;
  }
}

function EnterRace() {
  var race = document.getElementById("race").value;
  storeRace(race);
  location.reload();
  return false;
}

function storeName(name) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("name", name);
  }
}

function storeRace(race) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("race", race);
    localStorage.setItem("health", 100)
    localStorage.setItem("level", 1);
    localStorage.setItem("gold", 0)
  }
}

function DeletePlayer() {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem("name");
    localStorage.removeItem("race");
  }
  location.reload();
  return false;
}

function mainMenu() {
  location.reload();
  return false;
}

function Play() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  document.getElementById("nameRace").innerHTML = localStorage.getItem("name") + " the " + localStorage.getItem("race");
  document.getElementById("yourHealth").innerHTML = "Your health - " + localStorage.getItem("health");
  document.getElementById("yourLevel").innerHTML = "Your Level - " + localStorage.getItem("level");
  document.getElementById("yourGold").innerHTML = "Your Gold - " + localStorage.getItem("gold");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "block";
}

function Stats() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  document.getElementById("nameRace1").innerHTML = localStorage.getItem("name") + " the " + localStorage.getItem("race");
  document.getElementById("yourHealth1").innerHTML = "Your health - " + localStorage.getItem("health");
  document.getElementById("yourLevel1").innerHTML = "Your Level - " + localStorage.getItem("level");
  document.getElementById("yourGold1").innerHTML = "Your Gold - " + localStorage.getItem("gold");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "block";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "none";
}

function updateGold(gold) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("gold", gold);
  }
}

function Fight() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "block";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "none";
  var r = Math.round(Math.random() * 10);
  var c = Math.round(Math.random() * 10);
  if (r <= 7)
  {
    if (c <= 5)
    {
      document.getElementById("fightoutput").innerHTML = "A Wolf approaches";
      if (localStorage.getItem("level") > 0)
      {
        if (c <= 2) {
          document.getElementById("fightoutput").innerHTML = "You Slaughter the Wolf and Found " + r + " gold";
          localStorage.setItem("gold") += r;
        }else {
          document.getElementById("fightoutput").innerHTML = "You Slaughter the Wolf and Found nothing";
        }
      }
    }else {
      document.getElementById("fightoutput").innerHTML = "An Orc approaches";
    }
  }else {
    document.getElementById("fightoutput").innerHTML = "Nothing found";
  }
}

function Town() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "none";
  town.style.display = "block";
  home.style.display = "none";
  gamePlay.style.display = "none";
  var c = Math.round(Math.random() * 10);
  var r = Math.round(Math.random() * 10);
  if (r <= 7)
  {
    if (c <= 5)
    {

    }
  }else {

  }
}

function Home() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var stats = document.getElementById("stats");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "block";
  gamePlay.style.display = "none";
  var c = Math.round(Math.random() * 10);
  var r = Math.round(Math.random() * 10);
  if (r <= 7)
  {
    if (c <= 5)
    {

    }
  }else {

  }
}
