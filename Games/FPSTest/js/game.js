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

// Sound system placeholder
const sounds = {
    shoot: { play: () => console.log('Sound: Shoot') },
    reload: { play: () => console.log('Sound: Reload') },
    enemyHit: { play: () => console.log('Sound: Enemy Hit') },
    playerHit: { play: () => console.log('Sound: Player Hit') },
    footstep: { play: () => console.log('Sound: Footstep') },
    enemyDeath: { play: () => console.log('Sound: Enemy Death') },
    pickup: { play: () => console.log('Sound: Pickup') },
    ambience: { play: () => console.log('Sound: Ambience') }
};

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

    if (loadedCount === resources.length) {
        allResourcesLoaded = true;
        // Hide loading screen with fade effect
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Start the game
            if (!gameStarted) {
                gameStarted = true;
                gameState = GAME_STATES.MENU;
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

// Gun properties
const gun = {
    fireRate: 150, // Milliseconds between shots
    lastShotTime: 0, // Timestamp of the last shot
    bulletSpeed: 20, // Speed of bullets
    bullets: [], // Array to store active bullets
    recoil: 0, // Current recoil amount
    maxRecoil: 15, // Maximum recoil displacement
    recoilRecovery: 0.5, // How quickly recoil recovers
    muzzleFlash: null, // Muzzle flash effect
    impacts: [], // Impact effects
    ammo: 30,
    maxAmmo: 30,
    totalAmmo: 120,
    isReloading: false,
    reloadTime: 2000,
    damage: 35,
    spread: 0.02 // Bullet spread for realism
};

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

// Enemy data structure
const ENEMY_TYPES = {
    SOLDIER: {
        maxHealth: 100,
        speed: 0.8,
        damage: 10,
        size: 20,
        texture: null,
        color: 'red',
        attackCooldown: 1000,
        viewDistance: 500,
        hearingDistance: 300
    },
    HEAVY: {
        maxHealth: 200,
        speed: 0.4,
        damage: 20,
        size: 25,
        texture: null,
        color: 'darkred',
        attackCooldown: 1500,
        viewDistance: 400,
        hearingDistance: 200
    },
    SCOUT: {
        maxHealth: 50,
        speed: 1.5,
        damage: 5,
        size: 15,
        texture: null,
        color: 'orange',
        attackCooldown: 500,
        viewDistance: 600,
        hearingDistance: 400
    }
};

// Create enemies array
let enemies = [];

// Function to spawn enemies
function spawnEnemies() {
    // Spawn different enemy types
    for (let i = 0; i < 3; i++) {
        spawnEnemy('SOLDIER');
    }
    for (let i = 0; i < 2; i++) {
        spawnEnemy('SCOUT');
    }
    spawnEnemy('HEAVY');
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

    // Create enemy object with enhanced properties
    const enemy = {
        type: type,
        x: x,
        y: y,
        z: 0,
        health: ENEMY_TYPES[type].maxHealth,
        angle: Math.random() * Math.PI * 2,
        state: 'idle',
        lastUpdate: Date.now(),
        hitTime: 0,
        size: ENEMY_TYPES[type].size,
        lastAttackTime: 0,
        patrolTarget: null,
        alertLevel: 0, // 0 = unaware, 1 = searching, 2 = engaged
        lastKnownPlayerPos: null,
        stuckCounter: 0,
        lastPosition: { x: x, y: y }
    };

    enemies.push(enemy);
    return enemy;
}

// Raycasting settings
const fov = Math.PI / 3; // Field of view (60 degrees)
const numRays = 400; // Number of rays for rendering
const maxDepth = 1000; // Max depth for rays
const wallHeight = 64; // Standard wall height

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
        const sensitivity = 0.002; // Improved sensitivity
        mouseDeltaX = e.movementX * sensitivity;
        const mouseDeltaY = e.movementY * sensitivity;

        player.angle += mouseDeltaX;
        player.pitch -= mouseDeltaY;

        // Clamp pitch to the maximum limits
        player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));
        
        // Normalize angle
        while (player.angle < 0) player.angle += Math.PI * 2;
        while (player.angle >= Math.PI * 2) player.angle -= Math.PI * 2;
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
                damageEnemy(enemy, gun.damage);

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

