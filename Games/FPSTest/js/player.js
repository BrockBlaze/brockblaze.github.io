// Raycasting settings
const fov = Math.PI / 3.9; // Field of view (45 degrees)
const numRays = 200; // Number of rays for rendering
const maxDepth = 750; // Max depth for rays

export const player = {
    x: 150,
    y: 150,
    angle: 0,
    pitch: 0,
    speed: 1.5,
};

export function updatePlayer(keys, map) {
    // Player movement logic here
    const moveStep = keys['w'] ? player.speed : keys['s'] ? -player.speed : 0;
    const strafeStep = keys['a'] ? -player.speed : keys['d'] ? player.speed : 0;

    const nextX = player.x + Math.cos(player.angle) * moveStep + Math.cos(player.angle + Math.PI / 2) * strafeStep;
    const nextY = player.y + Math.sin(player.angle) * moveStep + Math.sin(player.angle + Math.PI / 2) * strafeStep;

    const tileSize = 50;

    // Handle collision
    const mapX = Math.floor(nextX / tileSize);
    const mapY = Math.floor(player.y / tileSize);
    if (map[mapY] && map[mapY][mapX] === 0) player.x = nextX;

    const mapX2 = Math.floor(player.x / tileSize);
    const mapY2 = Math.floor(nextY / tileSize);
    if (map[mapY2] && map[mapY2][mapX2] === 0) player.y = nextY;
}
