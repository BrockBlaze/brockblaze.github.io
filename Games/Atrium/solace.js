const MenuStart = document.getElementById("gStart");
const MenuNewPlayer = document.getElementById("gNewPlayer");
const MenuLoadPlayer = document.getElementById("gLoadPlayer");
const MenuGame = document.getElementById("gGame");
const MenuWoods = document.getElementById("gWoods");
const MenuBattle = document.getElementById("gBattle");
const MenuStore = document.getElementById("gStore");
const PlayerStatsMenu = document.getElementById("gPlayerStats");
const EnemyStatsMenu = document.getElementById("gEnemyStats");
var enter = document.getElementById("StartBtn");

var PlayerName = "Bob";
var Health = 100;
var Mana = 100;
var Level = 1;
var XP = 0;
var Attack = 10;
var Magic = 10;
var Defence = 5;
var Armor = "Leather Armor";
var Weapon = "Wooden Sword";
var Staff = "Wooden Staff";
var Potions = 2;
var Gold = 5;

var maxHealth = 100;
var maxMana = 100;

var weaponToBuy = "Wooden Sword";
var weaponcost = 20;

var staffToBuy = "Wooden Staff";
var staffcost = 35;

var armorToBuy = "Leather Armor";
var armorcost = 20;

var EnemyName = "Bob";
var EnemyHealth = 100;
var EnemyAttack = 10;
var XPToGain = 0;

window.onload = StartFunction;

function StartFunction() {
    MainMenu();
}

function UpdatePlayerStats() {
    PlayerStatsMenu.style.display = "block";
    document.getElementById("playerName").innerHTML = PlayerName;
    document.getElementById("playerLevel").innerHTML = Level;
    document.getElementById("playerHealth").innerHTML = Health;
    document.getElementById("playerMana").innerHTML = Mana;
    document.getElementById("playerArmor").innerHTML = Armor;
    document.getElementById("playerWeapon").innerHTML = Weapon;
    document.getElementById("playerStaff").innerHTML = Staff;
    document.getElementById("playerAttack").innerHTML = Attack;
    document.getElementById("playerMagic").innerHTML = Magic;
    document.getElementById("playerDefence").innerHTML = Defence;
    document.getElementById("playerGold").innerHTML = Gold;
    document.getElementById("playerPotion").innerHTML = Potions;
}

function UpdateEnemyStats() {
    EnemyStatsMenu.style.display = "block";
    document.getElementById("enemyName").innerHTML = EnemyName;
    document.getElementById("enemyHealth").innerHTML = EnemyHealth;
    document.getElementById("enemyAttack").innerHTML = EnemyAttack;
}

function clearMenus() {
    MenuStart.style.display = "none";
    MenuNewPlayer.style.display = "none";
    MenuLoadPlayer.style.display = "none";
    MenuGame.style.display = "none";
    MenuWoods.style.display = "none";
    MenuStore.style.display = "none";
    MenuBattle.style.display = "none";
    EnemyStatsMenu.style.display = "none";
}

function MainMenu() {
    clearMenus();
    PlayerStatsMenu.style.display = "none";
    EnemyStatsMenu.style.display = "none";
    enter = document.getElementById("StartBtn");
    MenuStart.style.display = "flex";
}

function GameMenu() {
    clearMenus();
    MenuGame.style.display = "flex";
    UpdatePlayerStats();
}

function ReturnHome() {
    GameMenu();
    UpdatePlayerStats();
    document.getElementById("gGameM").innerHTML = "Welcome Back,<br>" + PlayerName + "!";
}

function NewGame() {
    clearMenus();

    enter = document.getElementById("PlayBtn");
    MenuNewPlayer.style.display = "flex";
    document.getElementById("nameInput").select();
}

function LoadGame() {
    clearMenus();
    enter = document.getElementById("LoadBtn");
    MenuLoadPlayer.style.display = "flex"
    document.getElementById("loadnameInput").select();
}

