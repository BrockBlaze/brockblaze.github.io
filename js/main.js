function changeImg(imgs) {
  var Fimg = document.getElementById("fImg");
  var imgD = document.getElementById("imgDesc");
  Fimg.src = imgs.src;
  imgD.innerHTML = imgs.alt;
}
