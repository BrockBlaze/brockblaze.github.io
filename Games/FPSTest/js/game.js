import { player, updatePlayer } from './player.js';
import { gun, reloadWeapon, shoot, createMuzzleFlash, drawGun, createImpactEffect, drawBullets, drawTracerFromGun } from './gun.js';
import { enemies, spawnEnemy, updateEnemies, drawEnemies, damageEnemy } from './enemy.js';
import { draw, drawHUD, drawMenu, drawPauseScreen, drawGameOver } from './renderer.js';
import { loadAllSounds } from './sounds.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wallTexture = document.getElementById('wallTexture');
const wallTextureFallback = document.getElementById('wallTextureFallback');
const wallTexture2 = document.getElementById('wallTexture2');
const floorTexture = document.getElementById('floorTexture');
const ceilingTexture = document.getElementById('ceilingTexture');

const textures = {
    wall: wallTexture,
    wall2: wallTexture2,
    floor: floorTexture,
    ceiling: ceilingTexture
};
const crosshairElement = document.getElementById('crosshair');
const loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.querySelector('.progress');

// At the top of the file, add a fallback wall color
const FALLBACK_WALL_COLOR = '#555555';

// Game states
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    WIN: 'win'
};

let gameState = GAME_STATES.MENU;
let waveNumber = 1;
let enemiesPerWave = 5;

let sounds = {};

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
    { element: document.getElementById('wallTexture2'), loaded: false },
    { element: document.getElementById('floorTexture'), loaded: false },
    { element: document.getElementById('ceilingTexture'), loaded: false },
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

    if (loadedCount === resources.length && !gameStarted) {
        allResourcesLoaded = true;
        // Hide loading screen with fade effect
        loadingScreen.style.opacity = '0';
        
        // Load sounds then start game
        loadAllSounds().then(loadedSounds => {
            sounds = loadedSounds;
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // Start the game
                if (!gameStarted) {
                    gameStarted = true;
                    gameState = GAME_STATES.MENU;
                    gameLoop();
                }
            }, 500);
        });
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


// Map (larger, more complex layout)
// 0 = empty space, 1 = wall, 2 = different wall type, 3 = pillar
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 3, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Raycasting settings
const fov = Math.PI / 3; // Field of view (60 degrees)
const numRays = 400; // Number of rays for rendering
const maxDepth = 1000; // Max depth for rays
const wallHeight = 64; // Standard wall height

// Input handling
const keys = {};
let mouseDeltaX = 0;
let mouseDeltaY = 0;
let isMouseDown = false;
// Maximum pitch (up and down limits)
const maxPitch = Math.PI / 3; // 45 degrees up/down

// Textures loaded flag
let texturesLoaded = false;

// Wait for textures to load
window.addEventListener('load', () => {
    texturesLoaded = true;
});

