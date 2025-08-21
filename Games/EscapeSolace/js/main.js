// Main entry point for the game
let game;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up debug mode (F1 to toggle)
    window.DEBUG = false;
    
    // Create and start the game
    game = new Game();
    
    console.log('Escape Solace initialized');
    console.log('Controls:');
    console.log('- WASD: Move');
    console.log('- Mouse: Aim');
    console.log('- Click: Shoot');
    console.log('- ESC: Pause');
    console.log('- F1: Toggle debug mode');
});

// Handle page visibility changes (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            if (!game.isPaused) {
                game.togglePause();
            }
        }
    }
});