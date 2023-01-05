window.addEventListener("resize", resized);

var nav = document.getElementById("nav");
var navOn = false;

function toggleNav() 
{
    if (navOn) {
        nav.style.display = "none";
        navOn = false;
    } else {
        nav.style.display = "flex";
        navOn = true;
    }
}

function changeImg(imgs) {
    var Fimg = document.getElementById("fImg");
    var imgD = document.getElementById("imgDesc");
    Fimg.src = imgs.src;
    imgD.innerHTML = imgs.alt;
}

function resized()
{
    if (self.innerWidth < 750)
    {
        nav.style.display = "none";
        navOn = false;
    } 
    else
    {
        nav.style.display = "flex";
        navOn = true;
    }
}