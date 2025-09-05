class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas to full window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.2
        };
        
        // Game objects
        this.player = null;
        this.world = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.hitEffects = [];
        this.pickups = [];
        this.boxes = [];
        
        // Enemy spawning
        this.maxEnemies = 3;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000; // 1 second for debugging
        
        // Pickup system - now drops from enemies
        this.maxPickups = 5; // Allow more pickups from enemy drops
        
        // Weapon system
        this.isMouseDown = false;
        this.lastShotTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        
        // Weapon definitions
        this.weaponTypes = {
            pistol: {
                name: 'Pistol',
                clipSize: 12,
                fireRate: 300, // rounds per minute
                reloadTime: 1500,
                damage: 25,
                bulletSpeed: 800,
                ammoType: 'smallBullets',
                sprite: 'playerPistol',
                automatic: false
            },
            ar: {
                name: 'Assault Rifle',
                clipSize: 36,
                fireRate: 900,
                reloadTime: 2000,
                damage: 30,
                bulletSpeed: 1000,
                ammoType: 'largeBullets',
                sprite: 'playerAR',
                automatic: true
            },
            blaster: {
                name: 'Blaster',
                clipSize: 8,
                fireRate: 150,
                reloadTime: 2500,
                damage: 60,
                bulletSpeed: 600,
                ammoType: 'greenBullets',
                sprite: 'blaster',
                automatic: false
            },
            shotgun: {
                name: 'Shotgun',
                clipSize: 6,
                fireRate: 120,
                reloadTime: 3000,
                damage: 80,
                bulletSpeed: 700,
                ammoType: 'shotgunShells',
                sprite: 'playerShotgun',
                automatic: false,
                pelletCount: 5
            }
        };
        
        // Player weapon slots
        this.playerWeapons = [null, null]; // Two weapon slots
        this.currentWeaponSlot = 0;
        
        // Weapon switching animation
        this.isSwitchingWeapons = false;
        this.weaponSwitchTimer = 0;
        this.weaponSwitchDelay = 100; // 0.1 seconds in milliseconds
        
        // Ammo reserves
        this.ammoReserves = {
            smallBullets: 60,    // Pistol ammo
            largeBullets: 120,   // AR ammo  
            greenBullets: 40,    // Blaster ammo
            shotgunShells: 24    // Shotgun ammo
        };
        
        // Give player starting weapons
        this.playerWeapons[0] = {
            type: 'pistol',
            currentAmmo: this.weaponTypes.pistol.clipSize
        };
        this.playerWeapons[1] = {
            type: 'ar', 
            currentAmmo: this.weaponTypes.ar.clipSize
        };
        
        // Game state
        this.gameOver = false;
        this.showRestartMessage = false;
        
        // Pickup message system
        this.pickupMessage = null;
        
        // Recoil animation
        this.recoilOffset = 0;
        this.maxRecoil = 5; // pixels
        this.recoilRecoverySpeed = 40; // pixels per second
        
        // Sprite system
        this.sprites = new Map();
        this.spritesLoaded = false;
        
        this.init();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
    }
    
    async init() {
        await this.loadSprites();
        this.createWorld();
        this.createPlayer();
        this.spawnBoxes();
        this.setupEventListeners();
        this.start();
    }
    
    async loadSprites() {
        try {
            // Load player sprites
            const playerImg = new Image();
            playerImg.src = 'sprites/player/player.png';
            await new Promise((resolve, reject) => {
                playerImg.onload = resolve;
                playerImg.onerror = reject;
            });
            this.sprites.set('player', playerImg);
            
            // Load walking sprites
            const walk1Img = new Image();
            walk1Img.src = 'sprites/player/playerWalk1.png';
            await new Promise((resolve, reject) => {
                walk1Img.onload = resolve;
                walk1Img.onerror = reject;
            });
            this.sprites.set('playerWalk1', walk1Img);
            
            const walk2Img = new Image();
            walk2Img.src = 'sprites/player/playerWalk2.png';
            await new Promise((resolve, reject) => {
                walk2Img.onload = resolve;
                walk2Img.onerror = reject;
            });
            this.sprites.set('playerWalk2', walk2Img);
            
            // Load weapon sprites
            const weaponImg = new Image();
            weaponImg.src = 'sprites/player/playerAR.png';
            await new Promise((resolve, reject) => {
                weaponImg.onload = resolve;
                weaponImg.onerror = reject;
            });
            this.sprites.set('playerAR', weaponImg);
            
            // Load pistol sprite (non-blocking)
            try {
                const pistolImg = new Image();
                pistolImg.src = 'sprites/player/playerPistol.png';
                await new Promise((resolve, reject) => {
                    pistolImg.onload = resolve;
                    pistolImg.onerror = reject;
                });
                this.sprites.set('playerPistol', pistolImg);
                console.log('Loaded pistol sprite');
            } catch (error) {
                console.warn('Failed to load pistol sprite, will use placeholder:', error);
            }
            
            // Load shotgun sprite
            try {
                const shotgunImg = new Image();
                shotgunImg.src = 'sprites/player/playerShotgun.png';
                await new Promise((resolve, reject) => {
                    shotgunImg.onload = resolve;
                    shotgunImg.onerror = reject;
                });
                this.sprites.set('playerShotgun', shotgunImg);
                console.log('Loaded shotgun sprite');
            } catch (error) {
                console.warn('Failed to load shotgun sprite, will use placeholder:', error);
            }
            
            // Load badguy sprites
            const badguyImg = new Image();
            badguyImg.src = 'sprites/badguy/badguy.png';
            await new Promise((resolve, reject) => {
                badguyImg.onload = resolve;
                badguyImg.onerror = reject;
            });
            this.sprites.set('badguy', badguyImg);
            
            const badguyWalk1Img = new Image();
            badguyWalk1Img.src = 'sprites/badguy/badguyWalk1.png';
            await new Promise((resolve, reject) => {
                badguyWalk1Img.onload = resolve;
                badguyWalk1Img.onerror = reject;
            });
            this.sprites.set('badguyWalk1', badguyWalk1Img);
            
            const badguyWalk2Img = new Image();
            badguyWalk2Img.src = 'sprites/badguy/badguyWalk2.png';
            await new Promise((resolve, reject) => {
                badguyWalk2Img.onload = resolve;
                badguyWalk2Img.onerror = reject;
            });
            this.sprites.set('badguyWalk2', badguyWalk2Img);
            
            const badguyBlasterImg = new Image();
            badguyBlasterImg.src = 'sprites/badguy/badguyBlaster.png';
            await new Promise((resolve, reject) => {
                badguyBlasterImg.onload = resolve;
                badguyBlasterImg.onerror = reject;
            });
            this.sprites.set('badguyBlaster', badguyBlasterImg);
            
            // Load death sprites
            const playerDeadImg = new Image();
            playerDeadImg.src = 'sprites/player/playerDead.png';
            await new Promise((resolve, reject) => {
                playerDeadImg.onload = resolve;
                playerDeadImg.onerror = reject;
            });
            this.sprites.set('playerDead', playerDeadImg);
            
            const badguyDeadImg = new Image();
            badguyDeadImg.src = 'sprites/badguy/badguyDead.png';
            await new Promise((resolve, reject) => {
                badguyDeadImg.onload = resolve;
                badguyDeadImg.onerror = reject;
            });
            this.sprites.set('badguyDead', badguyDeadImg);
            
            // Load pickup sprites
            const shieldPickupImg = new Image();
            shieldPickupImg.src = 'sprites/pickups/sheildRegenPickup.png';
            await new Promise((resolve, reject) => {
                shieldPickupImg.onload = resolve;
                shieldPickupImg.onerror = reject;
            });
            this.sprites.set('shieldPickup', shieldPickupImg);
            
            // Load weapon pickup sprites
            try {
                const arPickupImg = new Image();
                arPickupImg.src = 'sprites/pickups/ARPickup.png';
                await new Promise((resolve, reject) => {
                    arPickupImg.onload = resolve;
                    arPickupImg.onerror = reject;
                });
                this.sprites.set('arPickup', arPickupImg);
                
                const pistolPickupImg = new Image();
                pistolPickupImg.src = 'sprites/pickups/PistolPickup.png';
                await new Promise((resolve, reject) => {
                    pistolPickupImg.onload = resolve;
                    pistolPickupImg.onerror = reject;
                });
                this.sprites.set('pistolPickup', pistolPickupImg);
                
                const shotgunPickupImg = new Image();
                shotgunPickupImg.src = 'sprites/pickups/ShotgunPickup.png';
                await new Promise((resolve, reject) => {
                    shotgunPickupImg.onload = resolve;
                    shotgunPickupImg.onerror = reject;
                });
                this.sprites.set('shotgunPickup', shotgunPickupImg);
                
                console.log('Loaded weapon pickup sprites');
            } catch (error) {
                console.warn('Failed to load weapon pickup sprites, will use placeholders:', error);
            }
            
            // Load ammo pickup sprites
            try {
                const smallBulletsImg = new Image();
                smallBulletsImg.src = 'sprites/pickups/smallbulletsPickup.png';
                await new Promise((resolve, reject) => {
                    smallBulletsImg.onload = resolve;
                    smallBulletsImg.onerror = reject;
                });
                this.sprites.set('smallBulletsPickup', smallBulletsImg);
                
                const largeBulletsImg = new Image();
                largeBulletsImg.src = 'sprites/pickups/largebullets.png';
                await new Promise((resolve, reject) => {
                    largeBulletsImg.onload = resolve;
                    largeBulletsImg.onerror = reject;
                });
                this.sprites.set('largeBulletsPickup', largeBulletsImg);
                
                const greenBulletsImg = new Image();
                greenBulletsImg.src = 'sprites/pickups/greenbullets.png';
                await new Promise((resolve, reject) => {
                    greenBulletsImg.onload = resolve;
                    greenBulletsImg.onerror = reject;
                });
                this.sprites.set('greenBulletsPickup', greenBulletsImg);
                
                const shotgunShellsImg = new Image();
                shotgunShellsImg.src = 'sprites/pickups/shotgunshellsPickup.png';
                await new Promise((resolve, reject) => {
                    shotgunShellsImg.onload = resolve;
                    shotgunShellsImg.onerror = reject;
                });
                this.sprites.set('shotgunShellsPickup', shotgunShellsImg);
                
                console.log('Loaded ammo pickup sprites');
            } catch (error) {
                console.warn('Failed to load ammo pickup sprites, will use placeholders:', error);
            }
            
            // Load object sprites
            try {
                const boxImg = new Image();
                boxImg.src = 'sprites/objects/box.png';
                await new Promise((resolve, reject) => {
                    boxImg.onload = resolve;
                    boxImg.onerror = reject;
                });
                this.sprites.set('box', boxImg);
                console.log('Loaded box sprite');
            } catch (error) {
                console.warn('Failed to load box sprite, will use placeholder:', error);
            }
            
            console.log('Loaded player, badguy, weapon, object, and pickup sprites');
            console.log('Available sprites:', Array.from(this.sprites.keys()));
        } catch (error) {
            console.warn('Failed to load player sprites, using placeholder:', error);
        }
        
        // Create placeholder sprites
        this.createPlaceholderSprites();
        this.spritesLoaded = true;
    }
    
    
    createPlaceholderSprites() {
        const spriteSize = 32;
        
        // Only create player sprite if not already loaded
        if (!this.sprites.has('player')) {
            const playerCanvas = document.createElement('canvas');
            playerCanvas.width = spriteSize;
            playerCanvas.height = spriteSize;
            const playerCtx = playerCanvas.getContext('2d');
            playerCtx.fillStyle = '#00ff00';
            playerCtx.fillRect(0, 0, spriteSize, spriteSize);
            this.sprites.set('player', playerCanvas);
        }
        
        // Enemy sprite
        const enemyCanvas = document.createElement('canvas');
        enemyCanvas.width = spriteSize;
        enemyCanvas.height = spriteSize;
        const enemyCtx = enemyCanvas.getContext('2d');
        enemyCtx.fillStyle = '#ff0000';
        enemyCtx.fillRect(0, 0, spriteSize, spriteSize);
        this.sprites.set('enemy', enemyCanvas);
        
        // Bullet sprite
        const bulletCanvas = document.createElement('canvas');
        bulletCanvas.width = 8;
        bulletCanvas.height = 8;
        const bulletCtx = bulletCanvas.getContext('2d');
        bulletCtx.fillStyle = '#ffff00';
        bulletCtx.fillRect(0, 0, 8, 8);
        this.sprites.set('bullet', bulletCanvas);
    }
    
    createWorld() {
        this.world = new World(2000, 2500);  // Increased height from 1500 to 2500
    }
    
    createPlayer() {
        const spawnPoint = this.world.getRandomSpawnPoint();
        console.log(`Creating player at (${spawnPoint.x}, ${spawnPoint.y})`);
        this.player = new Player(spawnPoint.x, spawnPoint.y);
        console.log(`Player created:`, this.player);
    }
    
    spawnBoxes() {
        if (!this.world) return;
        
        const boxCount = 15; // Number of boxes to spawn
        const boxSize = 32; // Box size
        const minDistance = 100; // Minimum distance from player
        
        for (let i = 0; i < boxCount; i++) {
            let attempts = 0;
            let validPosition = false;
            
            while (attempts < 50 && !validPosition) {
                // Try to spawn in any room or corridor
                let x, y;
                
                if (Math.random() < 0.6 && this.world.rooms.length > 0) {
                    // Spawn in a room
                    const room = this.world.rooms[Math.floor(Math.random() * this.world.rooms.length)];
                    x = room.x + 50 + Math.random() * (room.width - 100);
                    y = room.y + 50 + Math.random() * (room.height - 100);
                } else if (this.world.corridors.length > 0) {
                    // Spawn in a corridor
                    const corridor = this.world.corridors[Math.floor(Math.random() * this.world.corridors.length)];
                    x = corridor.x + 30 + Math.random() * (corridor.width - 60);
                    y = corridor.y + 30 + Math.random() * (corridor.height - 60);
                } else {
                    attempts++;
                    continue;
                }
                
                // Check if position is walkable
                if (this.world.isWalkable(x, y, boxSize, boxSize)) {
                    // Check distance from player
                    if (this.player) {
                        const dx = x - this.player.x;
                        const dy = y - this.player.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance >= minDistance) {
                            validPosition = true;
                            
                            // Create box
                            const box = {
                                x: x,
                                y: y,
                                width: boxSize,
                                height: boxSize,
                                health: 1, // One shot to break
                                destroyed: false
                            };
                            
                            this.boxes.push(box);
                        }
                    } else {
                        validPosition = true;
                        
                        // Create box
                        const box = {
                            x: x,
                            y: y,
                            width: boxSize,
                            height: boxSize,
                            health: 1,
                            destroyed: false
                        };
                        
                        this.boxes.push(box);
                    }
                }
                attempts++;
            }
        }
        
        console.log(`Spawned ${this.boxes.length} boxes`);
    }
    
    setupEventListeners() {
        // Mouse shooting
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isRunning && !this.isPaused) {
                this.isMouseDown = true;
                this.shoot(); // Fire immediately on click (works for all weapon types)
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
        });
        
        // Pause/unpause and other keys
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause();
                e.preventDefault();
            }
            if (e.key === 'F1') {
                window.DEBUG = !window.DEBUG;
                e.preventDefault();
            }
            if (e.key.toLowerCase() === 'r') {
                if (this.gameOver) {
                    this.restartGame();
                } else {
                    this.startReload();
                }
                e.preventDefault();
            }
            if (e.key === '1') {
                this.switchWeapon();
                e.preventDefault();
            }
            if (e.key.toLowerCase() === 'e') {
                this.tryPickupWeapon();
                e.preventDefault();
            }
        });
    }
    
    shoot() {
        if (!this.player || this.player.isDead || this.isReloading) return;
        
        const currentWeapon = this.getCurrentWeapon();
        if (!currentWeapon || currentWeapon.currentAmmo <= 0) return;
        
        const weaponData = this.weaponTypes[currentWeapon.type];
        const currentTime = performance.now();
        const timeBetweenShots = 60000 / weaponData.fireRate;
        
        if (currentTime - this.lastShotTime < timeBetweenShots) return;
        
        // Shotgun fires multiple pellets
        const pelletCount = weaponData.pelletCount || 1;
        
        for (let i = 0; i < pelletCount; i++) {
            let angle = this.player.angle;
            
            // Add spread for shotgun
            if (pelletCount > 1) {
                const maxSpread = 0.3; // 17 degrees in radians
                angle += (Math.random() - 0.5) * maxSpread;
            }
            
            const bullet = {
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * weaponData.bulletSpeed,
                vy: Math.sin(angle) * weaponData.bulletSpeed,
                speed: weaponData.bulletSpeed,
                damage: weaponData.damage / pelletCount, // Distribute damage across pellets
                lifetime: 3000,
                age: 0,
                ammoType: weaponData.ammoType
            };
            
            this.bullets.push(bullet);
        }
        
        currentWeapon.currentAmmo--;
        this.lastShotTime = currentTime;
        
        // Add recoil effect
        this.recoilOffset = this.maxRecoil;
    }
    
    startReload() {
        const currentWeapon = this.getCurrentWeapon();
        if (!currentWeapon || this.isReloading) return;
        
        const weaponData = this.weaponTypes[currentWeapon.type];
        const ammoReserve = this.ammoReserves[weaponData.ammoType];
        
        // Can't reload if clip is full or no ammo in reserve
        if (currentWeapon.currentAmmo === weaponData.clipSize || ammoReserve <= 0) return;
        
        this.isReloading = true;
        this.reloadStartTime = performance.now();
        console.log(`Reloading ${weaponData.name}...`);
    }
    
    updateWeapon(deltaTime) {
        const currentWeapon = this.getCurrentWeapon();
        if (!currentWeapon) return;
        
        const weaponData = this.weaponTypes[currentWeapon.type];
        
        // Handle automatic firing
        if (this.isMouseDown && !this.isReloading && currentWeapon.currentAmmo > 0 && weaponData.automatic) {
            this.shoot();
        }
        
        // Handle reloading
        if (this.isReloading) {
            const currentTime = performance.now();
            if (currentTime - this.reloadStartTime >= weaponData.reloadTime) {
                // Calculate how much ammo to reload
                const ammoNeeded = weaponData.clipSize - currentWeapon.currentAmmo;
                const ammoAvailable = this.ammoReserves[weaponData.ammoType];
                const ammoToReload = Math.min(ammoNeeded, ammoAvailable);
                
                // Transfer ammo from reserves to clip
                currentWeapon.currentAmmo += ammoToReload;
                this.ammoReserves[weaponData.ammoType] -= ammoToReload;
                
                this.isReloading = false;
                console.log(`Reload complete! Loaded ${ammoToReload} rounds`);
            }
        }
        
        // Update recoil animation
        if (this.recoilOffset > 0) {
            this.recoilOffset -= this.recoilRecoverySpeed * deltaTime;
            if (this.recoilOffset < 0) {
                this.recoilOffset = 0;
            }
        }
    }
    
    updateWeaponSwitch(deltaTime) {
        if (this.isSwitchingWeapons) {
            this.weaponSwitchTimer -= deltaTime * 1000; // Convert to milliseconds
            
            if (this.weaponSwitchTimer <= 0) {
                // Complete the weapon switch
                this.currentWeaponSlot = this.currentWeaponSlot === 0 ? 1 : 0;
                this.isSwitchingWeapons = false;
                
                const newWeapon = this.playerWeapons[this.currentWeaponSlot];
                if (newWeapon) {
                    const weaponData = this.weaponTypes[newWeapon.type];
                    console.log(`Switched to ${weaponData.name}`);
                } else {
                    console.log('Switched to empty weapon slot');
                }
            }
        }
    }
    
    getCurrentWeapon() {
        // Return null during weapon switching animation
        if (this.isSwitchingWeapons) return null;
        return this.playerWeapons[this.currentWeaponSlot];
    }
    
    switchWeapon() {
        // Don't switch if already switching
        if (this.isSwitchingWeapons) return;
        
        // Start weapon switch animation
        this.isSwitchingWeapons = true;
        this.weaponSwitchTimer = this.weaponSwitchDelay;
        
        // Stop reloading when switching weapons
        this.isReloading = false;
        
        console.log('Switching weapons...');
    }
    
    tryPickupWeapon() {
        if (!this.player) return;
        
        // Check for nearby weapon pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            
            if (pickup.type === 'weapon') {
                const dx = pickup.x - this.player.x;
                const dy = pickup.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) { // Pickup range
                    const weaponData = this.weaponTypes[pickup.weaponType];
                    this.pickupWeapon(pickup.weaponType);
                    this.showPickupMessage(`Picked up ${weaponData.name}!`);
                    this.pickups.splice(i, 1);
                    return;
                }
            }
        }
    }
    
    pickupWeapon(weaponType) {
        if (!this.weaponTypes[weaponType]) return;
        
        const weaponData = this.weaponTypes[weaponType];
        const newWeapon = {
            type: weaponType,
            currentAmmo: weaponData.clipSize
        };
        
        // If current slot is empty, put weapon there
        if (!this.playerWeapons[this.currentWeaponSlot]) {
            this.playerWeapons[this.currentWeaponSlot] = newWeapon;
        } else {
            // Otherwise, put in the other slot (replace if occupied)
            const otherSlot = this.currentWeaponSlot === 0 ? 1 : 0;
            this.playerWeapons[otherSlot] = newWeapon;
        }
        
        console.log(`Picked up ${weaponData.name}!`);
    }
    
    updateWeaponDisplay() {
        const weapon1Element = document.getElementById('weapon1');
        const weapon2Element = document.getElementById('weapon2');
        const weapon1NameElement = weapon1Element.querySelector('.weapon-name');
        const weapon1AmmoElement = weapon1Element.querySelector('.weapon-ammo');
        const weapon2NameElement = weapon2Element.querySelector('.weapon-name');
        const weapon2AmmoElement = weapon2Element.querySelector('.weapon-ammo');
        
        // Determine which weapons to show (use current slot even during switching)
        const activeWeapon = this.playerWeapons[this.currentWeaponSlot];
        const inactiveWeapon = this.playerWeapons[this.currentWeaponSlot === 0 ? 1 : 0];
        
        // Update top position (active weapon)
        if (activeWeapon) {
            const weaponData = this.weaponTypes[activeWeapon.type];
            const ammoReserve = this.ammoReserves[weaponData.ammoType];
            weapon1NameElement.textContent = weaponData.name;
            weapon1AmmoElement.textContent = `${ammoReserve}`;
            weapon1Element.className = 'weapon-item active';
        } else {
            weapon1NameElement.textContent = 'Empty';
            weapon1AmmoElement.textContent = '0';
            weapon1Element.className = 'weapon-item empty active';
        }
        
        // Update bottom position (inactive weapon)
        if (inactiveWeapon) {
            const weaponData = this.weaponTypes[inactiveWeapon.type];
            const ammoReserve = this.ammoReserves[weaponData.ammoType];
            weapon2NameElement.textContent = weaponData.name;
            weapon2AmmoElement.textContent = `${ammoReserve}`;
            weapon2Element.className = 'weapon-item';
        } else {
            weapon2NameElement.textContent = 'Empty';
            weapon2AmmoElement.textContent = '0';
            weapon2Element.className = 'weapon-item empty';
        }
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
        }
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.deltaTime = Math.min(this.deltaTime, 0.016); // Cap at ~60fps
            
            this.update(this.deltaTime);
        }
        
        this.render();
        this.lastTime = currentTime;
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player || !this.world) return;
        
        // Update player
        this.player.update(deltaTime);
        
        // Update weapon system
        this.updateWeapon(deltaTime);
        
        // Update weapon switching animation
        this.updateWeaponSwitch(deltaTime);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update hit effects
        this.updateHitEffects(deltaTime);
        
        // Update pickups
        this.updatePickups(deltaTime);
        
        // Update pickup message
        this.updatePickupMessage(deltaTime);
        
        // Update UI
        this.updateUI();
        
        // Wall collision is now handled in player.update()
    }
    
    updateCamera() {
        if (!this.player) return;
        
        const targetX = this.player.x - (this.canvas.width / 2) / this.camera.zoom;
        const targetY = this.player.y - (this.canvas.height / 2) / this.camera.zoom;
        
        // For first frame, snap camera to player
        if (this.camera.x === 0 && this.camera.y === 0) {
            this.camera.x = targetX;
            this.camera.y = targetY;
            console.log(`Camera initialized at (${this.camera.x}, ${this.camera.y})`);
        } else {
            // Smooth camera following
            this.camera.x += (targetX - this.camera.x) * 0.1;
            this.camera.y += (targetY - this.camera.y) * 0.1;
        }
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Store previous position
            const prevX = bullet.x;
            const prevY = bullet.y;
            
            // Calculate new position
            const newX = bullet.x + bullet.vx * deltaTime;
            const newY = bullet.y + bullet.vy * deltaTime;
            
            bullet.age += deltaTime * 1000;
            
            // Remove old bullets
            if (bullet.age > bullet.lifetime) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check wall collision along the bullet's path
            const collision = this.checkBulletWallCollisionPath(prevX, prevY, newX, newY);
            if (collision) {
                this.createHitEffect(collision.x, collision.y);
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check collision with boxes
            for (let j = this.boxes.length - 1; j >= 0; j--) {
                const box = this.boxes[j];
                if (box.destroyed) continue;
                
                // Check if bullet hits box
                if (newX >= box.x && newX <= box.x + box.width &&
                    newY >= box.y && newY <= box.y + box.height) {
                    
                    // Destroy box
                    box.health--;
                    if (box.health <= 0) {
                        box.destroyed = true;
                        this.createRandomPickup(box.x + box.width / 2, box.y + box.height / 2);
                    }
                    
                    // Remove bullet
                    this.bullets.splice(i, 1);
                    this.createHitEffect(newX, newY);
                    break;
                }
            }
            
            if (i >= this.bullets.length) continue; // Bullet was removed
            
            // Check collision with player (for enemy bullets)
            if (bullet.isEnemyBullet && this.player) {
                const dx = newX - this.player.x;
                const dy = newY - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) { // Hit player!
                    console.log(`About to call takeDamage with ${bullet.damage} damage. Current health: ${this.player.health}, shield: ${this.player.shield}`);
                    const isDead = this.player.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);
                    this.createHitEffect(newX, newY);
                    console.log(`After takeDamage - Health: ${this.player.health}, Shield: ${this.player.shield}, isDead: ${isDead}`);
                    
                    if (isDead) {
                        console.log('Player died!');
                        this.gameOver = true;
                        this.showRestartMessage = true;
                    }
                    continue;
                }
            }
            
            // Update bullet position
            bullet.x = newX;
            bullet.y = newY;
        }
    }
    
    updateEnemies(deltaTime) {
        // Update enemy spawn timer
        this.enemySpawnTimer += deltaTime * 1000;
        
        // Spawn new enemies if needed
        if (this.enemies.length < this.maxEnemies && this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Update existing enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            // Remove dead enemies after death timer expires
            if (enemy.isDead && enemy.deathTimer >= enemy.deathDuration) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Award points when enemy first dies
            if (enemy.health <= 0 && !enemy.isDead) {
                this.score += 100;
            }
            
            // Check collision with player bullets (only if enemy is alive)
            if (!enemy.isDead) {
                for (let j = this.bullets.length - 1; j >= 0; j--) {
                    const bullet = this.bullets[j];
                    if (bullet.isEnemyBullet) continue; // Skip enemy bullets
                    
                    const dx = bullet.x - enemy.x;
                    const dy = bullet.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 20) { // Hit!
                        const isDead = enemy.takeDamage(bullet.damage);
                        this.bullets.splice(j, 1);
                        this.createHitEffect(bullet.x, bullet.y);
                        
                        if (isDead) {
                            this.score += 100; // Award points but don't remove enemy yet
                            
                            // 50% chance to drop shield pickup when enemy dies
                            if (Math.random() < 0.5) {
                                this.dropShieldPickup(enemy.x, enemy.y);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    
    spawnEnemy() {
        if (!this.world || !this.player) return;
        
        // Try to find a spawn point away from player in actual rooms/corridors
        const minDistance = 200;
        let attempts = 0;
        let spawnPoint = null;
        
        while (attempts < 50) {
            let x, y;
            
            // 60% chance to spawn in non-starting rooms, 40% in corridors
            // Never spawn in starting room (rooms[0])
            if (Math.random() < 0.6 && this.world.rooms.length > 1) {
                // Spawn in any room except the starting room (skip rooms[0])
                const roomIndex = 1 + Math.floor(Math.random() * (this.world.rooms.length - 1));
                const room = this.world.rooms[roomIndex];
                x = room.x + 50 + Math.random() * (room.width - 100);
                y = room.y + 50 + Math.random() * (room.height - 100);
            } else if (this.world.corridors.length > 0) {
                // Spawn in a corridor
                const corridor = this.world.corridors[Math.floor(Math.random() * this.world.corridors.length)];
                x = corridor.x + 20 + Math.random() * (corridor.width - 40);
                y = corridor.y + 20 + Math.random() * (corridor.height - 40);
            } else {
                // If no other rooms available, skip this attempt
                attempts++;
                continue;
            }
            
            // Check if walkable
            if (this.world.isWalkable(x, y, 32, 32)) {
                // Check distance from player
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance >= minDistance) {
                    spawnPoint = { x, y };
                    break;
                }
            }
            attempts++;
        }
        
        if (spawnPoint) {
            const badguy = new Badguy(spawnPoint.x, spawnPoint.y);
            this.enemies.push(badguy);
            console.log(`Spawned badguy at (${spawnPoint.x}, ${spawnPoint.y})`);
        } else {
            console.log('Failed to find valid spawn point for enemy');
        }
    }
    
    updateParticles(deltaTime) {
        // Particle system would go here
    }
    
    createHitEffect(x, y) {
        const effect = {
            x: x,
            y: y,
            particles: [],
            lifetime: 500, // 0.5 seconds
            age: 0
        };
        
        // Create small particles for the hit effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 50 + Math.random() * 50;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: (1 + Math.random() * 2) / 3,
                alpha: 1
            });
        }
        
        this.hitEffects.push(effect);
    }
    
    updateHitEffects(deltaTime) {
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.hitEffects[i];
            effect.age += deltaTime * 1000;
            
            // Update particles
            for (let particle of effect.particles) {
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.vx *= 0.95; // Friction
                particle.vy *= 0.95;
                particle.alpha = 1 - (effect.age / effect.lifetime);
            }
            
            // Remove old effects
            if (effect.age > effect.lifetime) {
                this.hitEffects.splice(i, 1);
            }
        }
    }
    
    checkPlayerWallCollision() {
        if (!this.player || !this.world) return;
        
        // Use smaller collision box - player is 32x32 but let's use a smaller collision area
        const playerSize = 20; // Reduced from 32 to 20
        
        // Check if player position is walkable
        if (!this.world.isWalkable(this.player.x, this.player.y, playerSize, playerSize)) {
            // Find a nearby walkable position and move player there
            this.movePlayerToNearestWalkablePosition();
        }
    }
    
    movePlayerToNearestWalkablePosition() {
        const playerSize = 20; // Use same smaller size as collision check
        const searchRadius = 50;
        const step = 5;
        
        // Search in expanding circles for a walkable position
        for (let radius = step; radius <= searchRadius; radius += step) {
            for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                const testX = this.player.x + Math.cos(angle) * radius;
                const testY = this.player.y + Math.sin(angle) * radius;
                
                if (this.world.isWalkable(testX, testY, playerSize, playerSize)) {
                    this.player.x = testX;
                    this.player.y = testY;
                    this.player.vx = 0;
                    this.player.vy = 0;
                    return;
                }
            }
        }
    }
    
    circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
        // Find closest point on rectangle to circle center
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        
        // Calculate distance between circle center and closest point
        const dx = cx - closestX;
        const dy = cy - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < radius;
    }
    
    resolvePlayerWallCollision(wall, playerRadius) {
        // Calculate overlap and push player out
        const centerX = wall.x + wall.width / 2;
        const centerY = wall.y + wall.height / 2;
        
        const dx = this.player.x - centerX;
        const dy = this.player.y - centerY;
        
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        const overlapX = (wall.width / 2 + playerRadius) - absX;
        const overlapY = (wall.height / 2 + playerRadius) - absY;
        
        if (overlapX > 0 && overlapY > 0) {
            // Push out on the axis with smallest overlap
            if (overlapX < overlapY) {
                this.player.x += overlapX * Math.sign(dx);
                this.player.vx = 0;
            } else {
                this.player.y += overlapY * Math.sign(dy);
                this.player.vy = 0;
            }
        }
    }
    
    checkBulletWallCollisionPath(x1, y1, x2, y2) {
        // Check line segment collision with all walls
        for (let wall of this.world.walls) {
            const collision = this.lineRectIntersection(x1, y1, x2, y2, wall.x, wall.y, wall.width, wall.height);
            if (collision) {
                return collision;
            }
        }
        return null;
    }
    
    lineRectIntersection(x1, y1, x2, y2, rx, ry, rw, rh) {
        // Check if line segment intersects with rectangle
        // Test all four edges of the rectangle
        
        const edges = [
            { x1: rx, y1: ry, x2: rx + rw, y2: ry }, // Top edge
            { x1: rx + rw, y1: ry, x2: rx + rw, y2: ry + rh }, // Right edge
            { x1: rx + rw, y1: ry + rh, x2: rx, y2: ry + rh }, // Bottom edge
            { x1: rx, y1: ry + rh, x2: rx, y2: ry } // Left edge
        ];
        
        let closestIntersection = null;
        let closestDistance = Infinity;
        
        for (let edge of edges) {
            const intersection = this.lineLineIntersection(x1, y1, x2, y2, edge.x1, edge.y1, edge.x2, edge.y2);
            if (intersection) {
                const distance = Math.sqrt((intersection.x - x1) ** 2 + (intersection.y - y1) ** 2);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIntersection = intersection;
                }
            }
        }
        
        return closestIntersection;
    }
    
    lineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Line 1: (x1,y1) to (x2,y2)
        // Line 2: (x3,y3) to (x4,y4)
        
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) return null; // Lines are parallel
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }
        
        return null;
    }
    
    updatePickups(deltaTime) {
        // Pickups are now dropped by enemies, no automatic spawning
        
        // Check pickup collection
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            
            // Check distance to player
            const dx = pickup.x - this.player.x;
            const dy = pickup.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 25) { // Close enough to collect
                // Automatic pickup for shield and ammo
                if (pickup.type === 'shield') {
                    this.player.addShield(25); // Restore 25 shield
                    this.showPickupMessage(`+25 Shield`);
                    console.log(`Shield pickup collected! Shield: ${this.player.shield}`);
                    this.pickups.splice(i, 1);
                    continue;
                } else if (pickup.type === 'ammo') {
                    this.ammoReserves[pickup.ammoType] += pickup.amount;
                    this.showPickupMessage(`+${pickup.amount} ${this.getAmmoDisplayName(pickup.ammoType)}`);
                    console.log(`Ammo pickup collected! ${pickup.ammoType}: +${pickup.amount}`);
                    this.pickups.splice(i, 1);
                    continue;
                }
                // Weapons require E key - no automatic pickup here
            }
            
            // Update pickup animation
            pickup.bobTimer += deltaTime * 1000;
            pickup.bobOffset = Math.sin(pickup.bobTimer * 0.005) * 3;
            pickup.rotationAngle += deltaTime * 2; // Slow rotation
        }
    }
    
    dropShieldPickup(x, y) {
        // Drop a shield pickup at the specified location (enemy death location)
        const pickup = {
            x: x,
            y: y,
            type: 'shield',
            size: 12,
            bobTimer: 0,
            bobOffset: 0,
            rotationAngle: 0
        };
        this.pickups.push(pickup);
        console.log(`Dropped shield pickup at (${x}, ${y})`);
    }
    
    createRandomPickup(x, y) {
        const rand = Math.random();
        let pickup;
        
        if (rand < 0.3) {
            // 30% chance - Shield pickup
            pickup = {
                x: x,
                y: y,
                type: 'shield',
                size: 12,
                bobTimer: 0,
                bobOffset: 0,
                rotationAngle: 0
            };
        } else if (rand < 0.5) {
            // 20% chance - Weapon pickup
            const weapons = ['pistol', 'ar', 'shotgun', 'blaster'];
            const weaponType = weapons[Math.floor(Math.random() * weapons.length)];
            pickup = {
                x: x,
                y: y,
                type: 'weapon',
                weaponType: weaponType,
                size: 16,
                bobTimer: 0,
                bobOffset: 0,
                rotationAngle: 0
            };
        } else {
            // 50% chance - Ammo pickup
            const ammoTypes = ['smallBullets', 'largeBullets', 'greenBullets', 'shotgunShells'];
            const ammoType = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
            const ammoAmount = Math.floor(Math.random() * 20) + 10; // 10-30 ammo
            pickup = {
                x: x,
                y: y,
                type: 'ammo',
                ammoType: ammoType,
                amount: ammoAmount,
                size: 10,
                bobTimer: 0,
                bobOffset: 0,
                rotationAngle: 0
            };
        }
        
        this.pickups.push(pickup);
        console.log(`Created random pickup: ${pickup.type} at (${x}, ${y})`);
    }
    
    getAmmoDisplayName(ammoType) {
        const ammoNames = {
            smallBullets: 'Small Bullets',
            largeBullets: 'Large Bullets', 
            greenBullets: 'Green Bullets',
            shotgunShells: 'Shotgun Shells'
        };
        return ammoNames[ammoType] || ammoType;
    }
    
    showPickupMessage(message) {
        // Create a temporary pickup message
        this.pickupMessage = {
            text: message,
            timer: 2000, // Show for 2 seconds
            alpha: 1.0
        };
    }
    
    updatePickupMessage(deltaTime) {
        if (this.pickupMessage) {
            this.pickupMessage.timer -= deltaTime * 1000;
            
            // Fade out in the last 0.5 seconds
            if (this.pickupMessage.timer < 500) {
                this.pickupMessage.alpha = this.pickupMessage.timer / 500;
            }
            
            // Remove when timer expires
            if (this.pickupMessage.timer <= 0) {
                this.pickupMessage = null;
            }
        }
    }
    
    restartGame() {
        // Reset player
        this.player.health = this.player.maxHealth;
        this.player.shield = this.player.maxShield;
        this.player.isDead = false;
        
        // Reset player position
        const spawnPoint = this.world.getRandomSpawnPoint();
        this.player.x = spawnPoint.x;
        this.player.y = spawnPoint.y;
        
        // Clear enemies and bullets
        this.enemies = [];
        this.bullets = [];
        this.pickups = [];
        this.hitEffects = [];
        this.boxes = [];
        
        // Reset weapon state
        this.isReloading = false;
        this.recoilOffset = 0;
        this.currentWeaponSlot = 0;
        this.isSwitchingWeapons = false;
        this.weaponSwitchTimer = 0;
        
        // Reset weapons to starting loadout
        this.playerWeapons[0] = {
            type: 'pistol',
            currentAmmo: this.weaponTypes.pistol.clipSize
        };
        this.playerWeapons[1] = {
            type: 'ar', 
            currentAmmo: this.weaponTypes.ar.clipSize
        };
        
        // Reset ammo reserves
        this.ammoReserves = {
            smallBullets: 60,
            largeBullets: 120,
            greenBullets: 40,
            shotgunShells: 24
        };
        
        // Reset game state
        this.gameOver = false;
        this.showRestartMessage = false;
        this.score = 0;
        
        // Reset timers
        this.enemySpawnTimer = 0;
        
        // Respawn boxes
        this.spawnBoxes();
        
        console.log('Game restarted!');
    }
    
    updateUI() {
        // Update health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthBarFill').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = Math.round(this.player.health);
        
        // Update shield bar
        const shieldPercent = (this.player.shield / this.player.maxShield) * 100;
        document.getElementById('shieldBarFill').style.width = shieldPercent + '%';
        document.getElementById('shieldText').textContent = Math.round(this.player.shield);
        
        // Update weapon display
        this.updateWeaponDisplay();
        
        // Update ammo display (just clip ammo)
        const currentWeapon = this.getCurrentWeapon();
        if (currentWeapon) {
            document.getElementById('ammoValue').textContent = `${currentWeapon.currentAmmo}`;
        } else {
            document.getElementById('ammoValue').textContent = '0';
        }
        
        // Update reload message
        const reloadMessage = document.getElementById('reloadMessage');
        if (this.isReloading) {
            reloadMessage.textContent = 'Reloading...';
            reloadMessage.style.display = 'block';
        } else if (currentWeapon && currentWeapon.currentAmmo === 0) {
            reloadMessage.textContent = 'Reload (R)';
            reloadMessage.style.display = 'block';
        } else {
            reloadMessage.style.display = 'none';
        }
        
        // Update restart message
        const restartMessage = document.getElementById('restartMessage');
        if (this.showRestartMessage) {
            restartMessage.style.display = 'block';
        } else {
            restartMessage.style.display = 'none';
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transform
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render world
        if (this.world) {
            this.world.render(this.ctx);
        }
        
        // Render bullets
        this.renderBullets();
        
        // Render enemies
        this.renderEnemies();
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Render particles
        this.renderParticles();
        
        // Render hit effects
        this.renderHitEffects();
        
        // Render pickups
        this.renderPickups();
        
        // Render boxes
        this.renderBoxes();
        
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderUI();
        
        // Render pickup message (not affected by camera)
        this.renderPickupMessage();
    }
    
    renderBullets() {
        for (let bullet of this.bullets) {
            this.ctx.save();
            
            // Different colors for player vs enemy bullets
            if (bullet.isEnemyBullet) {
                this.ctx.fillStyle = '#00ff00'; // Green for enemy bullets
            } else {
                this.ctx.fillStyle = '#ff8800'; // Orange for player bullets
            }
            
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    renderEnemies() {
        for (let enemy of this.enemies) {
            enemy.render(this.ctx);
        }
    }
    
    renderParticles() {
        // Particle rendering would go here
    }
    
    renderHitEffects() {
        for (let effect of this.hitEffects) {
            for (let particle of effect.particles) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = '#ff8800'; // Orange color to match bullets
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
    
    renderPickups() {
        for (let pickup of this.pickups) {
            this.ctx.save();
            
            // Translate to pickup position with bob effect
            this.ctx.translate(pickup.x, pickup.y + pickup.bobOffset);
            this.ctx.rotate(pickup.rotationAngle);
            
            if (pickup.type === 'shield') {
                // Try to use sprite first, fallback to drawn shape
                const shieldSprite = this.sprites.get('shieldPickup');
                if (shieldSprite && shieldSprite instanceof Image) {
                    this.ctx.imageSmoothingEnabled = false;
                    this.ctx.drawImage(shieldSprite, -pickup.size, -pickup.size, pickup.size * 2, pickup.size * 2);
                } else {
                    // Fallback: Draw shield pickup as a blue hexagon
                    this.ctx.fillStyle = '#00aaff';
                    this.ctx.strokeStyle = '#0088cc';
                    this.ctx.lineWidth = 2;
                    
                    this.ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        const x = Math.cos(angle) * pickup.size;
                        const y = Math.sin(angle) * pickup.size;
                        if (i === 0) {
                            this.ctx.moveTo(x, y);
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Add inner highlight
                    this.ctx.fillStyle = '#66ccff';
                    this.ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        const x = Math.cos(angle) * (pickup.size * 0.6);
                        const y = Math.sin(angle) * (pickup.size * 0.6);
                        if (i === 0) {
                            this.ctx.moveTo(x, y);
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            } else if (pickup.type === 'weapon') {
                // Render weapon pickups
                const spriteKey = pickup.weaponType + 'Pickup';
                const weaponSprite = this.sprites.get(spriteKey);
                if (weaponSprite && weaponSprite instanceof Image) {
                    this.ctx.imageSmoothingEnabled = false;
                    this.ctx.drawImage(weaponSprite, -pickup.size, -pickup.size, pickup.size * 2, pickup.size * 2);
                } else {
                    // Fallback: Draw weapon pickup as a gray rectangle
                    this.ctx.fillStyle = '#888';
                    this.ctx.strokeStyle = '#aaa';
                    this.ctx.lineWidth = 2;
                    this.ctx.fillRect(-pickup.size, -pickup.size * 0.5, pickup.size * 2, pickup.size);
                    this.ctx.strokeRect(-pickup.size, -pickup.size * 0.5, pickup.size * 2, pickup.size);
                }
            } else if (pickup.type === 'ammo') {
                // Render ammo pickups
                const spriteKey = pickup.ammoType + 'Pickup';
                const ammoSprite = this.sprites.get(spriteKey);
                if (ammoSprite && ammoSprite instanceof Image) {
                    this.ctx.imageSmoothingEnabled = false;
                    this.ctx.drawImage(ammoSprite, -pickup.size * 0.5, -pickup.size * 0.5, pickup.size, pickup.size);
                } else {
                    // Fallback: Draw ammo pickup as colored circles
                    const colors = {
                        smallBullets: '#ffd700',
                        largeBullets: '#ff6600',
                        greenBullets: '#00ff00',
                        shotgunShells: '#ff0000'
                    };
                    this.ctx.fillStyle = colors[pickup.ammoType] || '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, pickup.size * 0.6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            this.ctx.restore();
        }
    }
    
    renderBoxes() {
        for (let box of this.boxes) {
            if (box.destroyed) continue;
            
            this.ctx.save();
            
            // Try to use sprite first
            const boxSprite = this.sprites.get('box');
            if (boxSprite && boxSprite instanceof Image) {
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(boxSprite, box.x, box.y, box.width, box.height);
            } else {
                // Fallback: Draw brown box
                this.ctx.fillStyle = '#8B4513';
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 2;
                this.ctx.fillRect(box.x, box.y, box.width, box.height);
                this.ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Add some detail lines
                this.ctx.strokeStyle = '#A0522D';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(box.x + 8, box.y + 8);
                this.ctx.lineTo(box.x + box.width - 8, box.y + 8);
                this.ctx.moveTo(box.x + 8, box.y + box.height - 8);
                this.ctx.lineTo(box.x + box.width - 8, box.y + box.height - 8);
                this.ctx.moveTo(box.x + 8, box.y + 8);
                this.ctx.lineTo(box.x + 8, box.y + box.height - 8);
                this.ctx.moveTo(box.x + box.width - 8, box.y + 8);
                this.ctx.lineTo(box.x + box.width - 8, box.y + box.height - 8);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    renderUI() {
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }
    
    gameOver() {
        this.stop();
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h1>GAME OVER</h1>
            <p>Score: ${this.score}</p>
            <button onclick="location.reload()">Play Again</button>
        `;
        
        document.body.appendChild(gameOverDiv);
    }
    
    renderPickupMessage() {
        if (!this.pickupMessage) return;
        
        this.ctx.save();
        
        // Set alpha for fade effect
        this.ctx.globalAlpha = this.pickupMessage.alpha;
        
        // Position message in the center, slightly above center
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2 - 100;
        
        // Set text style
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // Draw text with shadow
        this.ctx.strokeText(this.pickupMessage.text, x, y);
        this.ctx.fillText(this.pickupMessage.text, x, y);
        
        this.ctx.restore();
    }
}