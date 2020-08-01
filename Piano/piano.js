var cNote = document.getElementById("c");
var dNote = document.getElementById("d");
var eNote = document.getElementById("e");
var fNote = document.getElementById("f");
var gNote = document.getElementById("g");
var aNote = document.getElementById("a");
var bNote = document.getElementById("b");
var ccNote = document.getElementById("cc");

function playC() {
  var cNote = document.getElementById("c");
  cNote.currentTime = 0;
  cNote.play();
}
function playD() {
  var dNote = document.getElementById("d");
  dNote.currentTime = 0;
  dNote.play();
}
function playE() {
  var eNote = document.getElementById("e");
  eNote.currentTime = 0;
  eNote.play();
}
function playF() {
  var fNote = document.getElementById("f");
  fNote.currentTime = 0;
  fNote.play();
}
function playG() {
  var gNote = document.getElementById("g");
  gNote.currentTime = 0;
  gNote.play();
}
function playA() {
  var aNote = document.getElementById("a");
  aNote.currentTime = 0;
  aNote.play();
}
function playB() {
  var bNote = document.getElementById("b");
  bNote.currentTime = 0;
  bNote.play();
}
function playCC() {
  var ccNote = document.getElementById("cc");
  ccNote.currentTime = 0;
  ccNote.play();
}

function KeyBoardPiano() {
  document.addEventListener("keydown", function (k) {
    if (k.keyCode == 65) {
      cNote.currentTime = 0;
      cNote.play();
      document.getElementById("cKey").classList.add("pressed");
    }
    if (k.keyCode == 83) {
      dNote.currentTime = 0;
      dNote.play();
      document.getElementById("dKey").classList.add("pressed");
    }
    if (k.keyCode == 68) {
      eNote.currentTime = 0;
      eNote.play();
      document.getElementById("eKey").classList.add("pressed");
    }
    if (k.keyCode == 70) {
      fNote.currentTime = 0;
      fNote.play();
      document.getElementById("fKey").classList.add("pressed");
    }
    if (k.keyCode == 74) {
      gNote.currentTime = 0;
      gNote.play();
      document.getElementById("gKey").classList.add("pressed");
    }
    if (k.keyCode == 75) {
      aNote.currentTime = 0;
      aNote.play();
      document.getElementById("aKey").classList.add("pressed");
    }
    if (k.keyCode == 76) {
      bNote.currentTime = 0;
      bNote.play();
      document.getElementById("bKey").classList.add("pressed");
    }
    if (k.keyCode == 186) {
      ccNote.currentTime = 0;
      ccNote.play();
      document.getElementById("ccKey").classList.add("pressed");
    }
  });

  document.addEventListener("keyup", function (k) {
    if (k.keyCode == 65) {
      document.getElementById("cKey").classList.remove("pressed");
    }
    if (k.keyCode == 83) {
      document.getElementById("dKey").classList.remove("pressed");
    }
    if (k.keyCode == 68) {
      document.getElementById("eKey").classList.remove("pressed");
    }
    if (k.keyCode == 70) {
      document.getElementById("fKey").classList.remove("pressed");
    }
    if (k.keyCode == 74) {
      document.getElementById("gKey").classList.remove("pressed");
    }
    if (k.keyCode == 75) {
      document.getElementById("aKey").classList.remove("pressed");
    }
    if (k.keyCode == 76) {
      document.getElementById("bKey").classList.remove("pressed");
    }
    if (k.keyCode == 186) {
      document.getElementById("ccKey").classList.remove("pressed");
    }
  });

}