canvas.addEventListener('click', () => {
    if (gameState === GAME_STATES.MENU) {
        gameState = GAME_STATES.PLAYING;
        resetGame();
        canvas.requestPointerLock();
    } else if (gameState === GAME_STATES.GAME_OVER) {
        gameState = GAME_STATES.MENU;
    } else if (gameState === GAME_STATES.PLAYING) {
        canvas.requestPointerLock();
    }
});

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Handle special keys
    if (e.key.toLowerCase() === 'r' && gun.ammo < gun.maxAmmo && !gun.isReloading) {
        reloadWeapon();
        sounds.reload.play();
    }
    
    // Pause game
    if (e.key === 'Escape' && gameState === GAME_STATES.PLAYING) {
        gameState = GAME_STATES.PAUSED;
        document.exitPointerLock();
    } else if (e.key === 'Escape' && gameState === GAME_STATES.PAUSED) {
        gameState = GAME_STATES.PLAYING;
        canvas.requestPointerLock();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    // Reset sprint/crouch on key release
    if (e.key.toLowerCase() === 'shift') player.isSprinting = false;
    if (e.key.toLowerCase() === 'c') player.isCrouching = false;
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        mouseDeltaX += e.movementX;
        mouseDeltaY += e.movementY;
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
                sounds.enemyHit.play(); // Play hit sound

                // Damage enemy
                const waveComplete = damageEnemy(enemy, gun.damage, player, sounds, gun);
                if (waveComplete) {
                    setTimeout(() => {
                        waveNumber++;
                        enemiesPerWave = Math.min(enemiesPerWave + 2, 15);
                        spawnWave();
                    }, 2000);
                }

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
        if (map[mapY] && map[mapY][mapX] > 0) {
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



function update() {
    updatePlayer(keys, mouseDeltaX, mouseDeltaY, map, lightSource);
    mouseDeltaX = 0;
    mouseDeltaY = 0;
    const newGameState = updateEnemies(player, map, keys, isMouseDown, sounds, GAME_STATES);
    if (newGameState) {
        gameState = newGameState;
        if (gameState === GAME_STATES.GAME_OVER) {
            document.exitPointerLock();
        }
    }
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
    if (!allResourcesLoaded) return;

    if (gameState === GAME_STATES.MENU) {
        drawMenu(ctx, canvas);
    } else if (gameState === GAME_STATES.PLAYING) {
        // Update game logic
        update();
        updateBullets();

        draw(ctx, canvas, player, allResourcesLoaded, numRays, fov, maxDepth, wallHeight, castRay, map, FALLBACK_WALL_COLOR, textures);
        drawEnemies(ctx, player, worldToScreen, map);
        drawBullets(ctx, canvas, worldToScreen);
        drawGun(ctx, canvas, player);
        drawHUD(ctx, canvas, player, gun, map, enemies);
        
        // Draw wave number
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${waveNumber}`, canvas.width / 2, 50);
    } else if (gameState === GAME_STATES.PAUSED) {
        draw(ctx, canvas, player, allResourcesLoaded, numRays, fov, maxDepth, wallHeight, castRay, map, FALLBACK_WALL_COLOR, textures);
        drawEnemies(ctx, player, worldToScreen, map);
        drawBullets(ctx, canvas, worldToScreen);
        drawGun(ctx, canvas, player);
        drawHUD(ctx, canvas, player, gun, map, enemies);
        drawPauseScreen(ctx, canvas);
    } else if (gameState === GAME_STATES.GAME_OVER) {
        drawGameOver(ctx, canvas, player, waveNumber);
    }

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Spawn enemies when the game starts
// Check if resources are already loaded (cached)
if (resources.every(resource => resource.loaded)) {
    allResourcesLoaded = true;
    loadingScreen.style.display = 'none';
    
    // Load sounds then start game
    loadAllSounds().then(loadedSounds => {
        sounds = loadedSounds;
        if (!gameStarted) {
            gameStarted = true;
            gameState = GAME_STATES.MENU;
            gameLoop();
        }
    });
} else {
    // Resources still loading, will start via the updateLoadingProgress function
    updateLoadingProgress();
}


function spawnWave() {
    for (let i = 0; i < enemiesPerWave; i++) {
        const type = Math.random() > 0.7 ? 'HEAVY' : (Math.random() > 0.4 ? 'SOLDIER' : 'SCOUT');
        spawnEnemy(type, map, player);
    }
}

// Reset game function
function resetGame() {
    player.health = player.maxHealth;
    player.x = 125;
    player.y = 125;
    player.z = 0;
    player.angle = 0;
    player.pitch = 0;
    player.score = 0;
    gun.ammo = gun.maxAmmo;
    gun.totalAmmo = 120;
    enemies.length = 0;
    gun.bullets.length = 0;
    waveNumber = 1;
    enemiesPerWave = 5;
    spawnWave();
}

function getAmbientOcclusion(x, y, map) {
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

// Cast a single ray
function castRay(rayAngle, player, maxDepth, map, wallHeight) {
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
        if (map[mapY] && map[mapY][mapX] > 0) {
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
            const aoFactor = getAmbientOcclusion(mapX, mapY, map);

            return {
                distance: correctedDistance,
                textureX,
                lightEffect,
                aoFactor,
                mapX,
                mapY,
                wallType: map[mapY][mapX] // Return the wall type
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
    if (e.button === 0) {
        isMouseDown = true;
        shoot(player, sounds);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        isMouseDown = false;
    }
});

// Auto-fire while holding mouse
setInterval(() => {
    if (isMouseDown && document.pointerLockElement === canvas) {
        shoot(player, sounds);
    }
}, gun.fireRate);