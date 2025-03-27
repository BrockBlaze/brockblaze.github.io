var d = new Date();
document.getElementById("year").innerHTML = d.getFullYear();


window.onload = startCheck;

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

function toggleHam() {
  var nav = document.querySelector("nav");
  if (nav.style.display === "none") {
    nav.style.display = "block";
  } else {
    nav.style.display = "none";
  }
}

function startCheck() {
  toggleHam();
  checkAspectRatio();
  const collapseTabs = document.querySelectorAll('#collapseTab');
  collapseTabs[0].style.display = 'block';
}

function checkAspectRatio() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const aspectRatio = width / height;
  if (aspectRatio > 1) {
    // Landscape orientation
    //console.log("Landscape:", aspectRatio);
    var nav = document.querySelector("nav");
    nav.style.display = "block";
  } else if (aspectRatio < 1) {
    // Portrait orientation
    //console.log("Portrait:", aspectRatio);
    var nav = document.querySelector("nav");
    nav.style.display = "none";
  } else {
    // Square aspect ratio
    //console.log("Square:", aspectRatio);
  }
}

function setCollapseButtonActive(element) {
  reloadCSS();
  clearCollapseButtonIDs();
  let count = 0;
  let indexNum = 0;
  const collapseButtons = document.querySelectorAll('.collapseButton');
  const collapseTabs = document.querySelectorAll('#collapseTab');
  collapseButtons.forEach(button => {
    if (button === element) {
      indexNum = count;
    }
    console.log(button.id + " " + count + " " + indexNum);
    count++;
  })
  collapseTabs.forEach(tab => {
    tab.style.display = 'none';
  })
  collapseTabs[indexNum].style.display = 'block';
  element.id = 'collapseButtonActive';
}

function clearCollapseButtonIDs() {
  const collapseButtons = document.querySelectorAll('.collapseButton');
  collapseButtons.forEach(button => {
    button.id = 'a';
  });
}

function reloadCSS() {
  const links = document.getElementsByTagName("link");
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.rel === "stylesheet") {
      link.href = link.href.split("?")[0] + "?t=" + new Date().getTime();
    }
  }
}


window.addEventListener('resize', function () {
  console.log('Window resized!');
  checkAspectRatio();
});
