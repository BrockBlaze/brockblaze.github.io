function gameStart() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  if (!localStorage.getItem("name") && !localStorage.getItem("race")) {
    newPlayerCreation.style.display = "none";
    gameMenu.style.display = "none";
    gamePlay.style.display = "none";
    fight.style.display = "none";
    town.style.display = "none";
    home.style.display = "none";
  }
  if (localStorage.getItem("name") && !localStorage.getItem("race")) {
    newPlayer.style.display = "none";
    gameMenu.style.display = "none";
    gamePlay.style.display = "none";
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
    if (race == "Human") {
      localStorage.setItem("health", 100);
      localStorage.setItem("level", 1);
      localStorage.setItem("gold", 0);
      localStorage.setItem("swordLevel", 0);
      localStorage.setItem("armorLevel", 0);
      localStorage.setItem("potions", 0);
    }
    if (race == "Elf") {
      localStorage.setItem("health", 100);
      localStorage.setItem("level", 1);
      localStorage.setItem("gold", 10);
      localStorage.setItem("swordLevel", 0);
      localStorage.setItem("armorLevel", 0);
      localStorage.setItem("potions", 0);
    }
    if (race == "Dwarf") {
      localStorage.setItem("health", 120);
      localStorage.setItem("level", 1);
      localStorage.setItem("gold", 20);
      localStorage.setItem("swordLevel", 0);
      localStorage.setItem("armorLevel", 0);
      localStorage.setItem("potions", 0);
    }
    if (race == "Wizard") {
      localStorage.setItem("health", 80);
      localStorage.setItem("level", 1);
      localStorage.setItem("gold", 0);
      localStorage.setItem("swordLevel", 0);
      localStorage.setItem("armorLevel", 0);
      localStorage.setItem("potions", 5);
    }
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
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  fight.style.display = "none";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "block";
  localStorage.removeItem("creature");
  setInterval(SetHeroInfo, 10);
}

function SetHeroInfo() {
  var PlayerInfo = document.getElementById("PlayerInfo");
  var heroName = document.getElementById("heroName");
  var heroRace = document.getElementById("heroRace");
  var heroHealth = document.getElementById("heroHealth");
  var heroGold = document.getElementById("heroGold");
  var heroPotions = document.getElementById("heroPotions");
  PlayerInfo.style.display = "block";
  heroName.innerHTML = localStorage.getItem("name");
  heroRace.innerHTML =
    localStorage.getItem("race") + " - " + localStorage.getItem("level");
  heroHealth.innerHTML = "Health - " + localStorage.getItem("health");
  heroGold.innerHTML = "Gold - " + localStorage.getItem("gold");
  heroPotions.innerHTML = "Potions - " + localStorage.getItem("potions");
  var health = parseInt(localStorage.getItem("health"));
  if (health <= 0) {
    Dealth();
  }
}

function Dealth() {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem("name");
    localStorage.removeItem("race");
  }
  location.reload();
  document.getElementById("deathMessage").style.display = "block";
  return false;
}

