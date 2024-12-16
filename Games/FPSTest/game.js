const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player properties
const player = {
    x: 150, // Position in the 2D world
    y: 150,
    angle: 0, // Direction the player is facing (yaw in radians)
    speed: 2, // Movement speed
};

// Map (a simple grid of walls and empty spaces)
const map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
];

// Raycasting settings
const fov = Math.PI / 4; // Field of view (45 degrees)
const numRays = 300; // Number of rays for rendering
const maxDepth = 100; // Max depth for rays

// Input handling
const keys = {};
let mouseDeltaX = 0;

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        mouseDeltaX = e.movementX * 0.002; // Adjust sensitivity
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

    const nextX = player.x + Math.cos(player.angle) * moveStep + Math.cos(player.angle + Math.PI / 2) * strafeStep;
    const nextY = player.y + Math.sin(player.angle) * moveStep + Math.sin(player.angle + Math.PI / 2) * strafeStep;

    // Collision detection
    if (map[Math.floor(nextY / 50)][Math.floor(nextX / 50)] === 0) {
        player.x = nextX;
        player.y = nextY;
    }
}

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
            const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
            return { distance, hitX: x, hitY: y };
        }
    }

    return { distance: maxDepth };
}

// Render the scene
const wallTexture = document.getElementById('wallTexture'); // Reference the texture image

function draw() {
    // Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ceiling
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    // Draw floor
    ctx.fillStyle = 'darkgray';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // Draw walls using raycasting
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - fov / 2 + (i / numRays) * fov;
        const ray = castRay(rayAngle);

        // Wall height based on distance
        const wallHeight = (canvas.height / ray.distance) * 50;

        // Adjust shading for depth
        const shade = Math.max(0.3, 1 - ray.distance / maxDepth); // Closer walls are brighter

        // Slice the texture vertically
        const textureX = Math.floor((ray.hitX % 50) * (wallTexture.width / 50)); // Horizontal texture position

        // Draw the wall slice with the texture
        ctx.globalAlpha = shade; // Apply shading
        ctx.drawImage(
            wallTexture, // Source image
            textureX, 0, // Source position on the texture
            1, wallTexture.height, // Source width and height
            i * (canvas.width / numRays), // Destination X position
            canvas.height / 2 - wallHeight / 2, // Destination Y position
            canvas.width / numRays, // Destination width (1 slice)
            wallHeight // Destination height
        );
        ctx.globalAlpha = 1; // Reset alpha

        ctx.strokeStyle = `rgba(0, 0, 0, ${1 - shade})`; // Border color based on distance
        ctx.lineWidth = 1;
        ctx.strokeRect(
            i * (canvas.width / numRays),
            canvas.height / 2 - wallHeight / 2,
            canvas.width / numRays,
            wallHeight
        );

    }
}



// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
