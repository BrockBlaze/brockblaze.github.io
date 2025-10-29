# Project: FPSTest Game

This is a first-person shooter (FPS) game built with HTML5 Canvas and JavaScript.

## Work Done:

A significant number of bugs were fixed to get the game into a runnable state.

### Bug Fixes:
- **Wave Spawning:** The logic for advancing to the next wave of enemies was broken and has been refactored.
- **Missing Functions:** Placeholder functions for `drawMenu`, `drawPauseScreen`, and `drawGameOver` were added to `renderer.js` to prevent crashes.
- **Reference Errors:**
    - Fixed a `ReferenceError` where `isWallBetween` was called but not defined (replaced with `isOccluded`).
    - Fixed `ReferenceError`s in the HUD rendering by correctly passing `map` and `enemies` data to the `drawHUD` and `drawMinimap` functions.
    - Resolved a circular dependency issue between `game.js` and `renderer.js` related to `getAmbientOcclusion`.
    - Fixed a `SyntaxError` caused by a duplicate declaration of `getAmbientOcclusion`.
- **Incorrect Arguments:** Corrected function calls that were passing the wrong arguments (e.g., the `draw` function call).
- **Mouse Look:** Refactored the mouse input handling logic to correctly process mouse movement for looking around. The original implementation was buggy and updated the player angle in two different places.

### Environment Issue:
- The game requires **Pointer Lock** for the mouse controls to work correctly.
- Browsers often block this feature for security reasons when the game is run from a local file (`file:///...`).
- **Solution:** The game must be served from a web server. A local server was started using `npx http-server` to allow the game to be played at `http://localhost:8080/Games/FPSTest/`.
