let images = document.getElementsByClassName("hImg");
let position = 3
let newPosition;

function nextImg() {
    newPosition = position+1;
    if (newPosition > images.length-1)
    {
        newPosition = 0;
    }

    var fullImg = document.getElementById("fullimg");
    var imgDes = document.getElementById("imgDes");
    fullImg.src = images[newPosition].src;
    imgDes.innerHTML = images[newPosition].alt;
    position = newPosition;
}

function prevImg() {
    newPosition = position-1;
    if (newPosition < 0)
    {
        newPosition = images.length-1;
    }
    var fullImg = document.getElementById("fullimg");
    var imgDes = document.getElementById("imgDes");
    fullImg.src = images[newPosition].src;
    imgDes.innerHTML = images[newPosition].alt;
    position = newPosition;
}

function debug() {
    alert(position);
    alert(images.length);
}