const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wallTexture = document.getElementById('wallTexture');
const wallTextureFallback = document.getElementById('wallTextureFallback');
const crosshairElement = document.getElementById('crosshair');
const loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.querySelector('.progress');

// At the top of the file, add a fallback wall color
const FALLBACK_WALL_COLOR = '#555555';
const WALL_EDGE_COLOR = 'rgba(0, 0, 0, 0.25)';  // Slightly darker for edges

// Set canvas size
canvas.width = window.innerWidth - 16;
canvas.height = window.innerHeight - 16;

// Ensure crosshair is positioned in the center of the screen
crosshairElement.style.top = `${canvas.height / 2}px`;
crosshairElement.style.left = `${canvas.width / 2}px`;

// Track resource loading
const resources = [
    { element: wallTexture, loaded: false },
    { element: wallTextureFallback, loaded: false },
    { element: document.getElementById('gunTexture'), loaded: false }
];

// Loading status
let allResourcesLoaded = false;
let gameStarted = false;

// Update loading progress
function updateLoadingProgress() {
    const loadedCount = resources.filter(resource => resource.loaded).length;
    const progress = (loadedCount / resources.length) * 100;
    progressBar.style.width = `${progress}%`;

    if (loadedCount === resources.length) {
        allResourcesLoaded = true;
        // Hide loading screen with fade effect
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Start the game
            if (!gameStarted) {
                gameStarted = true;
                spawnEnemies(); // Spawn enemies when game starts
                gameLoop();
            }
        }, 500);
    }
}

// Add event listeners to track resource loading
resources.forEach(resource => {
    if (resource.element.complete) {
        resource.loaded = true;
        updateLoadingProgress();
    } else {
        resource.element.addEventListener('load', () => {
            resource.loaded = true;
            updateLoadingProgress();
        });

        resource.element.addEventListener('error', () => {
            console.error(`Failed to load resource: ${resource.element.src}`);
            // Mark as loaded anyway to prevent hanging
            resource.loaded = true;
            updateLoadingProgress();
        });
    }
});

// Player properties
const player = {
    x: 150, // Position in the 2D world
    y: 150,
    z: 0, // Vertical position
    angle: 0, // Yaw (horizontal rotation)
    pitch: 0, // Pitch (vertical rotation)
    speed: 1.5, // Movement speed
};

// Gun properties
const gun = {
    fireRate: 300, // Milliseconds between shots
    lastShotTime: 0, // Timestamp of the last shot
    bulletSpeed: 10, // Speed of bullets
    bullets: [], // Array to store active bullets
    recoil: 0, // Current recoil amount
    maxRecoil: 20, // Maximum recoil displacement
    recoilRecovery: 0.2, // How quickly recoil recovers
    muzzleFlash: null, // Muzzle flash effect
    impacts: null, // Impact effects
};

// Map (a simple grid of walls and empty spaces)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Enemy data structure
const ENEMY_TYPES = {
    SOLDIER: {
        maxHealth: 100,
        speed: 0.5,
        damage: 10,
        size: 20,
        texture: null, // Will be loaded later
        color: 'red'
    }
};

// Create enemies array
let enemies = [];

// Function to spawn enemies
function spawnEnemies() {
    // Spawn 5 enemies in random valid positions
    for (let i = 0; i < 5; i++) {
        spawnEnemy();
    }
}

