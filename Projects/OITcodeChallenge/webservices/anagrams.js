let oWord = "word";
let fLetter = "w";
let lastGuessed = "";
let guessCount = 0;
let f = "guesses";

var startScreen = document.getElementById("start");
var gameScreen = document.getElementById("game");
var endScreen = document.getElementById("end");
var hintScreen = document.getElementById("hint");
var hintBtn = document.getElementById("hintBtn");
var restartBtn = document.getElementById("restartBtn");

startScreen.style.display = "block";
gameScreen.style.display = "none";
endScreen.style.display = "none";
hintScreen.style.display = "none";
hintBtn.style.display = "none";
restartBtn.style.display = "none";

//this function gets a random word form the database and then shuffles it and displays it for the user.
async function getRandomWord() {
  //gets the word from the api
  let res = await fetch(`${randomWord}`);
  if (res.ok) {
    let data = await res.json();
    //change the json into a string
    let dataword = data.toString();
    //log original word for testing
    console.log(dataword);
    //store word
    oWord = dataword;
    //shuffle word
    shuffle(dataword);
    //display word to user
    var div = document.getElementById("randomWord");
    div.innerHTML += shuffle(dataword);
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    restartBtn.style.display = "block";
  }
}

// this function scrambles the word
function shuffle(word) {
  var t = "";
  for (word = word.split(""); word.length > 0; )
    t += word.splice((word.length * Math.random()) << 0, 1);
  return t;
}

function guessWord() {
  let guessedWord = document.getElementById("guess").value;

  //log test
  console.log(guessedWord + ", " + oWord);
  if (guessedWord != lastGuessed) {
    if (guessedWord != oWord) {
      guessCount++;
      console.log("Wrong");
      var div = document.getElementById("guessedWordsWrong");
      div.innerHTML += "<li>" + guessedWord + "</li>";
    } else {
      guessCount++;
      console.log("Right!");
      var div = document.getElementById("guessedWordsRight");
      div.innerHTML += guessedWord;

      var div1 = document.getElementById("gameWord");
      div1.innerHTML =
        "The scrambled up word was " +
        '<span id="randomWord">' +
        oWord +
        "</span>";

      //check for grammer
      if (guessCount > 1) {
        f = "Guesses";
      } else {
        f = "Guess";
      }
      //display stats for user
      var div = document.getElementById("stats");
      div.innerHTML += "It took you " + guessCount + " " + f;
      endScreen.style.display = "block";
    }
    lastGuessed = guessedWord;
  }
  else
  {
    alert("Please guess a different word")
  }
}

//restarts the webpage
function replay() {
  location.reload();
  return false;
}

//displays the hint to the user
function getHint() {
  fLetter = oWord.charAt(0);
  var div = document.getElementById("hint");
  div.innerHTML += " " + fLetter;
  hintScreen.style.display = "block";
}

//runs the checkGuesses function every 1000 milliseconds
var checkEverySec = setInterval(checkGuesses, 1000);

//when to expose hint button (in this case after more then 3 guesses)
function checkGuesses() {
  if (guessCount > 3) {
    hintBtn.style.display = "block";
    clearInterval(checkEverySec);
  }
}

var input = document.getElementById("guess");
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("checkGuess").click();
    }
  });