// Reload weapon function
function reloadWeapon() {
    if (gun.isReloading || gun.ammo === gun.maxAmmo || gun.totalAmmo === 0) return;
    
    gun.isReloading = true;
    const ammoNeeded = gun.maxAmmo - gun.ammo;
    const ammoToReload = Math.min(ammoNeeded, gun.totalAmmo);
    
    setTimeout(() => {
        gun.ammo += ammoToReload;
        gun.totalAmmo -= ammoToReload;
        gun.isReloading = false;
    }, gun.reloadTime);
}

// Fix shoot function to spawn bullets correctly
function shoot() {
    const now = Date.now();
    if (now - gun.lastShotTime >= gun.fireRate && gun.ammo > 0 && !gun.isReloading) {
        gun.lastShotTime = now;
        gun.ammo--;
        sounds.shoot.play(); // Play shoot sound
        
        // Auto-reload when empty
        if (gun.ammo === 0 && gun.totalAmmo > 0) {
            reloadWeapon();
            sounds.reload.play();
        }

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

        // Add bullet spread for realism
        const spreadX = (Math.random() - 0.5) * gun.spread;
        const spreadY = (Math.random() - 0.5) * gun.spread;
        
        // Create the bullet with spread
        gun.bullets.push({
            x: bulletStartX,
            y: bulletStartY,
            z: bulletStartZ,
            angle: player.angle + spreadX,
            pitch: player.pitch + spreadY,
            distanceTraveled: 0,
            createdTime: now,
            tracer: Math.random() < 0.3 // 30% chance for visible tracer
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

                // Enhanced muzzle flash with multiple layers
                const layers = 3;
                for (let i = layers - 1; i >= 0; i--) {
                    const layerSize = flashSize * (1 + i * 0.5);
                    const alpha = 0.3 * ((layers - i) / layers);
                    
                    const gradient = ctx.createRadialGradient(
                        flashX, flashY, 0,
                        flashX, flashY, layerSize
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 240, ${alpha * 1.5})`);
                    gradient.addColorStop(0.2, `rgba(255, 220, 100, ${alpha})`);
                    gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.5})`);
                    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(flashX, flashY, layerSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Add light bloom effect
                ctx.globalCompositeOperation = 'screen';
                const bloom = ctx.createRadialGradient(
                    flashX, flashY, 0,
                    flashX, flashY, flashSize * 2
                );
                bloom.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                bloom.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = bloom;
                ctx.fillRect(flashX - flashSize * 2, flashY - flashSize * 2, flashSize * 4, flashSize * 4);
                ctx.globalCompositeOperation = 'source-over';
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

    // Draw bullets with enhanced effects
    for (const bullet of gun.bullets) {
        const bulletScreen = worldToScreen(bullet.x, bullet.y, bullet.z);
        if (!bulletScreen.visible) continue;

        const isNewBullet = bullet.distanceTraveled < 100;
        
        // Enhanced tracer effect for visible tracers
        if (bullet.tracer && isNewBullet) {
            const gradient = ctx.createLinearGradient(
                gunBarrelX, gunBarrelY,
                bulletScreen.x, bulletScreen.y
            );
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 150, 0, 0.1)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2 + Math.random();
            ctx.beginPath();
            ctx.moveTo(gunBarrelX, gunBarrelY);
            ctx.lineTo(bulletScreen.x, bulletScreen.y);
            ctx.stroke();
        }

        // Dynamic bullet size
        const bulletSize = Math.max(1.5, 10 / (1 + bulletScreen.distance * 0.015));

        // Multi-layer glow effect
        if (bullet.tracer) {
            // Outer glow
            const outerGlow = ctx.createRadialGradient(
                bulletScreen.x, bulletScreen.y, 0,
                bulletScreen.x, bulletScreen.y, bulletSize * 4
            );
            outerGlow.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
            outerGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)');
            outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(bulletScreen.x, bulletScreen.y, bulletSize * 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core bullet
        ctx.fillStyle = bullet.tracer ? 'rgba(255, 255, 150, 1)' : 'rgba(255, 200, 100, 0.8)';
        ctx.beginPath();
        ctx.arc(bulletScreen.x, bulletScreen.y, bulletSize, 0, Math.PI * 2);
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

            // Enhanced impact with sparks
            const sparkCount = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < sparkCount; j++) {
                const sparkAngle = (Math.PI * 2 * j) / sparkCount + progress * 2;
                const sparkDistance = size * (1 + progress) * Math.random();
                const sparkX = impactScreen.x + Math.cos(sparkAngle) * sparkDistance;
                const sparkY = impactScreen.y + Math.sin(sparkAngle) * sparkDistance;
                const sparkSize = 2 * (1 - progress);
                
                ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, 0, ${alpha})`;
                ctx.fillRect(sparkX - sparkSize/2, sparkY - sparkSize/2, sparkSize, sparkSize);
            }
            
            // Main impact glow
            const impactGradient = ctx.createRadialGradient(
                impactScreen.x, impactScreen.y, 0,
                impactScreen.x, impactScreen.y, size
            );
            impactGradient.addColorStop(0, `rgba(255, 240, 200, ${alpha})`);
            impactGradient.addColorStop(0.3, `rgba(255, 180, 100, ${alpha * 0.7})`);
            impactGradient.addColorStop(0.6, `rgba(200, 100, 50, ${alpha * 0.4})`);
            impactGradient.addColorStop(1, 'rgba(100, 50, 20, 0)');

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

    // Normalize angle
    if (player.angle < 0) player.angle += Math.PI * 2;
    if (player.angle >= Math.PI * 2) player.angle -= Math.PI * 2;

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

// Draw HUD elements
function drawHUD() {
    // HUD background panels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Health/Armor panel
    ctx.fillRect(10, canvas.height - 60, 200, 50);
    
    // Ammo panel
    ctx.fillRect(canvas.width - 160, canvas.height - 60, 150, 50);
    
    // Score panel
    ctx.fillRect(10, 10, 150, 40);
    
    // Health bar
    const healthPct = player.health / player.maxHealth;
    ctx.fillStyle = 'rgba(100, 0, 0, 0.7)';
    ctx.fillRect(20, canvas.height - 45, 180, 15);
    ctx.fillStyle = healthPct > 0.3 ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)';
    ctx.fillRect(20, canvas.height - 45, 180 * healthPct, 15);
    
    // Health text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Health: ${Math.floor(player.health)}`, 25, canvas.height - 48);
    
    // Armor bar
    if (player.armor > 0) {
        ctx.fillStyle = 'rgba(0, 0, 100, 0.7)';
        ctx.fillRect(20, canvas.height - 25, 180, 10);
        ctx.fillStyle = 'rgba(0, 150, 255, 0.9)';
        ctx.fillRect(20, canvas.height - 25, 180 * (player.armor / 100), 10);
    }
    
    // Ammo counter
    ctx.fillStyle = gun.ammo > 5 ? 'white' : 'rgba(255, 100, 100, 1)';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${gun.ammo}/${gun.totalAmmo}`, canvas.width - 20, canvas.height - 25);
    
    // Reload indicator
    if (gun.isReloading) {
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('RELOADING...', canvas.width - 20, canvas.height - 45);
    }
    
    // Score
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`Score: ${player.score}`, 20, 35);
    
    // Minimap
    drawMinimap();
}

// Draw minimap
function drawMinimap() {
    const mapSize = 150;
    const mapX = canvas.width - mapSize - 10;
    const mapY = 10;
    const scale = mapSize / (map[0].length * 50);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Draw walls
    ctx.fillStyle = 'rgba(100, 100, 100, 0.9)';
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 1) {
                ctx.fillRect(
                    mapX + x * 50 * scale,
                    mapY + y * 50 * scale,
                    50 * scale,
                    50 * scale
                );
            }
        }
    }
    
    // Draw enemies on minimap
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
    for (const enemy of enemies) {
        if (enemy.state !== 'dead') {
            ctx.beginPath();
            ctx.arc(
                mapX + enemy.x * scale,
                mapY + enemy.y * scale,
                3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // Draw player
    ctx.save();
    ctx.translate(mapX + player.x * scale, mapY + player.y * scale);
    ctx.rotate(player.angle);
    
    // Player triangle
    ctx.fillStyle = 'rgba(0, 255, 0, 1)';
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(-3, -3);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);
}

// Modify the draw function to eliminate the gray vertical lines
function draw() {
    if (!allResourcesLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the pitch offset with head bob
    const bobOffset = Math.sin(player.bobAmount) * 5 * (player.isSprinting ? 2 : 1);
    const pitchOffset = player.pitch * canvas.height + bobOffset;

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

    // Cast rays and draw walls with improved resolution
    const rayWidth = canvas.width / numRays;
    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1;
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle);

        // Skip rays that don't hit walls
        if (ray.distance >= maxDepth) continue;

        const wallHeightScaled = (canvas.height / ray.distance) * wallHeight;

        // Calculate slice position with better precision
        const sliceX = i * rayWidth;
        const sliceWidth = Math.ceil(rayWidth) + 1; // Add 1 pixel overlap to prevent gaps

        // Calculate wall top and bottom positions
        const wallTop = Math.floor(canvas.height / 2 - wallHeightScaled / 2 + pitchOffset);
        const wallHeightCeil = Math.ceil(wallHeightScaled);

        // Enhanced lighting with distance fog
        const fogFactor = 1 - (ray.distance / maxDepth);
        const brightness = Math.max(0.3, Math.min(1, ray.lightEffect * ray.aoFactor * fogFactor * 2.5));

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

                // Enhanced shading with colored lighting
                if (brightness < 1.0) {
                    const shade = 1 - brightness;
                    // Add slight blue tint for darkness (atmospheric effect)
                    const tint = ray.distance / maxDepth;
                    ctx.fillStyle = `rgba(${Math.floor(10 * tint)}, ${Math.floor(10 * tint)}, ${Math.floor(30 * tint)}, ${shade * 0.8})`;
                    ctx.fillRect(sliceX, wallTop, sliceWidth, wallHeightCeil);
                    
                    // Add edge darkening for depth
                    if (i % 10 === 0) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${shade * 0.2})`;
                        ctx.fillRect(sliceX, wallTop, 1, wallHeightCeil);
                    }
                }
            }
        } else {
            // Use fallback solid color
            ctx.fillStyle = FALLBACK_WALL_COLOR;
            ctx.fillRect(sliceX, wallTop, sliceWidth, wallHeightCeil);
        }
    }
}

