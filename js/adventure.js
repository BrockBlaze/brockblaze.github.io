window.onload = function () {
  Start();
};

var intervalId = window.setInterval(function () {
  Update();
}, 10);

var Name = "John";
var Character = "Human";
var Level = 1;
var Health = 100;
var Potions = 0;
var Coins = 0;

var StatsMenu = document.getElementById("aStats");
var Startgame = document.getElementById("aNewGame");
var NewGameMenu = document.getElementById("aStartGame");
var ContinueGameMenu = document.getElementById("aContinueGame");
var ChoiceGameMenu = document.getElementById("aChoiceGame");
var WoodsMenu = document.getElementById("aWoods");
var HomeMenu = document.getElementById("aHome");
var ShopMenu = document.getElementById("aShop");

var homeMessage = document.getElementById("aHomeMessage");
var Buttons = document.getElementById("aBtn");

function Start() {
  if (localStorage.getItem("name") != null) {
    GetSave();
    CloseAllMenues();
    document.getElementById("aGreetName").innerText = Name;
    ContinueGameMenu.style.display = "block";
  } else {
    CloseAllMenues();
    Startgame.style.display = "block";
  }
}

function StartNewGame() {
  CloseAllMenues();
  NewGameMenu.style.display = "block";
}

function StartGame() {
  CloseAllMenues();
  Name = document.getElementById("nameSubmit").value;
  DropDown = document.getElementById("characterSubmit");
  cValue = DropDown.value;
  Character = DropDown.options[DropDown.selectedIndex].text;
  if (Character == "Human")
  {
    Health = 100;
    Level = 1;
    Potions = 5;
    Coins = 5;
  }
  if (Character == "Wizard")
  {
    Health = 80;
    Level = 1;
    Potions = 20;
    Coins = 0;
  }
  if (Character == "Dwarf")
  {
    Health = 120;
    Level = 1;
    Potions = 0;
    Coins = 20;
  }
  ChoiceGameMenu.style.display = "block";
  Save();
}

function StartChoiceGame() {
  CloseAllMenues();
  ChoiceGameMenu.style.display = "block";
}

function CloseAllMenues() {
  CloseAllMenues();
  NewGameMenu.style.display = "block";
}

function GetSave() {
  Name = localStorage.getItem("name");
  Character = localStorage.getItem("character");
  Level = localStorage.getItem("level");
  Health = localStorage.getItem("health");
  Potions = localStorage.getItem("potions");
  Coins = localStorage.getItem("coins");
}

function Save() {
  localStorage.setItem("name", Name);
  localStorage.setItem("character", Character);
  localStorage.setItem("level", Level);
  localStorage.setItem("health", Health);
  localStorage.setItem("potions", Potions);
  localStorage.setItem("coins", Coins);
}

function DeletePlayer() {
  if (typeof Storage !== "undefined") {
    localStorage.removeItem("name");
    localStorage.removeItem("race");
  }
  location.reload();
  return false;
}

function CloseAllMenues() {
  Startgame.style.display = "none";
  NewGameMenu.style.display = "none";
  ContinueGameMenu.style.display = "none";
  ChoiceGameMenu.style.display = "none";
  WoodsMenu.style.display = "none";
  HomeMenu.style.display = "none";
  ShopMenu.style.display = "none";
}

function Update() {
  document.getElementById("aName").innerText = Name;
  document.getElementById("aCharacter").innerText = Character;
  document.getElementById("aLevel").innerText = Level;
  document.getElementById("aHealth").innerText = Health;
  document.getElementById("aPotions").innerText = Potions;
  document.getElementById("aCoins").innerText = Coins;
}


function Woods() {
    CloseAllMenues();
    WoodsMenu.style.display = "block";
}

function Home() {
    CloseAllMenues();
    HomeMenu.style.display = "block";
}

function Shop() {
    CloseAllMenues();
    ShopMenu.style.display = "block";
}

function Train() {
  Health -= 1;
  Level ++;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function Rest() {
  if (Health < 100)
  {
    Buttons.style.display = "none";
    homeMessage.innerHTML = "Sleeping <br> |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|"
    Update();
    await sleep(1000);
    homeMessage.innerHTML = "Sleeping <br> |_&nbsp;&nbsp;&nbsp;&nbsp;|"
    Update();
    await sleep(1000);
    homeMessage.innerHTML = "Sleeping <br> |__&nbsp;&nbsp;&nbsp;|"
    Update();
    await sleep(1000);
    homeMessage.innerHTML = "Sleeping <br> |___&nbsp;&nbsp;|"
    Update();
    await sleep(1000);
    homeMessage.innerHTML = "Sleeping <br> |____&nbsp;|"
    Update();
    await sleep(1000);
    homeMessage.innerHTML = "Sleeping <br> |_____|"
    Update();
    await sleep(250);
    homeMessage.innerHTML = "Game Saved <br> Health Restored"
    if ((Health + 25) < 100)
    {
      Health += 25;
    }
    else
    {
      Health = 100;
    }
    Save();
    Buttons.style.display = "block";
    Update();
    await sleep(2000);
    homeMessage.innerHTML = " "
  }
  else
  {
    homeMessage.innerHTML = "You don't need to Sleep"
    Update();
    await sleep(1000);
    Save();
    homeMessage.innerHTML = "Game Saved <br> Health Restored"
    Update();
    await sleep(2000);
    homeMessage.innerHTML = " "
  }
}