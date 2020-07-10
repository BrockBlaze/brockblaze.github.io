var date = new Date();
var year = date.getFullYear();


function enterPlayerName(name) {
    if(event.key === 'Enter')
    {
        localStorage.setItem("playerName", name.value);
        document.getElementById("gameText").innerHTML = "Welcome " + "<h2>" + localStorage.getItem("playerName") + "<h2>";
        document.getElementById("nameText").style = "display:none";
        document.getElementById("playBt").style = "display:inline-block";
        document.getElementById("deleteBt").style = "display:inline-block";
    }
}

function deletePlayer() {
    localStorage.clear();
    location.reload();
}

function main() {
    
}

function gameStart() {
    if (localStorage.getItem("playerName") != null)
    {
        document.getElementById("gameText").innerHTML = "Welcome " + "<h2>" + localStorage.getItem("playerName") + "<h2>";
        document.getElementById("nameText").style = "display:none";
        document.getElementById("playBt").style = "display:inline-block";
        document.getElementById("deleteBt").style = "display:inline-block";
    }
    else
    {
        document.getElementById("playBt").style = "display:none";
        document.getElementById("deleteBt").style = "display:none";
    }
}

window.setInterval(function(){
    document.getElementById("year").innerHTML = year;
    main();
  }, 10);