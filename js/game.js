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
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  stats.style.display = "none";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "block";
  localStorage.removeItem("creature");
  setInterval(SetHeroInfo, 10);
}

function SetHeroInfo() {
  var PlayerInfo = document.getElementById("PlayerInfo")
  var heroName = document.getElementById("heroName");
  var heroRace = document.getElementById("heroRace");
  var heroHealth = document.getElementById("heroHealth");
  var heroGold = document.getElementById("heroGold");
  PlayerInfo.style.display = "block";
  heroName.innerHTML = localStorage.getItem("name");
  heroRace.innerHTML = localStorage.getItem("race") + " - " + localStorage.getItem("level");
  heroHealth.innerHTML = "Health - " + localStorage.getItem("health");
  heroGold.innerHTML = "Gold - " + localStorage.getItem("gold");
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
    var gold = parseInt(g);
    localStorage.setItem("gold", (gold + r));
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
        localStorage.setItem("creature", "Wolf");
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
        localStorage.setItem("creature", "Orc");
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
    "You dealt " + attackdamage + " damage";
  var temphealth = creaturehealth - attackdamage;
  document.getElementById("fightoutput1").innerHTML =
    "You lost " + d + " health<br>" +
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
  document.getElementById("townoutput").innerHTML = "Welcome to the Town Center";
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
  var swordButton = document.getElementById("sword");
  var swordCost = document.getElementById("swordCost");
  var armorButton = document.getElementById("armor");
  var armorCost = document.getElementById("armorCost");
  swordButton.value = "Bronze Sword"
  swordCost.innerHTML = " - 10$"
  armorButton.value = "Leather Armor"
  armorCost.innerHTML = " - 10$"
}




function Home() {
  document.getElementById("homeoutput").innerHTML = "Welcome Home";
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

function Sleep() {
  var h = localStorage.getItem("health");
  var health = parseInt(h);
  localStorage.setItem("health", health + 10);
  if (localStorage.getItem("health") < 100)
  {
    document.getElementById("homeoutput").innerHTML = "You slept and gain 10 health";
  }
  if (localStorage.getItem("health") >= 100)
  {
    document.getElementById("homeoutput").innerHTML = "You Don't need to sleep";
    localStorage.setItem("health", 100);
  }
  
}

function Train() {
  document.getElementById("homeoutput").innerHTML = "Training|_____|";
  setTimeout(l0, 1000);
  setTimeout(l1, 2000);
  setTimeout(l2, 3000);
  setTimeout(l3, 4000);
  setTimeout(l4, 5000);

  setTimeout(trainDone, 5200);
}

function l0() {
  document.getElementById("homeoutput").innerHTML = "Training|-____|";
}
function l1() {
  document.getElementById("homeoutput").innerHTML = "Training|--___|";
}
function l2() {
  document.getElementById("homeoutput").innerHTML = "Training|---__|";
}
function l3() {
  document.getElementById("homeoutput").innerHTML = "Training|----_|";
}
function l4() {
  document.getElementById("homeoutput").innerHTML = "Training|-----|";
}

function trainDone() {
  var l = localStorage.getItem("level");
  var level = parseInt(l);
  var r = Math.round(Math.random() * 10);
  if (r <= 2)
  {
    document.getElementById("homeoutput").innerHTML = "You trained and gain a level";
    localStorage.setItem("level", level + 1);
  } else {
    document.getElementById("homeoutput").innerHTML = "You trained but didn't gain a level";
  }
}