// Function to spawn a single enemy
function spawnEnemy(type = 'SOLDIER') {
    // Find a valid position (not in a wall and not too close to player)
    let x, y, isValid;
    const tileSize = 50;
    const minDistanceToPlayer = 200; // Minimum distance from player

    do {
        // Choose a random map position
        const mapWidth = map[0].length;
        const mapHeight = map.length;

        const mapX = Math.floor(Math.random() * mapWidth);
        const mapY = Math.floor(Math.random() * mapHeight);

        // Convert to world coordinates (center of tile)
        x = mapX * tileSize + tileSize / 2;
        y = mapY * tileSize + tileSize / 2;

        // Check if position is valid (not in a wall)
        isValid = map[mapY] && map[mapY][mapX] === 0;

        // Check distance to player
        const distToPlayer = Math.sqrt(
            Math.pow(x - player.x, 2) +
            Math.pow(y - player.y, 2)
        );

        isValid = isValid && distToPlayer > minDistanceToPlayer;
    } while (!isValid);

    // Create enemy object
    const enemy = {
        type: type,
        x: x,
        y: y,
        z: 0, // Same height as player
        health: ENEMY_TYPES[type].maxHealth,
        angle: Math.random() * Math.PI * 2, // Random initial direction
        state: 'idle', // idle, chasing, attacking, hurt, dead
        lastUpdate: Date.now(),
        hitTime: 0,
        size: ENEMY_TYPES[type].size
    };

    enemies.push(enemy);
    return enemy;
}

// Raycasting settings
const fov = Math.PI / 3.75; // Field of view (45 degrees)
const numRays = 750; // Number of rays for rendering
const maxDepth = 750; // Max depth for rays

// Input handling
const keys = {};
let mouseDeltaX = 0;
// Maximum pitch (up and down limits)
const maxPitch = Math.PI / 3; // 45 degrees up/down

// Textures loaded flag
let texturesLoaded = false;

// Wait for textures to load
window.addEventListener('load', () => {
    texturesLoaded = true;
});

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

// Update the bullet physics to include enemy collision
function updateBullets() {
    const tileSize = 50;
    const now = Date.now();

    for (let i = gun.bullets.length - 1; i >= 0; i--) {
        const bullet = gun.bullets[i];

        // Calculate time-based speed factor
        const speedFactor = 1 + bullet.distanceTraveled / 500;
        const effectiveSpeed = gun.bulletSpeed * speedFactor;

        // Calculate the 3D direction vector components
        const dirX = Math.cos(bullet.angle) * Math.cos(bullet.pitch);
        const dirY = Math.sin(bullet.angle) * Math.cos(bullet.pitch);
        const dirZ = Math.sin(bullet.pitch);

        // Move the bullet in 3D space
        bullet.x += dirX * effectiveSpeed;
        bullet.y += dirY * effectiveSpeed;
        bullet.z += dirZ * effectiveSpeed;

        bullet.distanceTraveled += effectiveSpeed;

        // Check for enemy collisions first
        let hitEnemy = false;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            // Skip dead enemies
            if (enemy.state === 'dead') continue;

            // Calculate distance from bullet to enemy
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dz = bullet.z - enemy.z;

            // Check for collision (simple distance check)
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.size) {
                // Hit enemy!
                hitEnemy = true;

                // Damage enemy
                damageEnemy(enemy, 25); // 25 damage per bullet

                // Create impact effect at bullet position
                createImpactEffect(bullet.x, bullet.y, bullet.z);

                // Remove bullet
                gun.bullets.splice(i, 1);
                break;
            }
        }

        // Skip wall check if we already hit an enemy
        if (hitEnemy) continue;

        // Wall collision check (using map boundaries for simplicity)
        const mapX = Math.floor(bullet.x / tileSize);
        const mapY = Math.floor(bullet.y / tileSize);
        if (map[mapY] && map[mapY][mapX] === 1) {
            createImpactEffect(bullet.x, bullet.y, bullet.z);
            gun.bullets.splice(i, 1);
            continue;
        }

        // Bullet lifetime
        const maxRange = 1000;
        const maxLifetime = 3000;
        if (bullet.distanceTraveled > maxRange || (now - bullet.createdTime > maxLifetime)) {
            gun.bullets.splice(i, 1);
        }
    }
}

