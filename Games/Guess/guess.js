const secretCode = generateSecretCode(4);
let currentGuess = [];
let guesses = [];

function generateSecretCode(length) {
    const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
    let code = [];
    for (let i = 0; i < length; i++) {
        code.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return code;
}

// Handle color selection
document.querySelectorAll('.color-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        if (currentGuess.length < 4) {
            currentGuess.push(btn.getAttribute('data-color'));
            updateCurrentGuessUI();
        }
    });
});

function updateCurrentGuessUI() {
    currentGuess.forEach((color, index) => {
        document.getElementById(`slot${index + 1}`).style.backgroundColor = color;
    });
}

// Reset the guess slots visually and the currentGuess array
function resetGuessSlots() {
    currentGuess = [];
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`slot${i}`).style.backgroundColor = '';
    }
}

// Check the guess and provide feedback
function checkGuess(guess) {
    let correctPosition = 0;
    let correctColor = 0;

    let remainingSecret = [];
    let remainingGuess = [];

    // First pass: find exact matches
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secretCode[i]) {
            correctPosition++;
        } else {
            remainingSecret.push(secretCode[i]);
            remainingGuess.push(guess[i]);
        }
    }

    // Second pass: find color-only matches
    remainingGuess.forEach(color => {
        const index = remainingSecret.indexOf(color);
        if (index !== -1) {
            correctColor++;
            remainingSecret.splice(index, 1);
        }
    });

    return { correctPosition, correctColor };
}

// Submit guess
document.getElementById('guess-btn').addEventListener('click', () => {
    if (currentGuess.length === 4) {
        const result = checkGuess(currentGuess);
        guesses.push({ guess: currentGuess, result });
        displayGuess(currentGuess, result);
        resetGuessSlots();  // Clear the current guess section
    } else {
        alert('Please complete your guess.');
    }
});

// Display the current guess and feedback on the board
function displayGuess(guess, result) {
    const board = document.getElementById('board');
    const guessDiv = document.createElement('div');
    guessDiv.classList.add('guess-row');

    guess.forEach(color => {
        const colorSlot = document.createElement('div');
        colorSlot.classList.add('guess-slot');
        colorSlot.style.backgroundColor = color;
        guessDiv.appendChild(colorSlot);
    });

    const feedbackDiv = document.createElement('div');
    feedbackDiv.innerHTML = `Correct Position: ${result.correctPosition}, Correct Color: ${result.correctColor}`;
    guessDiv.appendChild(feedbackDiv);

    board.appendChild(guessDiv);
}
