var d = new Date();
document.getElementById("year").innerHTML = d.getFullYear();

function changeImg(imgs) {
  var Fimg = document.getElementById("fImg");
  var imgD = document.getElementById("imgDesc");
  Fimg.src = imgs.src;
  imgD.innerHTML = imgs.alt;
}


function ham() {
  var nav = document.getElementById("navb");
  if (nav.style.display === "none") {
    nav.style.display = "flex";
  } else {
    nav.style.display = "none";
  }
}