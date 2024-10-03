// Map the note IDs to their corresponding audio elements
const notes = {
  c: document.getElementById("c"),
  d: document.getElementById("d"),
  e: document.getElementById("e"),
  f: document.getElementById("f"),
  g: document.getElementById("g"),
  a: document.getElementById("a"),
  b: document.getElementById("b"),
  cc: document.getElementById("cc"),
};

// Map key codes to their corresponding notes and button IDs
const keyMappings = {
  65: { note: "c", key: "cKey" },    // A key
  83: { note: "d", key: "dKey" },    // S key
  68: { note: "e", key: "eKey" },    // D key
  70: { note: "f", key: "fKey" },    // F key
  74: { note: "g", key: "gKey" },    // J key
  75: { note: "a", key: "aKey" },    // K key
  76: { note: "b", key: "bKey" },    // L key
  186: { note: "cc", key: "ccKey" }, // ; key
};

// Object to track keys that are currently being held down
const activeKeys = {};

// Function to play a given note
function playNote(noteId) {
  const note = notes[noteId];
  if (note && note.paused) {
    note.play(); // Start playing the note if it's not already playing
  }
}

// Function to stop a note
function stopNote(noteId) {
  const note = notes[noteId];
  if (note && !note.paused) {
    note.pause(); // Pause the note
    note.currentTime = 0; // Reset to the beginning to prepare for next play
  }
}

// Main function to handle keyboard inputs
function KeyBoardPiano() {
  // Event listener for keydown
  document.addEventListener("keydown", function (event) {
    const mapping = keyMappings[event.keyCode];
    if (mapping && !activeKeys[event.keyCode]) {
      playNote(mapping.note); // Play the associated note
      document.getElementById(mapping.key).classList.add("pressed"); // Highlight the button
      activeKeys[event.keyCode] = true; // Mark the key as active
    }
  });

  // Event listener for keyup
  document.addEventListener("keyup", function (event) {
    const mapping = keyMappings[event.keyCode];
    if (mapping) {
      stopNote(mapping.note); // Stop the associated note
      document.getElementById(mapping.key).classList.remove("pressed"); // Remove highlight
      delete activeKeys[event.keyCode]; // Mark the key as inactive
    }
  });
}
