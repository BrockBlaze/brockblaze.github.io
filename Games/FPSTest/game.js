const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 50;

// Player properties
const player = {
    x: 150, // Position in the 2D world
    y: 150,
    z: 0, // Vertical position
    angle: 0, // Yaw (horizontal rotation)
    pitch: 0, // Pitch (vertical rotation)
    speed: 1.5, // Movement speed
};

// Map (a simple grid of walls and empty spaces)
const map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
];

// Raycasting settings
const fov = Math.PI / 3.9; // Field of view (45 degrees)
const numRays = 1000; // Number of rays for rendering
const maxDepth = 1000; // Max depth for rays

// Input handling
const keys = {};
let mouseDeltaX = 0;
// Maximum pitch (up and down limits)
const maxPitch = Math.PI / 4; // 45 degrees up/down

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

// Update player position and angle
function update() {
    // Update rotation (mouse look)
    player.angle += mouseDeltaX;
    mouseDeltaX = 0;

    // Normalize angle
    if (player.angle < 0) player.angle += Math.PI * 2;
    if (player.angle >= Math.PI * 2) player.angle -= Math.PI * 2;

    // Movement
    const moveStep = keys['w'] ? player.speed : keys['s'] ? -player.speed : 0;
    const strafeStep = keys['a'] ? -player.speed : keys['d'] ? player.speed : 0;

    // Calculate next positions
    const nextX = player.x + Math.cos(player.angle) * moveStep + Math.cos(player.angle + Math.PI / 2) * strafeStep;
    const nextY = player.y + Math.sin(player.angle) * moveStep + Math.sin(player.angle + Math.PI / 2) * strafeStep;

    // Tile size
    const tileSize = 50;

    // Check for collisions separately on X and Y axes
    const mapX = Math.floor(nextX / tileSize);
    const mapY = Math.floor(player.y / tileSize);
    if (map[mapY] && map[mapY][mapX] === 0) {
        player.x = nextX; // Update X position only if there's no collision
    }

    const mapX2 = Math.floor(player.x / tileSize);
    const mapY2 = Math.floor(nextY / tileSize);
    if (map[mapY2] && map[mapY2][mapX2] === 0) {
        player.y = nextY; // Update Y position only if there's no collision
    }
}

const lightSource = {
    x: 300, // Light source position
    y: 300,
    intensity: 1.0, // Brightness factor
};

// Cast a single ray
function castRay(rayAngle) {
    let x = player.x;
    let y = player.y;

    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    for (let depth = 0; depth < maxDepth; depth++) {
        x += cos;
        y += sin;

        const mapX = Math.floor(x / 50);
        const mapY = Math.floor(y / 50);

        if (map[mapY] && map[mapY][mapX] === 1) {
            const rawDistance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);

            // Correct the distance for fish-eye effect
            const correctedDistance = rawDistance * Math.cos(rayAngle - player.angle);

            // Determine texture offset based on hit side
            const hitX = x % 50;
            const hitY = y % 50;
            const isVerticalHit = Math.abs(cos) < Math.abs(sin);
            const textureX = isVerticalHit ? hitY : hitX;

            return { distance: correctedDistance, textureX };
        }
    }

    return { distance: maxDepth };
}

// Render the scene
const wallTexture = document.getElementById('wallTexture'); // Reference the texture image

function draw() {
    // Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the pitch offset
    const pitchOffset = player.pitch * canvas.height;

    // Draw the ceiling and floor with gradients directly
    addCeilingAndFloorGradient(pitchOffset);

    // Calculate slice width (each column of the screen)
    const sliceWidth = canvas.width / numRays;

    // Draw walls using raycasting
    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1; // Normalized screen coordinate in range [-1, 1]
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle);

        const wallHeight = (canvas.height / ray.distance) * 50;

        const shade = Math.max(0.3, 1 - ray.distance / maxDepth);
        const textureX = Math.floor(ray.textureX * (wallTexture.width / 50));

        ctx.globalAlpha = 1;
        ctx.drawImage(
            wallTexture,
            textureX, 0,
            1, wallTexture.height,
            Math.floor(i * sliceWidth),
            Math.floor(canvas.height / 2 - wallHeight / 2 + pitchOffset),
            Math.ceil(sliceWidth),
            Math.floor(wallHeight)
        );
        ctx.globalAlpha = 1;
    }
}

// Function to add gradient for ceiling and floor for a smoother look
function addCeilingAndFloorGradient(pitchOffset) {
    // Clamp pitch offset to ensure gradients don't draw out of bounds
    const clampedPitchOffset = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, pitchOffset));

    // Ceiling gradient
    const ceilingGradient = ctx.createLinearGradient(0, 0 + clampedPitchOffset, 0, canvas.height / 2 + clampedPitchOffset);
    ceilingGradient.addColorStop(0, '#2e2727');
    ceilingGradient.addColorStop(1, '#1c1818');
    ctx.fillStyle = ceilingGradient;

    // Draw ceiling
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + clampedPitchOffset);

    // Floor gradient
    const floorGradient = ctx.createLinearGradient(0, canvas.height / 2 + clampedPitchOffset, 0, canvas.height);
    floorGradient.addColorStop(0, '#4b4d43');
    floorGradient.addColorStop(1, '#2d2e27');
    ctx.fillStyle = floorGradient;

    // Draw the floor
    ctx.fillRect(0, canvas.height / 2 + clampedPitchOffset, canvas.width, canvas.height / 2 - clampedPitchOffset);
}

function fixedGameLoop() {
    update();
}
// Game loop
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}
const intervalId = setInterval(fixedGameLoop, 16.67);
gameLoop();
