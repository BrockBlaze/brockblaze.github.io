function gameStart() {
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
    localStorage.setItem("health", 100);
    localStorage.setItem("level", 1);
    localStorage.setItem("gold", 1);
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
  document.getElementById("nameRace").innerHTML =
    localStorage.getItem("name") + " the " + localStorage.getItem("race");
  document.getElementById("yourHealth").innerHTML =
    "Your health - " + localStorage.getItem("health");
  document.getElementById("yourLevel").innerHTML =
    "Your Level - " + localStorage.getItem("level");
  document.getElementById("yourGold").innerHTML =
    "Your Gold - " + localStorage.getItem("gold");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "block";
  localStorage.removeItem("creature");
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
  document.getElementById("nameRace1").innerHTML =
    localStorage.getItem("name") + " the " + localStorage.getItem("race");
  document.getElementById("yourHealth1").innerHTML =
    "Your health - " + localStorage.getItem("health");
  document.getElementById("yourLevel1").innerHTML =
    "Your Level - " + localStorage.getItem("level");
  document.getElementById("yourGold1").innerHTML =
    "Your Gold - " + localStorage.getItem("gold");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "block";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "none";
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
  var actions = document.getElementById("actions");
  var fightoutput1 = document.getElementById("fightoutput1");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "block";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "none";
  fightoutput1.style.display = "none";
  var r = Math.round(Math.random() * 10);
  var c = Math.round(Math.random() * 10);
  if (localStorage.getItem("creature")) {
    document.getElementById("fightoutput").innerHTML = "You Slayed the " + 
    localStorage.getItem("creature") +
    " and found " +
    r + " gold";
    var g = localStorage.getItem("gold");
    var newgold = g + r;
    localStorage.setItem("gold",newgold);
    actions.style.display = "none";
  } else {
    if (r <= 7) {
      actions.style.display = "block";
      if (c <= 5) {
        var creatureLevel = localStorage.getItem("level") + c;
        var creaturehealth = Math.ceil(creatureLevel * 2);
        document.getElementById("fightoutput").innerHTML =
          "A Level " +
          creatureLevel +
          " Wolf approaches with " +
          creaturehealth +
          " health";
        localStorage.setItem("creature", "wolf");
        localStorage.setItem("creaturelevel", creatureLevel);
        localStorage.setItem("creaturehealth", creaturehealth);
      } else {
        var creatureLevel = localStorage.getItem("level") + c;
        var creaturehealth = Math.ceil(creatureLevel * 2);
        document.getElementById("fightoutput").innerHTML =
          "A Level " +
          creatureLevel +
          " Orc approaches with " +
          creaturehealth +
          " health";
        localStorage.setItem("creature", "orc");
        localStorage.setItem("creaturelevel", creatureLevel);
        localStorage.setItem("creaturehealth", creaturehealth);
      }
    } else {
      document.getElementById("fightoutput").innerHTML = "You found nothing";
      actions.style.display = "none";
    }
  }
}

function Attack() {
  var fightoutput1 = document.getElementById("fightoutput1");
  fightoutput1.style.display = "block";
  var creature = localStorage.getItem("creature");
  var creatureLevel = localStorage.getItem("creaturelevel");
  var creaturehealth = localStorage.getItem("creaturehealth");
  var d = Math.round(Math.random() * 5);
  var r = Math.round(Math.random() * 10);
  var attackdamage = localStorage.getItem("level") + r;

  document.getElementById("fightoutput").innerHTML =
    "You dealt " + attackdamage + " damage\n";
  var temphealth = creaturehealth - attackdamage;
  document.getElementById("fightoutput1").innerHTML =
    "You lost " + d + " health\n" +
    creature + " health at " + temphealth;
  localStorage.setItem("creaturehealth", creaturehealth - attackdamage);
  var health = localStorage.getItem("health")
  localStorage.setItem("health", health - d);
  if (temphealth <= 0) {
    Fight();
  }
}

function Defend() {
  var fightoutput1 = document.getElementById("fightoutput1");
  fightoutput1.style.display = "block";
  var creature = localStorage.getItem("creature");
  var creatureLevel = localStorage.getItem("creaturelevel");
  var creaturehealth = localStorage.getItem("creaturehealth");
  var d = (Math.round(Math.random() * 5))/2;
  var r = Math.round(Math.random() * 10);
  var attackdamage = (localStorage.getItem("level") + r)/2;

  document.getElementById("fightoutput").innerHTML =
    "You dealt " + attackdamage + " damage\n";
  var temphealth = creaturehealth - attackdamage;
  document.getElementById("fightoutput1").innerHTML =
    "You lost " + d + " health"
    creature + " health at " + temphealth;
  localStorage.setItem("creaturehealth", creaturehealth - attackdamage);
  var health = localStorage.getItem("health")
  localStorage.setItem("health", health - d);
  if (temphealth <= 0) {
    Fight();
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
  if (r <= 7) {
    if (c <= 5) {
    }
  } else {
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
  if (r <= 7) {
    if (c <= 5) {
    }
  } else {
  }
}