function Fight() {
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  var actions = document.getElementById("actions");
  var fightoutput1 = document.getElementById("fightoutput1");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  fight.style.display = "block";
  town.style.display = "none";
  home.style.display = "none";
  gamePlay.style.display = "none";
  fightoutput1.style.display = "none";
  var r = Math.round(Math.random() * 10);
  var c = Math.round(Math.random() * 10);
  if (localStorage.getItem("creature")) {
    document.getElementById("fightoutput").innerHTML =
      "You Slayed the " +
      localStorage.getItem("creature") +
      " and found " +
      r +
      " gold";
    var g = localStorage.getItem("gold");
    var gold = parseInt(g);
    localStorage.setItem("gold", gold + r);
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
  var swordLevel = parseInt(localStorage.getItem("swordLevel"));
  var armorLevel = parseInt(localStorage.getItem("armorLevel"));
  if (swordLevel == 0) {
    swordLevel = 1;
  }
  if (armorLevel == 0) {
    armorLevel = 1;
  }
  var d = Math.round(Math.random() * 20) / armorLevel;
  var r = Math.round(Math.random() * 10) * swordLevel;
  var attackdamage = localStorage.getItem("level") + r;

  document.getElementById("fightoutput").innerHTML =
    "You dealt " + attackdamage + " damage";
  var temphealth = creaturehealth - attackdamage;
  document.getElementById("fightoutput1").innerHTML =
    "You lost " + d + " health<br>" + creature + " health at " + temphealth;
  localStorage.setItem("creaturehealth", creaturehealth - attackdamage);
  var health = localStorage.getItem("health");
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
  var swordLevel = parseInt(localStorage.getItem("swordLevel"));
  var armorLevel = parseInt(localStorage.getItem("armorLevel"));
  if (swordLevel == 0) {
    swordLevel = 1;
  }
  if (armorLevel == 0) {
    armorLevel = 1;
  }
  var d = Math.round(Math.random() * 20) / armorLevel / 2;
  var r = Math.round(Math.random() * 10) * swordLevel;
  var attackdamage = (localStorage.getItem("level") + r) / 2;

  document.getElementById("fightoutput").innerHTML =
    "You dealt " + attackdamage + " damage\n";
  var temphealth = creaturehealth - attackdamage;
  document.getElementById("fightoutput1").innerHTML =
    "You lost " + d + " health";
  creature + " health at " + temphealth;
  localStorage.setItem("creaturehealth", creaturehealth - attackdamage);
  var health = localStorage.getItem("health");
  localStorage.setItem("health", health - d);
  if (temphealth <= 0) {
    Fight();
  }
}

function UsePotion() {
  var potions = parseInt(localStorage.getItem("potions"));
  var health = parseInt(localStorage.getItem("health"));
  if (localStorage.getItem("potions") > 0) {
    localStorage.setItem("potions", potions - 1);
    localStorage.setItem("health", health + 25);
    document.getElementById("fightoutput").innerHTML = "You used a Health Potion";
    if (
      localStorage.getItem("race") == "Human" ||
      localStorage.getItem("race") == "Elf"
    ) {
      if (health >= 100) {
        localStorage.setItem("health", 100);
      }
    }
    if (localStorage.getItem("race") == "Dwarf") {
      if (health >= 120) {
        localStorage.setItem("health", 120);
      }
    }
    if (localStorage.getItem("race") == "Wizard") {
      if (health >= 80) {
        localStorage.setItem("health", 80);
      }
    }
  }else {
    document.getElementById("fightoutput").innerHTML = "You don't have a Health Potion";
  }
}

function Town() {
  document.getElementById("townoutput").innerHTML =
    "Welcome to the Town Center";
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
  fight.style.display = "none";
  town.style.display = "block";
  home.style.display = "none";
  gamePlay.style.display = "none";
  var swordButton = document.getElementById("sword");
  var swordCost = document.getElementById("swordCost");
  var armorButton = document.getElementById("armor");
  var armorCost = document.getElementById("armorCost");
  var swordLevel = localStorage.getItem("swordLevel");
  var armorLevel = localStorage.getItem("armorLevel");
  if (localStorage.getItem("race") == "Human") {
    if (swordLevel == 0) {
      swordButton.value = "Bronze Sword";
      swordCost.innerHTML = " - 10$";
      localStorage.setItem("swordType", "Bronze Sword");
    }
    if (armorLevel == 0) {
      armorButton.value = "Leather Armor";
      armorCost.innerHTML = " - 10$";
      localStorage.setItem("armorType", "Leather Armor");
    }
    if (swordLevel == 1) {
      swordButton.value = "Iron Sword";
      swordCost.innerHTML = " - 50$";
      localStorage.setItem("swordType", "Iron Sword");
    }
    if (armorLevel == 1) {
      armorButton.value = "ChainMail Armor";
      armorCost.innerHTML = " -50$";
      localStorage.setItem("armorType", "ChainMail Armor");
    }
    if (swordLevel == 2) {
      swordButton.value = "Steel Sword";
      swordCost.innerHTML = " - 100$";
      localStorage.setItem("swordType", "Steel Sword");
    }
    if (armorLevel == 2) {
      armorButton.value = "Iron Plate Armor";
      armorCost.innerHTML = " - 100$";
      localStorage.setItem("armorType", "Iron Plate Armor");
    }
    if (swordLevel == 3) {
      swordButton.value = "N/A";
      swordCost.innerHTML = " - N/A";
    }
    if (armorLevel == 3) {
      armorButton.value = "N/A";
      armorCost.innerHTML = " - N/A";
    }
  }
  if (localStorage.getItem("race") == "Elf") {
    if (swordLevel == 0) {
      swordButton.value = "Bronze Dagger";
      swordCost.innerHTML = " - 10$";
      localStorage.setItem("swordType", "Bronze Dagger");
    }
    if (armorLevel == 0) {
      armorButton.value = "Leather Armor";
      armorCost.innerHTML = " - 10$";
      localStorage.setItem("armorType", "Leather Armor");
    }
    if (swordLevel == 1) {
      swordButton.value = "Iron Dagger";
      swordCost.innerHTML = " - 50$";
      localStorage.setItem("swordType", "Iron Dagger");
    }
    if (armorLevel == 1) {
      armorButton.value = "ChainMail Armor";
      armorCost.innerHTML = " -50$";
      localStorage.setItem("armorType", "ChainMail Armor");
    }
    if (swordLevel == 2) {
      swordButton.value = "Elvish Curved Blade";
      swordCost.innerHTML = " - 100$";
      localStorage.setItem("swordType", "Elvish Curved Blade");
    }
    if (armorLevel == 2) {
      armorButton.value = "Elven Armor";
      armorCost.innerHTML = " - 100$";
      localStorage.setItem("armorType", "Elven Armor");
    }
    if (swordLevel == 3) {
      swordButton.value = "N/A";
      swordCost.innerHTML = " - N/A";
    }
    if (armorLevel == 3) {
      armorButton.value = "N/A";
      armorCost.innerHTML = " - N/A";
    }
  }
  if (localStorage.getItem("race") == "Dwarf") {
    if (swordLevel == 0) {
      swordButton.value = "Bronze Axe";
      swordCost.innerHTML = " - 10$";
      localStorage.setItem("swordType", "Bronze Axe");
    }
    if (armorLevel == 0) {
      armorButton.value = "Leather Armor";
      armorCost.innerHTML = " - 10$";
      localStorage.setItem("armorType", "Leather Armor");
    }
    if (swordLevel == 1) {
      swordButton.value = "Double Headed Axe";
      swordCost.innerHTML = " - 50$";
      localStorage.setItem("swordType", "Double Headed Axe");
    }
    if (armorLevel == 1) {
      armorButton.value = "Steel Armor";
      armorCost.innerHTML = " -50$";
      localStorage.setItem("armorType", "Steel Armor");
    }
    if (swordLevel == 2) {
      swordButton.value = "War Hammer";
      swordCost.innerHTML = " - 100$";
      localStorage.setItem("swordType", "War Hammer");
    }
    if (armorLevel == 2) {
      armorButton.value = "Dwarven Armor";
      armorCost.innerHTML = " - 100$";
      localStorage.setItem("armorType", "Dwarven Armor");
    }
    if (swordLevel == 3) {
      swordButton.value = "N/A";
      swordCost.innerHTML = " - N/A";
    }
    if (armorLevel == 3) {
      armorButton.value = "N/A";
      armorCost.innerHTML = " - N/A";
    }
  }
  if (localStorage.getItem("race") == "Wizard") {
    if (swordLevel == 0) {
      swordButton.value = "Wooden Staff";
      swordCost.innerHTML = " - 10$";
      localStorage.setItem("swordType", "Wooden Staff");
    }
    if (armorLevel == 0) {
      armorButton.value = "Brown Robe";
      armorCost.innerHTML = " - 10$";
      localStorage.setItem("armorType", "Brown Robe");
    }
    if (swordLevel == 1) {
      swordButton.value = "Steel Staff";
      swordCost.innerHTML = " - 50$";
      localStorage.setItem("swordType", "Steel Staff");
    }
    if (armorLevel == 1) {
      armorButton.value = "Blue Robe";
      armorCost.innerHTML = " -50$";
      localStorage.setItem("armorType", "Blue Robe");
    }
    if (swordLevel == 2) {
      swordButton.value = "White Staff";
      swordCost.innerHTML = " - 100$";
      localStorage.setItem("swordType", "White Staff");
    }
    if (armorLevel == 2) {
      armorButton.value = "Pure White Robe";
      armorCost.innerHTML = " - 100$";
      localStorage.setItem("armorType", "Pure White Robe");
    }
    if (swordLevel == 3) {
      swordButton.value = "N/A";
      swordCost.innerHTML = " - N/A";
    }
    if (armorLevel == 3) {
      armorButton.value = "N/A";
      armorCost.innerHTML = " - N/A";
    }
  }
}

function BuyS() {
  var swordLevel = localStorage.getItem("swordLevel");
  var swordCost = 0;
  if (swordLevel == 0) {
    swordCost = 10;
  }
  if (swordLevel == 1) {
    swordCost = 50;
  }
  if (swordLevel == 2) {
    swordCost = 100;
  }
  if (localStorage.getItem("gold") >= swordCost) {
    document.getElementById("townText").innerHTML =
      "You bought a " + localStorage.getItem("swordType");
    var g = localStorage.getItem("gold");
    var gold = parseInt(g);
    localStorage.setItem("gold", gold - swordCost);
    var sl = localStorage.getItem("swordLevel");
    var sLevel = parseInt(sl);
    localStorage.setItem("swordLevel", sLevel + 1);
    Town();
  } else {
    document.getElementById("townText").innerHTML =
      "You don't have enough to buy a " + localStorage.getItem("swordType");
  }
}

function BuyA() {
  var armorLevel = localStorage.getItem("armorLevel");
  var armorCost = 0;
  if (armorLevel == 0) {
    armorCost = 10;
  }
  if (armorLevel == 1) {
    armorCost = 50;
  }
  if (armorLevel == 2) {
    armorCost = 100;
  }
  if (localStorage.getItem("gold") >= armorCost) {
    document.getElementById("townText").innerHTML =
      "You bought a " + localStorage.getItem("armorType");
    var g = localStorage.getItem("gold");
    var gold = parseInt(g);
    localStorage.setItem("gold", gold - armorCost);
    var al = localStorage.getItem("armorLevel");
    var aLevel = parseInt(al);
    localStorage.setItem("armorLevel", aLevel + 1);
    Town();
  } else {
    document.getElementById("townText").innerHTML =
      "You don't have enough to buy a " + localStorage.getItem("armorType");
  }
}

function BuyP() {
  if (localStorage.getItem("gold") >= 25) {
    document.getElementById("townText").innerHTML =
      "You bought a Health Potion";
    var g = localStorage.getItem("gold");
    var gold = parseInt(g);
    localStorage.setItem("gold", gold - 25);
    var p = localStorage.getItem("potions");
    var potions = parseInt(p);
    localStorage.setItem("potions", potions + 1);
  } else {
    document.getElementById("townText").innerHTML =
      "You don't have enough to buy a Health Potion";
  }
}

function Home() {
  document.getElementById("homeoutput").innerHTML = "Welcome Home";
  var newPlayer = document.getElementById("newPlayer");
  var gameMenu = document.getElementById("gameMenu");
  var newPlayerCreation = document.getElementById("newPlayerCreation");
  var gamePlay = document.getElementById("gamePlay");
  var fight = document.getElementById("fight");
  var town = document.getElementById("town");
  var home = document.getElementById("home");
  newPlayer.style.display = "none";
  newPlayerCreation.style.display = "none";
  gameMenu.style.display = "none";
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
  document.getElementById("homeoutput").innerHTML = "Sleeping...";
  var r = Math.round(Math.random() * 10);
  if (r > 6) {
    setTimeout(sleepingDone, 8000);
  } else {
    setTimeout(sleepingDone, 4000);
  }
}

function sleepingDone() {
  var r = Math.round(Math.random() * 10);
  if (r > 6) {
    document.getElementById("homeoutput").innerHTML =
      "You slept well and gain " + r + " health";
    var h = localStorage.getItem("health");
    var health = parseInt(h);
    localStorage.setItem("health", health + r);
  } else {
    document.getElementById("homeoutput").innerHTML =
      "You slept alright and gain " + r + " health";
    var h = localStorage.getItem("health");
    var health = parseInt(h);
    localStorage.setItem("health", health + r);
  }
  if (
    localStorage.getItem("race") == "Human" ||
    localStorage.getItem("race") == "Elf"
  ) {
    if (health >= 100) {
      localStorage.setItem("health", 100);
    }
  }
  if (localStorage.getItem("race") == "Dwarf") {
    if (health >= 120) {
      localStorage.setItem("health", 120);
    }
  }
  if (localStorage.getItem("race") == "Wizard") {
    if (health >= 80) {
      localStorage.setItem("health", 80);
    }
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
  if (r <= 2) {
    document.getElementById("homeoutput").innerHTML =
      "You trained and gain a level";
    localStorage.setItem("level", level + 1);
  } else {
    document.getElementById("homeoutput").innerHTML =
      "You trained but didn't gain a level";
  }
}
