export const keys = {};
let mouseDeltaX = 0;
// Maximum pitch (up and down limits)
const maxPitch = Math.PI / 4; // 45 degrees up/down

export function setupInput(canvas, player) {
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    window.addEventListener('keydown', (e) => (keys[e.key] = true));
    window.addEventListener('keyup', (e) => (keys[e.key] = false));

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            mouseDeltaX = e.movementX * 0.0005; // Horizontal sensitivity
            const mouseDeltaY = e.movementY * 0.001; // Vertical sensitivity

            player.angle += mouseDeltaX; // Horizontal rotation
            player.pitch -= mouseDeltaY; // Vertical rotation (inverted Y for FPS feel)

            // Clamp pitch to the maximum limits
            player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));
        }
    });
}