function CreatePlayer() {
    var loadname = document.getElementById("nameInput").value;
    var Data = localStorage.getItem(loadname + "Data");

    if (Data != null) {
        alert(loadname + " already exists, please choose a different name or load the game");
    }
    else {

        PlayerName = document.getElementById("nameInput").value;
        if (PlayerName != "") {
            PlayerName = document.getElementById("nameInput").value;
            Health = 100;
            Mana = 100;
            Level = 1;
            XP = 0;
            Attack = 10;
            Magic = 10;
            Defence = 5;
            Armor = "Leather Armor";
            Weapon = "Wooden Sword";
            Staff = "Wooden Staff";
            Potions = 2;
            Gold = 5;

            var PlayerData = {
                'name': PlayerName,
                'Health': Health,
                'Mana': Mana,
                'Level': Level,
                'XP': XP,
                "Attack": Attack,
                "Magic": Magic,
                "Defence": Defence,
                "Armor": Armor,
                "Weapon": Weapon,
                "Staff": Staff,
                "Potions": Potions,
                "Gold": Gold
            };
            localStorage.setItem(PlayerName + "Data", JSON.stringify(PlayerData));

            UpdatePlayerStats();
            GameMenu();
            document.getElementById("gGameM").innerHTML = "Welcome Home,<br>" + PlayerName + "!";
        }
        else {
            alert("Please enter a name");
        }
    }
}

function LoadPlayer() {
    var loadname = document.getElementById("loadnameInput").value;

    var Data = localStorage.getItem(loadname + "Data");

    //console.log("Data", JSON.parse(Data));
    if (Data != null) {
        PlayerName = JSON.parse(Data).name;
        Health = JSON.parse(Data).Health;
        Mana = JSON.parse(Data).Mana;
        Level = JSON.parse(Data).Level;
        XP = JSON.parse(Data).XP;
        Attack = JSON.parse(Data).Attack;
        Magic = JSON.parse(Data).Magic;
        Defence = JSON.parse(Data).Defence;
        Potions = JSON.parse(Data).Potions;
        Armor = JSON.parse(Data).Armor;
        Weapon = JSON.parse(Data).Weapon;
        Staff = JSON.parse(Data).Staff;
        Gold = JSON.parse(Data).Gold;

        maxHealth = 100 + (Level * 10);
        maxMana = 100 + (Level * 10);

        UpdatePlayerStats();
        GameMenu();
        document.getElementById("gGameM").innerHTML = "Welcome Back,<br>" + PlayerName + "!";
    }
    else {
        alert(loadname + " not found make sure you spelled it right");
    }
}