// Floor and ceiling texture rendering
function drawFloorAndCeiling(pitchOffset, floorTexture, ceilingTexture) {
    const horizon = canvas.height / 2 + pitchOffset;
    
    // Simple textured floor and ceiling (optimized version)
    // Draw ceiling
    if (ceilingTexture && ceilingTexture.complete) {
        const ceilingPattern = ctx.createPattern(ceilingTexture, 'repeat');
        ctx.fillStyle = ceilingPattern;
        ctx.save();
        ctx.translate(player.x % 64, player.y % 64);
        ctx.fillRect(-64, 0, canvas.width + 128, Math.max(0, horizon));
        ctx.restore();
        
        // Apply darkness overlay
        ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
        ctx.fillRect(0, 0, canvas.width, Math.max(0, horizon));
    } else {
        // Fallback ceiling gradient
        const ceilingGradient = ctx.createLinearGradient(0, 0, 0, horizon);
        ceilingGradient.addColorStop(0, '#3a3a3a');
        ceilingGradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = ceilingGradient;
        ctx.fillRect(0, 0, canvas.width, Math.max(0, horizon));
    }
    
    // Draw floor
    if (floorTexture && floorTexture.complete) {
        const floorPattern = ctx.createPattern(floorTexture, 'repeat');
        ctx.fillStyle = floorPattern;
        ctx.save();
        ctx.translate(player.x % 64, player.y % 64);
        ctx.fillRect(-64, Math.max(0, horizon), canvas.width + 128, canvas.height - Math.max(0, horizon));
        ctx.restore();
        
        // Apply distance-based darkness
        const floorGradient = ctx.createLinearGradient(0, horizon, 0, canvas.height);
        floorGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        floorGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, Math.max(0, horizon), canvas.width, canvas.height - Math.max(0, horizon));
    } else {
        // Fallback floor gradient
        const floorGradient = ctx.createLinearGradient(0, horizon, 0, canvas.height);
        floorGradient.addColorStop(0, '#5f615a');
        floorGradient.addColorStop(1, '#3e3f37');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, Math.max(0, horizon), canvas.width, canvas.height - Math.max(0, horizon));
    }
}

