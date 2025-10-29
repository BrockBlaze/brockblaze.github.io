
const player = {
    x: 125, // Position in the 2D world (center of tile 2,2 in larger map)
    y: 125,
    z: 0, // Vertical position
    angle: 0, // Yaw (horizontal rotation)
    pitch: 0, // Pitch (vertical rotation)
    speed: 2.5, // Movement speed
    sprintSpeed: 4.5, // Sprint speed
    crouchSpeed: 1.2, // Crouch speed
    isCrouching: false,
    isSprinting: false,
    health: 100,
    maxHealth: 100,
    armor: 0,
    score: 0,
    bobAmount: 0, // Head bob for walking
    bobSpeed: 0.1,
    verticalVelocity: 0,
    isJumping: false,
    jumpHeight: 5,
    gravity: 0.3
};

function updatePlayer(keys, mouseDeltaX, mouseDeltaY, map, lightSource) {
    const sensitivity = 0.002;
    const maxPitch = Math.PI / 3;

    // Update rotation (mouse look)
    player.angle += mouseDeltaX * sensitivity;
    player.pitch -= mouseDeltaY * sensitivity;

    // Clamp pitch
    player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));

    // Normalize angle
    if (player.angle < 0) player.angle += Math.PI * 2;
    if (player.angle >= Math.PI * 2) player.angle -= Math.PI * 2;

    // Handle jumping
    if (keys[' '] && !player.isJumping) {
        player.isJumping = true;
        player.verticalVelocity = player.jumpHeight;
    }
    
    // Apply gravity
    if (player.isJumping) {
        player.z += player.verticalVelocity;
        player.verticalVelocity -= player.gravity;
        
        if (player.z <= 0) {
            player.z = 0;
            player.isJumping = false;
            player.verticalVelocity = 0;
        }
    }
    
    // Handle sprint and crouch
    player.isSprinting = keys['shift'] && !player.isCrouching;
    player.isCrouching = keys['c'] && !player.isSprinting;

    // Update light source position if it follows the player
    if (lightSource.followPlayer) {
        lightSource.x = player.x;
        lightSource.y = player.y;
    }

    // Movement with sprint/crouch modifiers
    let currentSpeed = player.speed;
    if (player.isSprinting) currentSpeed = player.sprintSpeed;
    if (player.isCrouching) currentSpeed = player.crouchSpeed;
    
    const moveStep = keys['w'] ? currentSpeed : keys['s'] ? -currentSpeed * 0.7 : 0;
    const strafeStep = keys['a'] ? -currentSpeed * 0.8 : keys['d'] ? currentSpeed * 0.8 : 0;
    
    // Head bobbing
    if (moveStep !== 0 || strafeStep !== 0) {
        player.bobAmount += player.bobSpeed;
        if (player.bobAmount > Math.PI * 2) player.bobAmount -= Math.PI * 2;
    } else {
        player.bobAmount *= 0.9; // Smooth return to center
    }

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

export { player, updatePlayer };
