var d = new Date();
document.getElementById("year").innerHTML = d.getFullYear();
const currentPageURL = window.location.href;

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
  startCollapseActive();
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

function startCollapseActive() {
  let startIndex = -1;
  if (localStorage.getItem("saveProjectIndex") !== null) {
    if (currentPageURL.includes("projects.html")) {
      startIndex = localStorage.getItem("saveProjectIndex");
    }
  }
  if (localStorage.getItem("saveAboutIndex") !== null) {
    if (currentPageURL.includes("about.html")) {
      startIndex = localStorage.getItem("saveAboutIndex");
    }
  }
  if (startIndex >= 0) {
    clearCollapseButtonIDs();
    const collapseButtons = document.querySelectorAll('.collapseButton');
    const collapseTabs = document.querySelectorAll('#collapseTab');
    collapseButtons[startIndex].id = 'collapseButtonActive';

    collapseTabs.forEach(tab => {
      tab.style.display = 'none';
    })
    collapseTabs[startIndex].style.display = 'block';
    reloadCSS();
  }
  else {
    const collapseTabs = document.querySelectorAll('#collapseTab');
    collapseTabs[0].style.display = 'block';
  }
}

function setCollapseButtonActive(element) {
  clearCollapseButtonIDs();
  let count = 0;
  let indexNum = 0;
  const collapseButtons = document.querySelectorAll('.collapseButton');
  const collapseTabs = document.querySelectorAll('#collapseTab');
  collapseButtons.forEach(button => {
    if (button === element) {
      indexNum = count;
    }
    //console.log(button.id + " " + count + " " + indexNum);
    count++;
  })
  collapseTabs.forEach(tab => {
    tab.style.display = 'none';
  })
  if (currentPageURL.includes("projects.html")) {
    localStorage.setItem("saveProjectIndex", indexNum);
  }
  if (currentPageURL.includes("about.html")) {
    localStorage.setItem("saveAboutIndex", indexNum);
  }
  collapseTabs[indexNum].style.display = 'block';
  element.id = 'collapseButtonActive';
}

function clearCollapseButtonIDs() {
  const collapseButtons = document.querySelectorAll('.collapseButton');
  collapseButtons.forEach(button => {
    button.id = 'a';
  });
  reloadCSS();
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
  checkAspectRatio();
});