// Enhanced wall rendering with multiple textures
function drawWalls(pitchOffset, wallTexture1, wallTexture2) {
    const rayWidth = canvas.width / numRays;
    
    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1;
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle);

        // Skip rays that don't hit walls
        if (ray.distance >= maxDepth) continue;

        const wallHeightScaled = (canvas.height / ray.distance) * wallHeight;

        // Calculate slice position with better precision
        const sliceX = i * rayWidth;
        const sliceWidth = Math.ceil(rayWidth) + 1;

        // Calculate wall top and bottom positions
        const wallTop = Math.floor(canvas.height / 2 - wallHeightScaled / 2 + pitchOffset);
        const wallHeightCeil = Math.ceil(wallHeightScaled);

        // Enhanced lighting with distance fog
        const fogFactor = 1 - (ray.distance / maxDepth);
        const brightness = Math.max(0.3, Math.min(1, ray.lightEffect * ray.aoFactor * fogFactor * 2.5));

        // Choose texture based on wall type
        let activeTexture = wallTexture1;
        if (ray.wallType === 2 && wallTexture2 && wallTexture2.complete) {
            activeTexture = wallTexture2;
        } else if (ray.wallType === 3) {
            // Pillars use a different texture mapping
            activeTexture = wallTexture1;
        }

        // Draw wall slice with texture
        if (activeTexture && activeTexture.complete) {
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

                // Enhanced shading with colored lighting
                if (brightness < 1.0) {
                    const shade = 1 - brightness;
                    // Add slight blue tint for darkness (atmospheric effect)
                    const tint = ray.distance / maxDepth;
                    ctx.fillStyle = `rgba(${Math.floor(10 * tint)}, ${Math.floor(10 * tint)}, ${Math.floor(30 * tint)}, ${shade * 0.8})`;
                    ctx.fillRect(sliceX, wallTop, sliceWidth, wallHeightCeil);
                    
                    // Add edge darkening for depth
                    if (i % 10 === 0) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${shade * 0.2})`;
                        ctx.fillRect(sliceX, wallTop, 1, wallHeightCeil);
                    }
                }
            }
        } else {
            // Use fallback solid color based on wall type
            let fallbackColor = FALLBACK_WALL_COLOR;
            if (ray.wallType === 2) fallbackColor = '#666666';
            if (ray.wallType === 3) fallbackColor = '#777777';
            
            ctx.fillStyle = fallbackColor;
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

// Draw game menu
function drawMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CLASSIC FPS', canvas.width / 2, canvas.height / 2 - 100);
    
    ctx.font = '24px monospace';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px monospace';
    ctx.fillText('WASD - Move | Mouse - Look | Click - Shoot', canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Shift - Sprint | C - Crouch | R - Reload | ESC - Pause', canvas.width / 2, canvas.height / 2 + 80);
}

// Draw pause screen
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px monospace';
    ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 50);
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'red';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    ctx.fillText(`Final Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Wave Reached: ${waveNumber}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Click to Return to Menu', canvas.width / 2, canvas.height / 2 + 100);
}