// Helper function to create screen coordinates for 3D points
function worldToScreen(x, y, z) {
    // Calculate vector from player to point
    const dx = x - player.x;
    const dy = y - player.y;
    const dz = z - player.z;

    // Distance to point
    const flatDistance = Math.sqrt(dx * dx + dy * dy);

    // Angle calculations
    const angleToPoint = Math.atan2(dy, dx);
    const relativeAngle = angleToPoint - player.angle;
    const normalizedAngle = ((relativeAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

    // Vertical angle calculation
    const verticalAngle = Math.atan2(dz, flatDistance);

    // Screen coordinates
    const screenX = canvas.width / 2 + (normalizedAngle / (fov / 2)) * (canvas.width / 2);
    const screenY = canvas.height / 2 - (verticalAngle - player.pitch) * canvas.height;

    return {
        x: screenX,
        y: screenY,
        visible: Math.abs(normalizedAngle) <= fov / 2,
        distance: flatDistance
    };
}

// Fix shoot function to spawn bullets correctly
function shoot() {
    const now = Date.now();
    if (now - gun.lastShotTime >= gun.fireRate) {
        gun.lastShotTime = now;

        // Add recoil effect
        gun.recoil = gun.maxRecoil;

        // Create muzzle flash effect
        createMuzzleFlash();

        // Forward offset from player position
        const forwardDistance = 20;

        // Calculate the gun barrel world position - using player's direction
        const bulletStartX = player.x + Math.cos(player.angle) * forwardDistance;
        const bulletStartY = player.y + Math.sin(player.angle) * forwardDistance;

        // Calculate Z position based on pitch
        // This ensures bullets appear to come from the center of the screen
        const bulletStartZ = player.z; // Start at player eye level

        // Create the bullet
        gun.bullets.push({
            x: bulletStartX,
            y: bulletStartY,
            z: bulletStartZ,
            angle: player.angle,
            pitch: player.pitch,
            distanceTraveled: 0,
            createdTime: now
        });
    }
}

// Add a tracer function to draw bullets
function drawTracerFromGun(from, to) {
    // Parameters define the screen coordinates of gun barrel and bullet
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    gradient.addColorStop(0, 'rgba(255, 255, 120, 0.9)'); // Brighter at the gun barrel
    gradient.addColorStop(0.3, 'rgba(255, 200, 50, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 150, 0, 0.1)');

    // Draw a wider line for more visibility
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Add a small glow at the barrel point
    ctx.fillStyle = 'rgba(255, 255, 150, 0.6)';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Add a muzzle flash effect
function createMuzzleFlash() {
    // If we don't have muzzle flash property, create it
    if (!gun.muzzleFlash) {
        gun.muzzleFlash = {
            active: false,
            duration: 0,
            maxDuration: 100 // milliseconds
        };
    }

    // Activate the muzzle flash
    gun.muzzleFlash.active = true;
    gun.muzzleFlash.duration = gun.muzzleFlash.maxDuration;
}

// Modify drawGun to draw muzzle flash behind gun
function drawGun() {
    // Update recoil recovery
    if (gun.recoil > 0) {
        gun.recoil -= gun.recoilRecovery;
        if (gun.recoil < 0) gun.recoil = 0;
    }

    const gunWidth = 300; // Set the gun image width
    const gunHeight = 300; // Set the gun image height

    // Add recoil effect to gun position
    const recoilOffsetY = gun.recoil;

    const gunX = canvas.width / 2 - gunWidth / 2 + 150; // Center the gun horizontally
    const gunY = canvas.height - gunHeight + recoilOffsetY; // Position with recoil offset

    // Use the preloaded gun texture
    const gunTexture = document.getElementById('gunTexture');
    if (gunTexture && gunTexture.complete) {
        // First, draw muzzle flash if active (BEFORE drawing the gun)
        if (gun.muzzleFlash && gun.muzzleFlash.active) {
            // Update muzzle flash duration
            gun.muzzleFlash.duration -= 16.67; // Approximate time between frames
            if (gun.muzzleFlash.duration <= 0) {
                gun.muzzleFlash.active = false;
            }

            // Draw muzzle flash BEHIND the gun
            if (gun.muzzleFlash.active) {
                // Muzzle flash position relative to gun - you can adjust these values
                const flashX = gunX + 60; // Adjust this value to position the flash horizontally
                const flashY = gunY + 40; // Adjust this value to position the flash vertically

                // Flash size with some randomness for effect
                const flashSize = 30 + Math.random() * 10;

                // Create gradient for the flash
                const gradient = ctx.createRadialGradient(
                    flashX, flashY, 0,
                    flashX, flashY, flashSize
                );
                gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
                gradient.addColorStop(0.2, 'rgba(255, 200, 50, 0.8)');
                gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Then draw the gun on top of the muzzle flash
        ctx.drawImage(gunTexture, gunX, gunY, gunWidth, gunHeight);
    }
}

// Add a bullet impact effect
function createImpactEffect(x, y, z) {
    // If we don't have an impacts array, create it
    if (!gun.impacts) {
        gun.impacts = [];
    }

    // Add a new impact
    gun.impacts.push({
        x: x,
        y: y,
        z: z,
        size: 10,
        alpha: 1.0,
        duration: 300, // milliseconds
        createdTime: Date.now()
    });
}

// Fix bullet trajectory when looking up or down using the worldToScreen helper
function drawBullets() {
    // Reset drawing settings
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    // Gun barrel screen position - CONSTANT in screen space regardless of view direction
    // These values represent where the gun barrel appears on screen
    const gunBarrelX = canvas.width / 2 + 60; // Aligned with the flash position
    const gunBarrelY = canvas.height - 250;   // Constant position on screen

    // Draw bullets
    for (const bullet of gun.bullets) {
        // Convert bullet world position to screen position using our helper
        const bulletScreen = worldToScreen(bullet.x, bullet.y, bullet.z);

        // If bullet is not visible, skip rendering
        if (!bulletScreen.visible) continue;

        // Determine if bullet is very close to player (just fired)
        const isNewBullet = bullet.distanceTraveled < 50;

        // If it's a new bullet, draw a tracer effect from gun to bullet position
        if (isNewBullet) {
            // Use our tracer function to draw a line from gun to bullet
            drawTracerFromGun(
                { x: gunBarrelX, y: gunBarrelY }, 
                { x: bulletScreen.x, y: bulletScreen.y }
            );
        }

        // Size based on distance (smaller at distance, larger up close)
        const bulletSize = Math.max(2, 12 / (1 + bulletScreen.distance * 0.02));

        // Draw bullet with a glowing effect - central bright part
        ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
        ctx.beginPath();
        ctx.arc(bulletScreen.x, bulletScreen.y, bulletSize, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        const bulletGradient = ctx.createRadialGradient(
            bulletScreen.x, bulletScreen.y, bulletSize * 0.5,
            bulletScreen.x, bulletScreen.y, bulletSize * 2.5
        );
        bulletGradient.addColorStop(0, 'rgba(255, 200, 50, 0.7)');
        bulletGradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)');
        bulletGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = bulletGradient;
        ctx.beginPath();
        ctx.arc(bulletScreen.x, bulletScreen.y, bulletSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw impact effects using worldToScreen
    if (gun.impacts) {
        const now = Date.now();
        for (let i = gun.impacts.length - 1; i >= 0; i--) {
            const impact = gun.impacts[i];

            // Calculate elapsed time
            const elapsed = now - impact.createdTime;

            // Remove expired impacts
            if (elapsed > impact.duration) {
                gun.impacts.splice(i, 1);
                continue;
            }

            // Convert impact world position to screen position
            const impactScreen = worldToScreen(impact.x, impact.y, impact.z);

            // Skip if outside view
            if (!impactScreen.visible) continue;

            // Calculate fade-out based on elapsed time
            const progress = elapsed / impact.duration;
            const alpha = 1.0 - progress;
            const size = impact.size * (1 + progress * 2); // Grow more as it fades

            // Draw impact
            const impactGradient = ctx.createRadialGradient(
                impactScreen.x, impactScreen.y, 0,
                impactScreen.x, impactScreen.y, size
            );
            impactGradient.addColorStop(0, `rgba(255, 220, 150, ${alpha * 0.9})`);
            impactGradient.addColorStop(0.3, `rgba(200, 120, 50, ${alpha * 0.7})`);
            impactGradient.addColorStop(0.7, `rgba(100, 50, 20, ${alpha * 0.3})`);
            impactGradient.addColorStop(1, `rgba(50, 20, 0, 0)`);

            ctx.fillStyle = impactGradient;
            ctx.beginPath();
            ctx.arc(impactScreen.x, impactScreen.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Update player position and angle
function update() {
    // Update rotation (mouse look)
    player.angle += mouseDeltaX;
    mouseDeltaX = 0;

    // Normalize angle
    if (player.angle < 0) player.angle += Math.PI * 2;
    if (player.angle >= Math.PI * 2) player.angle -= Math.PI * 2;

    // Update light source position if it follows the player
    if (lightSource.followPlayer) {
        lightSource.x = player.x;
        lightSource.y = player.y;
    }

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

    // Update enemies
    updateEnemies();
}

const lightSource = {
    x: 300, // Light source position
    y: 300,
    intensity: 2.0, // Increased from 1.0 for brighter lighting
    followPlayer: true, // Make light follow the player
};

// Add a function to check if texture is valid
function isTextureValid() {
    // Try primary texture first
    if (wallTexture && wallTexture.complete && wallTexture.naturalWidth > 0) {
        return { valid: true, texture: wallTexture };
    }

    // Try fallback texture
    if (wallTextureFallback && wallTextureFallback.complete && wallTextureFallback.naturalWidth > 0) {
        return { valid: true, texture: wallTextureFallback };
    }

    // No valid texture found
    return { valid: false, texture: null };
}

// Modify the draw function to eliminate the gray vertical lines
function draw() {
    if (!allResourcesLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the pitch offset
    const pitchOffset = player.pitch * canvas.height;

    // Check texture validity 
    const textureResult = isTextureValid();
    const textureValid = textureResult.valid;
    const activeTexture = textureResult.texture;

    // First render pass - draw the ceiling and floor
    // Draw ceiling
    const ceilingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2 + pitchOffset);
    ceilingGradient.addColorStop(0, '#3a3a3a');
    ceilingGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = ceilingGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + pitchOffset);

    // Draw floor
    const floorGradient = ctx.createLinearGradient(0, canvas.height / 2 + pitchOffset, 0, canvas.height);
    floorGradient.addColorStop(0, '#5f615a');
    floorGradient.addColorStop(1, '#3e3f37');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, canvas.height / 2 + pitchOffset, canvas.width, canvas.height - (canvas.height / 2 + pitchOffset));

    // Second render pass - draw the walls
    // Reset for wall drawing
    ctx.globalAlpha = 1.0;

    // Cast rays and draw walls
    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1; // Normalized screen coordinate
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle);

        // Skip rays that don't hit walls
        if (ray.distance >= maxDepth) continue;

        const wallHeight = (canvas.height / ray.distance) * 50;

        // Calculate slice position
        const sliceX = Math.floor(i * (canvas.width / numRays));
        const sliceWidth = Math.ceil(canvas.width / numRays) + (i === numRays - 1 ? 1 : 0);

        // Calculate wall top and bottom positions
        const wallTop = Math.floor(canvas.height / 2 - wallHeight / 2 + pitchOffset);
        const wallHeightCeil = Math.ceil(wallHeight);

        // Apply the light effect and ambient occlusion
        const brightness = Math.max(0.6, Math.min(1, ray.lightEffect * ray.aoFactor * 3));

        // Draw wall slice with texture
        if (textureValid && activeTexture) {
            // Calculate texture X coordinate
            const texturePosition = Math.abs(ray.textureX % 50);
            const textureX = Math.floor((texturePosition / 50) * activeTexture.width);

            if (textureX >= 0 && textureX < activeTexture.width) {
                // First draw the full texture
                ctx.drawImage(
                    activeTexture,
                    textureX, 0, 1, activeTexture.height,
                    sliceX, wallTop, sliceWidth, wallHeightCeil
                );

                // Then apply shading based on distance and lighting
                if (brightness < 1.0) {
                    // Apply darkness with a transparent overlay
                    const shade = 1 - brightness;
                    ctx.fillStyle = `rgba(0, 0, 0, ${shade * 0.7})`;
                    ctx.fillRect(sliceX, wallTop, sliceWidth, wallHeightCeil);
                }
            }
        } else {
            // Use fallback solid color
            ctx.fillStyle = FALLBACK_WALL_COLOR;
            ctx.fillRect(sliceX, wallTop, sliceWidth, wallHeightCeil);
        }
    }
}

// Remove the old ceiling/floor gradient function since it's now handled within draw()
// function addCeilingAndFloorGradient(pitchOffset) { ... }
// Instead, add a utility function to get ceiling/floor colors:

function getCeilingColor(position) {
    // position is between 0 (top of screen) and 1 (horizon)
    const shade = 0.15 + position * 0.1; // darker at top, lighter near horizon
    return `rgb(${Math.floor(shade * 58)}, ${Math.floor(shade * 58)}, ${Math.floor(shade * 58)})`;
}

function getFloorColor(position) {
    // position is between 0 (horizon) and 1 (bottom of screen)
    const shade = 0.24 + position * 0.08; // lighter at horizon, darker at bottom
    return `rgb(${Math.floor(shade * 95)}, ${Math.floor(shade * 97)}, ${Math.floor(shade * 90)})`;
}

function getAmbientOcclusion(x, y) {
    const adjacentWalls = [
        map[y - 1]?.[x], // Top
        map[y + 1]?.[x], // Bottom
        map[y]?.[x - 1], // Left
        map[y]?.[x + 1], // Right
        map[y - 1]?.[x - 1], // Top-left
        map[y - 1]?.[x + 1], // Top-right
        map[y + 1]?.[x - 1], // Bottom-left
        map[y + 1]?.[x + 1], // Bottom-right
    ].filter(Boolean).length; // Count walls

    // Scale ambient occlusion based on adjacent walls
    // Increased minimum light level to 0.7 (from 0.4)
    return Math.max(0.7, 1 - adjacentWalls / 16);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 16;
    canvas.height = window.innerHeight - 16;

    // Update crosshair position after resize
    crosshairElement.style.top = `${canvas.height / 2}px`;
    crosshairElement.style.left = `${canvas.width / 2}px`;
});

// Game loop with fixed timestep for physics
function gameLoop() {
    if (!allResourcesLoaded) return; // Don't run until resources are loaded

    // Update game logic
    update();
    updateBullets();

    // Render
    draw();
    drawEnemies(); // Draw enemies before bullets and gun for correct z-ordering
    drawBullets();
    drawGun();

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Spawn enemies when the game starts
// Check if resources are already loaded (cached)
if (resources.every(resource => resource.loaded)) {
    allResourcesLoaded = true;
    loadingScreen.style.display = 'none';
    gameStarted = true;
    spawnEnemies(); // Spawn enemies when game starts
    gameLoop();
} else {
    // Resources still loading, will start via the updateLoadingProgress function
    updateLoadingProgress();
}

// Cast a single ray
function castRay(rayAngle) {
    let x = player.x;
    let y = player.y;

    // Normalize angle
    rayAngle = rayAngle % (Math.PI * 2);
    if (rayAngle < 0) rayAngle += Math.PI * 2;

    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    // Use a consistent step size
    const stepSize = 1.0;

    for (let depth = 0; depth < maxDepth; depth += stepSize) {
        // Increment position
        x += cos * stepSize;
        y += sin * stepSize;

        // Convert to map coordinates
        const mapX = Math.floor(x / 50);
        const mapY = Math.floor(y / 50);

        // Check if we've hit a wall
        if (map[mapY] && map[mapY][mapX] === 1) {
            // Calculate exact hit position for texture mapping
            const tileSize = 50;

            // Determine texture coordinates
            const hitX = x % tileSize;
            const hitY = y % tileSize;

            // Determine which side of the wall we hit (vertical or horizontal)
            const isVerticalHit = Math.abs(hitX) < Math.abs(hitY);

            // Choose texture X based on hit side
            let textureX;
            if (isVerticalHit) {
                textureX = hitY;
            } else {
                textureX = hitX;
            }

            // Calculate distance (correct for fisheye effect)
            const rayDistance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
            const correctedDistance = rayDistance * Math.cos(rayAngle - player.angle);

            // Lighting calculations
            const dx = lightSource.x - x;
            const dy = lightSource.y - y;
            const distanceToLight = Math.sqrt(dx ** 2 + dy ** 2);

            // Simplified lighting calculation
            const lightEffect = 0.7 + (lightSource.intensity / (1 + distanceToLight / 200)) * 0.3;

            // Add ambient occlusion
            const aoFactor = getAmbientOcclusion(mapX, mapY);

            return {
                distance: correctedDistance,
                textureX,
                lightEffect,
                aoFactor,
                mapX,
                mapY
            };
        }
    }

    return {
        distance: maxDepth,
        lightEffect: 0.5,
        aoFactor: 1
    };
}

// Add back the mouse event listener for shooting
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left mouse button
        shoot();
    }
});

// Function to damage an enemy
function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    enemy.state = 'hurt';
    enemy.hitTime = Date.now();

    // Check if enemy is dead
    if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.state = 'dead';
    }
}

// Function to update enemy behavior
function updateEnemies() {
    const now = Date.now();
    const tileSize = 50;

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        // Skip dead enemies
        if (enemy.state === 'dead') continue;

        // Calculate time since last update
        const elapsed = now - enemy.lastUpdate;
        enemy.lastUpdate = now;

        // Reset state if no longer hurt
        if (enemy.state === 'hurt' && now - enemy.hitTime > 200) {
            enemy.state = 'idle';
        }

        // Determine if enemy can see player (simple line of sight check)
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // Direction to player
        const angleToPlayer = Math.atan2(dy, dx);

        // Check if player is within detection range
        const detectionRange = 500; // How far enemies can see

        if (distToPlayer < detectionRange && !isWallBetween(enemy.x, enemy.y, player.x, player.y)) {
            // Player is visible, chase them!
            enemy.state = 'chasing';
            enemy.angle = angleToPlayer;

            // Move toward player
            const speed = ENEMY_TYPES[enemy.type].speed * (elapsed / 16.67); // Adjust for frame time

            // Calculate next position
            const nextX = enemy.x + Math.cos(enemy.angle) * speed;
            const nextY = enemy.y + Math.sin(enemy.angle) * speed;

            // Check for wall collisions
            const nextMapX = Math.floor(nextX / tileSize);
            const nextMapY = Math.floor(nextY / tileSize);

            // Only move if not going to hit a wall
            if (map[nextMapY] && map[nextMapY][nextMapX] === 0) {
                enemy.x = nextX;
                enemy.y = nextY;
            }

            // Check if close enough to attack
            const attackRange = 80;
            if (distToPlayer < attackRange) {
                enemy.state = 'attacking';
                // Attack logic would go here
            }
        } else {
            // Player not visible, go back to idle
            if (enemy.state === 'chasing' || enemy.state === 'attacking') {
                enemy.state = 'idle';
            }

            // Idle behavior - maybe patrol or stand still
            // For now, just stand still
        }
    }
}

// Function to check if there's a wall between two points
function isWallBetween(x1, y1, x2, y2) {
    // Simple line-tracing algorithm to check for walls
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Direction
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Step size for checking
    const tileSize = 50;
    const stepSize = tileSize / 2;

    // Check along the line
    let currentX = x1;
    let currentY = y1;

    for (let i = 0; i < distance; i += stepSize) {
        currentX += dirX * stepSize;
        currentY += dirY * stepSize;

        // Check if point is in a wall
        const mapX = Math.floor(currentX / tileSize);
        const mapY = Math.floor(currentY / tileSize);

        if (map[mapY] && map[mapY][mapX] === 1) {
            return true; // Wall found!
        }
    }

    return false; // No wall found
}

// Draw enemies in the 3D world
function drawEnemies() {
    // Reset drawing settings
    ctx.globalAlpha = 1.0;

    // Sort enemies by distance (render far to near)
    const sortedEnemies = [...enemies].sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - player.x, 2) + Math.pow(a.y - player.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2));
        return distB - distA; // Far to near
    });

    // Draw each enemy
    for (const enemy of sortedEnemies) {
        // Skip dead enemies for now
        // Later we could add death animations
        if (enemy.state === 'dead') continue;

        // Calculate distance and angle to enemy
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distToEnemy = Math.sqrt(dx * dx + dy * dy);

        // Check if enemy is behind a wall using raycasting
        if (isOccluded(player.x, player.y, enemy.x, enemy.y)) {
            continue; // Skip rendering this enemy as it's occluded by a wall
        }

        // Convert to screen space
        const screenPos = worldToScreen(enemy.x, enemy.y, enemy.z);

        // If not visible in view frustum, skip
        if (!screenPos.visible) continue;

        // Calculate size based on distance
        const scaleFactor = 900 / screenPos.distance; // Adjust this value to change enemy size
        const width = enemy.size * scaleFactor;
        const height = enemy.size * 2 * scaleFactor; // Enemies are twice as tall as wide

        // Determine enemy color based on state
        let color = ENEMY_TYPES[enemy.type].color;
        if (enemy.state === 'hurt') {
            // Flash white when hit
            color = 'white';
        } else if (enemy.state === 'chasing') {
            // Slightly different color when chasing
            color = '#ff3030';
        } else if (enemy.state === 'attacking') {
            // Different color when attacking
            color = '#ff0000';
        }

        // Draw enemy as a rectangle
        ctx.fillStyle = color;
        ctx.fillRect(
            screenPos.x - width / 2,
            screenPos.y - height / 2,
            width,
            height
        );

        // Draw health bar above enemy
        const healthPct = enemy.health / ENEMY_TYPES[enemy.type].maxHealth;
        const healthBarWidth = width;
        const healthBarHeight = 5 * scaleFactor;

        // Background (red)
        ctx.fillStyle = 'red';
        ctx.fillRect(
            screenPos.x - healthBarWidth / 2,
            screenPos.y - height / 2 - healthBarHeight * 2,
            healthBarWidth,
            healthBarHeight
        );

        // Foreground (green)
        ctx.fillStyle = 'green';
        ctx.fillRect(
            screenPos.x - healthBarWidth / 2,
            screenPos.y - height / 2 - healthBarHeight * 2,
            healthBarWidth * healthPct,
            healthBarHeight
        );
    }
}

// New function to check if an enemy is occluded by a wall
function isOccluded(x1, y1, x2, y2) {
    // Simple line-tracing algorithm to check for walls between player and enemy
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Direction
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Step size for checking - smaller step size for better precision
    const tileSize = 50;
    const stepSize = tileSize / 4;

    // Check along the line, stopping just short of the enemy
    let currentX = x1;
    let currentY = y1;

    // Check up to 95% of the distance to prevent self-occlusion issues
    const checkDistance = distance * 0.95;

    for (let i = 0; i < checkDistance; i += stepSize) {
        currentX += dirX * stepSize;
        currentY += dirY * stepSize;

        // Check if point is in a wall
        const mapX = Math.floor(currentX / tileSize);
        const mapY = Math.floor(currentY / tileSize);

        if (map[mapY] && map[mapY][mapX] === 1) {
            return true; // Wall found between player and enemy
        }
    }

    return false; // No wall found between player and enemy
}