function SaveGame() {
    var PlayerData = {
        'name': PlayerName,
        'Health': Health,
        'Mana': Mana,
        'Level': Level,
        'XP': XP,
        "Attack": Attack,
        "Magic": Magic,
        "Defence": Defence,
        "Armor": Armor,
        "Weapon": Weapon,
        "Staff": Staff,
        "Potions": Potions,
        'Gold': Gold
    };
    localStorage.setItem(PlayerName + "Data", JSON.stringify(PlayerData));

    alert("Game Saved");
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function MakeRandomEnemy() {
    var r = getRandomIntInclusive(1, 5);
    console.log(r);

    switch (r) {
        case 1:
            EnemyName = "Wolf";
            EnemyHealth = 50;
            EnemyAttack = 10;
            XPToGain = 10;
            break;
        case 2:
            EnemyName = "Bear";
            EnemyHealth = 100;
            EnemyAttack = 15;
            XPToGain = 20;
            break;
        case 3:
            EnemyName = "Dragon";
            EnemyHealth = 200;
            EnemyAttack = 25;
            XPToGain = 50;
            break;
        case 4:
            EnemyName = "Orc";
            EnemyHealth = 150;
            EnemyAttack = 20;
            XPToGain = 30;
            break;
        case 5:
            EnemyName = "Goblin";
            EnemyHealth = 80;
            EnemyAttack = 12;
            XPToGain = 15;
            break;
        default:
            EnemyName = "Wolf";
            EnemyHealth = 50;
            EnemyAttack = 10;
            XPToGain = 10;
            break;
    }

    UpdateEnemyStats();
}

function WoodsMenu() {
    clearMenus();
    MenuWoods.style.display = "flex";
    document.getElementById("gWoodsM").innerHTML = "You arrive at the Woods";
}

function BattleMenu() {
    clearMenus();
    MakeRandomEnemy();
    document.getElementById("gBattleM").innerHTML = "You encounter a " + EnemyName + "!";
    EnemyStatsMenu.style.display = "block";
    MenuBattle.style.display = "flex";
}

function useAttack() {
    var damage = getRandomIntInclusive(Attack - 3, Attack + 3);
    EnemyHealth -= damage;
    document.getElementById("gBattleM").innerHTML = "You hit the " + EnemyName + " for " + damage + " damage!";
    if (EnemyHealth <= 0) {
        WoodsMenu();
        var g = getRandomIntInclusive(5, 20);
        Gold += g;
        XP += XPToGain;
        document.getElementById("gWoodsM").innerHTML = "You defeated the " + EnemyName + "!";
        document.getElementById("gWoodsM").innerHTML += "</br>You found " + g + " gold!";
        UpdatePlayerStats();
    }
    else {
        var eDamage = getRandomIntInclusive(EnemyAttack - 3, EnemyAttack + 3);
        eDamage -= getRandomIntInclusive(Defence - 5, Defence + 5);
        if (eDamage <= 0) { eDamage = 1; }
        Health -= eDamage;
        document.getElementById("gBattleM").innerHTML += "</br>The " + EnemyName + " hit you for " + eDamage + " damage!";
    }

    document.getElementById("enemyHealth").innerHTML = EnemyHealth;
    UpdatePlayerStats();
}

function useMagic() {
    if (Mana > 10) {
        Mana -= 10;
        var damage = getRandomIntInclusive(Magic - 3, Magic + 3);
        EnemyHealth -= damage;
        document.getElementById("gBattleM").innerHTML = "You hit the " + EnemyName + " for " + damage + " damage!";
        if (EnemyHealth <= 0) {
            WoodsMenu();
            var g = getRandomIntInclusive(5, 20);
            Gold += g;
            XP += XPToGain;
            document.getElementById("gWoodsM").innerHTML = "You defeated the " + EnemyName + "!";
            document.getElementById("gWoodsM").innerHTML += "</br>You found " + g + " gold!";
            UpdatePlayerStats();
        }
        else {
            var eDamage = getRandomIntInclusive(EnemyAttack - 3, EnemyAttack + 3);
            eDamage -= getRandomIntInclusive(Defence - 5, Defence + 5);
            if (eDamage <= 0) { eDamage = 1; }
            Health -= eDamage;
            document.getElementById("gBattleM").innerHTML += "</br>The " + EnemyName + " hit you for " + eDamage + " damage!";
        }

        document.getElementById("enemyHealth").innerHTML = EnemyHealth;
        UpdatePlayerStats();
    }
    else {
        document.getElementById("gBattleM").innerHTML = "You don't have enough mana!";
    }
}

function usePotion() {
    if (Health < maxHealth) {
        if (Potions > 0) {
            Potions--;
            Health += 25;
            if (Health > maxHealth) { Health = maxHealth; }

            document.getElementById("playerPotion").innerHTML = Potions;
            document.getElementById("playerHealth").innerHTML = Health;

            document.getElementById("gBattleM").innerHTML = "You used a potion and restored 25 health!";
        }
        else {
            document.getElementById("gBattleM").innerHTML = "You don't have any potions!";
        }
    }
    else {
        document.getElementById("gBattleM").innerHTML = "Your health is already full!";
    }
}

function fleeBattle() {
    WoodsMenu();
    document.getElementById("gWoodsM").innerHTML = "You fled from the " + EnemyName + "!";
    UpdatePlayerStats();
}

function LevelUp() {
    if (XP > 100 + (Level + 5)) {
        Level++;
        XP -= 100 + (Level + 5);
        maxHealth = 100 + (Level * 10);
        maxMana = 100 + (Level * 10);
        Health = maxHealth;
        Mana = maxMana;
        UpdatePlayerStats();
        alert("You leveled up!");
    }
    else {
        alert("You don't have enough XP to level up!");
    }
}

function sleep() {
    Health = maxHealth;
    Mana = maxMana;
    GameMenu();
    document.getElementById("gGameM").innerHTML = "You slept well! <br> Your health and mana are restored!";
}

function StoreMenu() {
    clearMenus();
    switch (Weapon) {
        case "Wooden Sword":
            document.getElementById("weaponInfo").innerHTML = "Brass Sword - 20 gold"
            weaponToBuy = "Brass Sword";
            weaponcost = 20;
            break;
        case "Brass Sword":
            document.getElementById("weaponInfo").innerHTML = "Iron Sword - 40 gold"
            weaponToBuy = "Iron Sword";
            weaponcost = 40;
            break;
        case "Iron Sword":
            document.getElementById("weaponInfo").innerHTML = "Steel Sword - 100 gold"
            weaponToBuy = "Steel Sword";
            weaponcost = 100;
            break;
        case "Steel Sword":
            document.getElementById("gWButton").style.display = "none";
            break;
        default:
            break;
    }

    switch (Staff) {
        case "Wooden Staff":
            document.getElementById("magicInfo").innerHTML = "Metal Staff - 35 gold"
            staffToBuy = "Metal Staff";
            staffcost = 35;
            break;
        case "Metal Staff":
            document.getElementById("magicInfo").innerHTML = "Pearl Staff - 50 gold"
            staffToBuy = "Pearl Staff";
            staffcost = 50;
            break;
        case "Pearl Staff":
            document.getElementById("magicInfo").innerHTML = "Platinum Staff - 120 gold"
            staffToBuy = "Platinum Staff";
            staffcost = 120;
            break;
        case "Platinum Staff":
            document.getElementById("gMButton").style.display = "none";
            break;
        default:
            break;
    }

    switch (Armor) {
        case "Leather Armor":
            document.getElementById("defenceInfo").innerHTML = "Brass Armor - 15 gold"
            armorToBuy = "Brass Armor";
            armortcost = 8;
            break;
        case "Brass Armor":
            document.getElementById("defenceInfo").innerHTML = "Iron Armor - 30 gold"
            armorToBuy = "Iron Armor";
            armortcost = 10;
            break;
        case "Iron Armor":
            document.getElementById("defenceInfo").innerHTML = "Steel Armor - 60 gold"
            armorToBuy = "Steel Armor";
            armortcost = 12;
            break;
        case "Steel Armor":
            document.getElementById("gDButton").style.display = "none";
            break;
        default:
            break;
    }
    MenuStore.style.display = "flex";
}

function UpgradeWeapon() {
    if (Gold >= weaponcost) {
        Gold -= weaponcost;
        Weapon = weaponToBuy;
        if (Weapon == "Brass Sword") { Attack = 20 }
        if (Weapon == "Iron Sword") { Attack = 30 }
        if (Weapon == "Steel Sword") { Attack = 45 }
        UpdatePlayerStats();
        document.getElementById("gStoreM").innerHTML = "You bought a " + weaponToBuy + " for " + weaponcost + " gold!";
        StoreMenu();
    }
    else {
        alert("You don't have enough gold to buy this item!");
    }
}

function UpgradeMagic() {
    if (Gold >= staffcost) {
        Gold -= staffcost;
        Staff = staffToBuy;
        if (Staff == "Metal Staff") { Magic = 25 }
        if (Staff == "Pearl Staff") { Magic = 35 }
        if (Staff == "Platinum Staff") { Magic = 55 }
        UpdatePlayerStats();
        document.getElementById("gStoreM").innerHTML = "You bought a " + staffToBuy + " for " + staffcost + " gold!";
        StoreMenu();
    }
    else {
        alert("You don't have enough gold to buy this item!");
    }
}

function UpgradeDefence() {
    if (Gold >= armortcost) {
        Gold -= armortcost;
        Armor = armorToBuy;
        if (Armor == "Brass Armor") { Defence = 22 }
        if (Armor == "Iron Armor") { Defence = 35 }
        if (Armor == "Steel Armor") { Defence = 48 }
        UpdatePlayerStats();
        document.getElementById("gStoreM").innerHTML = "You bought " + armorToBuy + " for " + armortcost + " gold!";
        StoreMenu();
    }
    else {
        alert("You don't have enough gold to buy this item!");
    }
}

function BuyPotion() {
    if (Gold >= 5) {
        Gold -= 5;
        Potions++;
        UpdatePlayerStats();
        document.getElementById("gStoreM").innerHTML = "You bought a potion for " + 5 + " gold!";
    }
    else {
        alert("You don't have enough gold to buy this item!");
    }
}


addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        if (enter !== null) {
            enter.click();
        }
    }
});