// Game loop with fixed timestep for physics
function gameLoop() {
    if (!allResourcesLoaded) return;

    if (gameState === GAME_STATES.MENU) {
        drawMenu();
    } else if (gameState === GAME_STATES.PLAYING) {
        // Update game logic
        update();
        updateBullets();

        // Render
        draw();
        drawEnemies();
        drawBullets();
        drawGun();
        drawHUD();
        
        // Draw wave number
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${waveNumber}`, canvas.width / 2, 50);
    } else if (gameState === GAME_STATES.PAUSED) {
        draw();
        drawEnemies();
        drawBullets();
        drawGun();
        drawHUD();
        drawPauseScreen();
    } else if (gameState === GAME_STATES.GAME_OVER) {
        drawGameOver();
    }

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Spawn enemies when the game starts
// Check if resources are already loaded (cached)
if (resources.every(resource => resource.loaded)) {
    allResourcesLoaded = true;
    loadingScreen.style.display = 'none';
    gameStarted = true;
    gameState = GAME_STATES.MENU;
    gameLoop();
} else {
    // Resources still loading, will start via the updateLoadingProgress function
    updateLoadingProgress();
}

// Spawn a wave of enemies
function spawnWave() {
    enemies = enemies.filter(e => e.state !== 'dead'); // Remove dead enemies
    
    for (let i = 0; i < enemiesPerWave; i++) {
        const types = ['SOLDIER', 'SOLDIER', 'SCOUT', 'HEAVY'];
        const type = types[Math.floor(Math.random() * types.length)];
        setTimeout(() => spawnEnemy(type), i * 200);
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
    enemies = [];
    gun.bullets = [];
    waveNumber = 1;
    enemiesPerWave = 5;
    spawnWave();
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
            const aoFactor = getAmbientOcclusion(mapX, mapY);

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
let isMouseDown = false;
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        isMouseDown = true;
        shoot();
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
        shoot();
    }
}, gun.fireRate);

// Function to damage an enemy
function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    enemy.state = 'hurt';
    enemy.hitTime = Date.now();

    // Check if enemy is dead
    if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.state = 'dead';
        player.score += 100;
        sounds.enemyDeath.play(); // Play death sound
        
        // Drop ammo with 50% chance
        if (Math.random() < 0.5) {
            gun.totalAmmo = Math.min(gun.totalAmmo + 15, 300);
            sounds.pickup.play();
        }
        
        // Check for wave completion
        const aliveEnemies = enemies.filter(e => e.state !== 'dead').length;
        if (aliveEnemies === 1) { // Last enemy killed
            setTimeout(() => {
                waveNumber++;
                enemiesPerWave = Math.min(enemiesPerWave + 2, 15);
                spawnWave();
            }, 2000);
        }
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

        // Calculate distance and angle to player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        const angleToPlayer = Math.atan2(dy, dx);

        // Check detection based on enemy type
        const enemyType = ENEMY_TYPES[enemy.type];
        const canSeePlayer = distToPlayer < enemyType.viewDistance && 
                            !isWallBetween(enemy.x, enemy.y, player.x, player.y);
        const canHearPlayer = distToPlayer < enemyType.hearingDistance && 
                             (keys['w'] || keys['a'] || keys['s'] || keys['d'] || isMouseDown);

        // Update alert level
        if (canSeePlayer) {
            enemy.alertLevel = 2;
            enemy.lastKnownPlayerPos = { x: player.x, y: player.y };
            enemy.state = 'chasing';
        } else if (canHearPlayer && enemy.alertLevel < 2) {
            enemy.alertLevel = 1;
            enemy.lastKnownPlayerPos = { x: player.x, y: player.y };
            enemy.state = 'searching';
        } else if (enemy.alertLevel > 0) {
            // Gradually decrease alert level
            enemy.alertLevel -= 0.001;
            if (enemy.alertLevel <= 0) {
                enemy.alertLevel = 0;
                enemy.state = 'idle';
                enemy.lastKnownPlayerPos = null;
            }
        }

        // Movement based on state
        const speed = enemyType.speed * (elapsed / 16.67);
        let targetX = enemy.x;
        let targetY = enemy.y;
        let targetAngle = enemy.angle;

        if (enemy.state === 'chasing' && enemy.lastKnownPlayerPos) {
            // Direct chase to player
            targetAngle = angleToPlayer;
            const moveX = Math.cos(targetAngle) * speed;
            const moveY = Math.sin(targetAngle) * speed;
            targetX = enemy.x + moveX;
            targetY = enemy.y + moveY;
        } else if (enemy.state === 'searching' && enemy.lastKnownPlayerPos) {
            // Move to last known position
            const searchDx = enemy.lastKnownPlayerPos.x - enemy.x;
            const searchDy = enemy.lastKnownPlayerPos.y - enemy.y;
            const searchDist = Math.sqrt(searchDx * searchDx + searchDy * searchDy);
            
            if (searchDist > 20) {
                targetAngle = Math.atan2(searchDy, searchDx);
                targetX = enemy.x + Math.cos(targetAngle) * speed;
                targetY = enemy.y + Math.sin(targetAngle) * speed;
            } else {
                // Reached last known position, go back to idle
                enemy.state = 'idle';
                enemy.lastKnownPlayerPos = null;
            }
        } else if (enemy.state === 'idle') {
            // Patrol behavior
            if (!enemy.patrolTarget || Math.random() < 0.01) {
                // Pick a new random patrol target
                const patrolRadius = 150;
                enemy.patrolTarget = {
                    x: enemy.x + (Math.random() - 0.5) * patrolRadius,
                    y: enemy.y + (Math.random() - 0.5) * patrolRadius
                };
            }
            
            if (enemy.patrolTarget) {
                const patrolDx = enemy.patrolTarget.x - enemy.x;
                const patrolDy = enemy.patrolTarget.y - enemy.y;
                const patrolDist = Math.sqrt(patrolDx * patrolDx + patrolDy * patrolDy);
                
                if (patrolDist > 10) {
                    targetAngle = Math.atan2(patrolDy, patrolDx);
                    targetX = enemy.x + Math.cos(targetAngle) * speed * 0.5; // Slower patrol speed
                    targetY = enemy.y + Math.sin(targetAngle) * speed * 0.5;
                } else {
                    enemy.patrolTarget = null;
                }
            }
        }

        // Smooth angle rotation
        const angleDiff = targetAngle - enemy.angle;
        const normalizedDiff = ((angleDiff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        enemy.angle += normalizedDiff * 0.1;

        // Check for valid movement with stuck detection
        const nextMapX = Math.floor(targetX / tileSize);
        const nextMapY = Math.floor(targetY / tileSize);

        if (map[nextMapY] && map[nextMapY][nextMapX] === 0) {
            // Check if actually moved
            const moved = Math.abs(enemy.x - enemy.lastPosition.x) + Math.abs(enemy.y - enemy.lastPosition.y);
            if (moved < 0.1) {
                enemy.stuckCounter++;
                if (enemy.stuckCounter > 30) {
                    // Try to unstuck by moving in a random direction
                    enemy.angle += (Math.random() - 0.5) * Math.PI;
                    enemy.stuckCounter = 0;
                }
            } else {
                enemy.stuckCounter = 0;
            }
            
            enemy.lastPosition = { x: enemy.x, y: enemy.y };
            enemy.x = targetX;
            enemy.y = targetY;
        } else {
            // Hit a wall, try to navigate around it
            enemy.angle += Math.PI / 4; // Turn 45 degrees
            enemy.stuckCounter++;
        }

        // Check if close enough to attack
        const attackRange = 80;
        if (distToPlayer < attackRange && enemy.state === 'chasing') {
            enemy.state = 'attacking';
            
            // Deal damage to player (once per second)
            if (!enemy.lastAttackTime || now - enemy.lastAttackTime > 1000) {
                player.health = Math.max(0, player.health - ENEMY_TYPES[enemy.type].damage);
                enemy.lastAttackTime = now;
                sounds.playerHit.play(); // Play hit sound
                
                // Check if player died
                if (player.health <= 0) {
                    gameState = GAME_STATES.GAME_OVER;
                    document.exitPointerLock();
                }
            }
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

        if (map[mapY] && map[mapY][mapX] > 0) {
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

        if (map[mapY] && map[mapY][mapX] > 0) {
            return true; // Wall found between player and enemy
        }
    }

    return false; // No wall found between player and enemy
}
