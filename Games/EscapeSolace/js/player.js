class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 700; // pixels per second
        this.angle = 0;
        this.gunAngle = 0; // Immediate gun aiming
        this.bodyAngle = 0; // Delayed body rotation
        this.bodyRotationSpeed = 12; // Radians per second
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 50;
        this.maxShield = 50;
        this.isDead = false;
        
        // Health regeneration
        this.lastDamageTime = performance.now();
        this.healthRegenDelay = 4000; // 4 seconds
        this.healthRegenRate = 25; // HP per second
        
        // Movement state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        
        // Dash ability
        this.isDashing = false;
        this.dashSpeed = 800; // Very fast burst speed
        this.dashDuration = 150; // milliseconds
        this.dashTimer = 0;
        this.dashCooldown = 1000; // 1 second cooldown
        this.dashCooldownTimer = 0;
        this.dashDirection = { x: 0, y: 0 };
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.85;
        
        // Animation state
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 200; // milliseconds per frame
        
        // Mouse position for aiming
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === ' ') {
                this.keys.space = true;
                e.preventDefault();
            } else if (key in this.keys) {
                this.keys[key] = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === ' ') {
                this.keys.space = false;
                e.preventDefault();
            } else if (key in this.keys) {
                this.keys[key] = false;
                e.preventDefault();
            }
        });
        
        // Mouse events
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    update(deltaTime) {
        // Don't update if dead
        if (this.isDead) return;
        
        // Movement input
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys.w) moveY -= 1;
        if (this.keys.s) moveY += 1;
        if (this.keys.a) moveX -= 1;
        if (this.keys.d) moveX += 1;
        
        // Update dash cooldown
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime * 1000;
        }
        
        // Check for dash activation
        if (this.keys.space && !this.isDashing && this.dashCooldownTimer <= 0) {
            // Start dash if moving
            if (moveX !== 0 || moveY !== 0) {
                this.startDash(moveX, moveY);
            }
        }
        
        // Update dash state
        if (this.isDashing) {
            this.dashTimer -= deltaTime * 1000;
            if (this.dashTimer <= 0) {
                this.endDash();
            }
        }
        
        // Check if player is moving and update animation
        this.isMoving = (moveX !== 0 || moveY !== 0) || (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) || this.isDashing;
        
        // Update animation timer if moving
        if (this.isMoving) {
            // Speed up animation during dash
            const animSpeed = this.isDashing ? this.animationSpeed * 0.5 : this.animationSpeed;
            this.animationTimer += deltaTime * 1000; // Convert to milliseconds
            if (this.animationTimer >= animSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 2; // Toggle between 0 and 1
            }
        } else {
            // Reset to standing frame when not moving
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
        
        // Debug input
        if (window.DEBUG && (moveX !== 0 || moveY !== 0)) {
            console.log(`Input: moveX=${moveX}, moveY=${moveY}, keys:`, this.keys);
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        // Apply acceleration
        if (this.isDashing) {
            // Use dash speed and direction
            const dashAcceleration = this.dashSpeed * 5;
            this.vx += this.dashDirection.x * dashAcceleration * deltaTime;
            this.vy += this.dashDirection.y * dashAcceleration * deltaTime;
        } else {
            // Normal movement
            const acceleration = this.speed * 3;
            this.vx += moveX * acceleration * deltaTime;
            this.vy += moveY * acceleration * deltaTime;
        }
        
        // Debug velocity
        if (window.DEBUG && (Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1)) {
            console.log(`Velocity: vx=${Math.round(this.vx)}, vy=${Math.round(this.vy)}`);
        }
        
        // Apply friction (less friction during dash for smoother movement)
        const currentFriction = this.isDashing ? 0.98 : this.friction;
        this.vx *= currentFriction;
        this.vy *= currentFriction;
        
        // Clamp to max speed (higher limit during dash)
        const maxSpeed = this.isDashing ? this.dashSpeed : this.speed;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            this.vx *= scale;
            this.vy *= scale;
        }
        
        // Store previous position
        const prevX = this.x;
        const prevY = this.y;
        
        // Calculate new position
        const newX = this.x + this.vx * deltaTime;
        const newY = this.y + this.vy * deltaTime;
        
        // Debug actual movement calculation
        if (window.DEBUG && Math.abs(this.vy) > 5) {
            console.log(`Movement calc: pos=(${Math.round(this.x)}, ${Math.round(this.y)}), vel=(${Math.round(this.vx)}, ${Math.round(this.vy)}), deltaTime=${deltaTime.toFixed(4)}, newPos=(${Math.round(newX)}, ${Math.round(newY)})`);
        }
        
        // Check if new position is walkable before moving
        if (window.game && window.game.world && window.game.world.isWalkable(newX, newY, 20, 20)) {
            this.x = newX;
            this.y = newY;
            if (window.DEBUG && Math.abs(this.vy) > 5) {
                console.log(`✓ Moved to (${Math.round(this.x)}, ${Math.round(this.y)})`);
            }
        } else {
            // Movement blocked, stop velocity
            this.vx = 0;
            this.vy = 0;
            if (window.DEBUG) {
                console.log(`Movement blocked: (${Math.round(this.x)}, ${Math.round(this.y)}) -> (${Math.round(newX)}, ${Math.round(newY)})`);
                // Test why it's not walkable
                if (window.game && window.game.world) {
                    console.log(`Testing walkability at (${Math.round(newX)}, ${Math.round(newY)}):`);
                    window.game.world.testWalkable(newX, newY, 20, 20);
                }
            }
        }
        
        // World boundary checking (use world size, not canvas size)
        if (window.game && window.game.world) {
            const padding = this.width / 2;
            const oldX = this.x;
            const oldY = this.y;
            this.x = Math.max(padding, Math.min(window.game.world.width - padding, this.x));
            this.y = Math.max(padding, Math.min(window.game.world.height - padding, this.y));
            
            // Debug if boundary checking changed position
            if (window.DEBUG && (Math.abs(this.x - oldX) > 0.1 || Math.abs(this.y - oldY) > 0.1)) {
                console.log(`🚨 World boundary check moved player from (${Math.round(oldX)}, ${Math.round(oldY)}) to (${Math.round(this.x)}, ${Math.round(this.y)})`);
                console.log(`World size: ${window.game.world.width}x${window.game.world.height}, padding: ${padding}`);
            }
        }
        
        // Update rotation based on mouse position
        this.updateRotation(deltaTime);
        
        // Update health regeneration
        this.updateHealthRegen(deltaTime);
    }
    
    updateRotation(deltaTime) {
        // Account for camera position and zoom
        const camera = window.game ? window.game.camera : { x: 0, y: 0, zoom: 1 };
        const worldMouseX = (this.mouseX / camera.zoom) + camera.x;
        const worldMouseY = (this.mouseY / camera.zoom) + camera.y;
        
        const dx = worldMouseX - this.x;
        const dy = worldMouseY - this.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // Gun follows mouse immediately
        this.gunAngle = targetAngle;
        this.angle = this.gunAngle; // Keep this for bullet direction
        
        // Body rotates slowly toward target
        let angleDiff = targetAngle - this.bodyAngle;
        
        // Handle angle wrapping (shortest rotation path)
        if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
        } else if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
        }
        
        // Smoothly rotate body toward target
        const rotationStep = this.bodyRotationSpeed * deltaTime;
        if (Math.abs(angleDiff) > rotationStep) {
            this.bodyAngle += Math.sign(angleDiff) * rotationStep;
        } else {
            this.bodyAngle = targetAngle;
        }
    }
    
    updateHealthRegen(deltaTime) {
        const currentTime = performance.now();
        const timeSinceLastDamage = currentTime - this.lastDamageTime;
        
        // Check if enough time has passed since last damage
        if (timeSinceLastDamage >= this.healthRegenDelay) {
            // Regenerate health if not at max
            if (this.health < this.maxHealth) {
                const oldHealth = this.health;
                this.health += this.healthRegenRate * deltaTime;
                if (this.health > this.maxHealth) {
                    this.health = this.maxHealth;
                }
                if (Math.floor(oldHealth) !== Math.floor(this.health)) {
                    console.log(`Health regenerating: ${Math.floor(this.health)}`);
                }
            }
        }
    }
    
    takeDamage(damage) {
        console.log(`=== TAKE DAMAGE START === Damage: ${damage}, Current Health: ${this.health}, Current Shield: ${this.shield}`);
        let remainingDamage = damage;
        
        // Shield absorbs damage first
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, remainingDamage);
            this.shield -= shieldDamage;
            remainingDamage -= shieldDamage;
            console.log(`Shield took ${shieldDamage} damage, shield now: ${this.shield}, remaining damage: ${remainingDamage}`);
        } else {
            console.log(`No shield to absorb damage`);
        }
        
        // Apply remaining damage to health
        if (remainingDamage > 0) {
            this.health -= remainingDamage;
            if (this.health < 0) {
                this.health = 0;
            }
            console.log(`Health took ${remainingDamage} damage, health now: ${this.health}`);
        } else {
            console.log(`No remaining damage for health`);
        }
        
        // Reset damage timer to stop health regen
        this.lastDamageTime = performance.now();
        console.log(`Damage timer reset. Health regen paused for 4 seconds.`);
        console.log(`=== TAKE DAMAGE END === Final Health: ${this.health}, Final Shield: ${this.shield}`);
        
        // Check if player died
        if (this.health <= 0) {
            this.isDead = true;
        }
        
        return this.health <= 0; // Return true if dead
    }
    
    addShield(amount) {
        this.shield += amount;
        if (this.shield > this.maxShield) {
            this.shield = this.maxShield;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Enable pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        
        // Translate to player position (round to nearest pixel for crisp rendering)
        ctx.translate(Math.round(this.x), Math.round(this.y));
        
        // Draw weapon first (under player) - hide during reload or when dead
        let weaponSprite = null;
        if (window.game && window.game.getCurrentWeapon()) {
            const currentWeapon = window.game.getCurrentWeapon();
            const weaponData = window.game.weaponTypes[currentWeapon.type];
            weaponSprite = window.game.sprites.get(weaponData.sprite);
        }
        if (weaponSprite && weaponSprite instanceof Image && !this.isDead && !(window.game && window.game.isReloading)) {
            ctx.save();
            ctx.rotate(this.gunAngle); // Gun rotates immediately to mouse
            ctx.imageSmoothingEnabled = false;
            // Rotate weapon by 90 degrees
            ctx.rotate(Math.PI / 2);
            // Position weapon slightly offset from player center + recoil offset
            const recoilOffset = window.game ? window.game.recoilOffset : 0;
            ctx.drawImage(weaponSprite, -16, -27 + recoilOffset, 32, 32);
            ctx.restore();
        }
        
        // Rotate for player body (delayed rotation)
        ctx.rotate(this.bodyAngle);
        
        // Draw player sprite if available, otherwise draw pixel art style triangle
        let spriteToUse = null;
        
        if (window.game) {
            if (this.isDead) {
                // Use death sprite
                spriteToUse = window.game.sprites.get('playerDead');
            } else if (this.isMoving) {
                // Use walking sprites
                spriteToUse = this.animationFrame === 0 
                    ? window.game.sprites.get('playerWalk1')
                    : window.game.sprites.get('playerWalk2');
            } else {
                // Use standing sprite
                spriteToUse = window.game.sprites.get('player');
            }
        }
        
        if (spriteToUse && spriteToUse instanceof Image) {
            // Rotate sprite 90 degrees to the right (add π/2 to rotation)
            ctx.rotate(Math.PI / 2);
            // Draw the sprite image with pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            if (this.isDead) {
                // Make death sprite 1.5x bigger and rotate 180 degrees
                ctx.rotate(Math.PI);
                const deathWidth = this.width * 1.5;
                const deathHeight = this.height * 1.5;
                ctx.drawImage(spriteToUse, -deathWidth / 2, -deathHeight / 2, deathWidth, deathHeight);
            } else {
                ctx.drawImage(spriteToUse, -this.width / 2, -this.height / 2, this.width, this.height);
            }
            ctx.rotate(-Math.PI / 2);
        } else {
            // Draw pixel-art style player
            const pixelSize = 2;
            
            // Create pixel art ship shape
            const pixels = [
                // Main body (green)
                { x: 6, y: 0, color: '#0f0' },
                { x: 5, y: 0, color: '#0f0' },
                { x: 4, y: -1, color: '#0f0' },
                { x: 4, y: 0, color: '#0f0' },
                { x: 4, y: 1, color: '#0f0' },
                { x: 3, y: -2, color: '#0f0' },
                { x: 3, y: -1, color: '#0f0' },
                { x: 3, y: 0, color: '#0f0' },
                { x: 3, y: 1, color: '#0f0' },
                { x: 3, y: 2, color: '#0f0' },
                { x: 2, y: -2, color: '#0a0' },
                { x: 2, y: -1, color: '#0f0' },
                { x: 2, y: 0, color: '#0f0' },
                { x: 2, y: 1, color: '#0f0' },
                { x: 2, y: 2, color: '#0a0' },
                { x: 1, y: -3, color: '#0a0' },
                { x: 1, y: -2, color: '#0a0' },
                { x: 1, y: -1, color: '#0f0' },
                { x: 1, y: 0, color: '#0f0' },
                { x: 1, y: 1, color: '#0f0' },
                { x: 1, y: 2, color: '#0a0' },
                { x: 1, y: 3, color: '#0a0' },
                { x: 0, y: -3, color: '#0a0' },
                { x: 0, y: -2, color: '#0a0' },
                { x: 0, y: -1, color: '#0a0' },
                { x: 0, y: 0, color: '#0f0' },
                { x: 0, y: 1, color: '#0a0' },
                { x: 0, y: 2, color: '#0a0' },
                { x: 0, y: 3, color: '#0a0' },
                { x: -1, y: -2, color: '#088' },
                { x: -1, y: -1, color: '#0a0' },
                { x: -1, y: 0, color: '#0a0' },
                { x: -1, y: 1, color: '#0a0' },
                { x: -1, y: 2, color: '#088' },
                { x: -2, y: -2, color: '#088' },
                { x: -2, y: -1, color: '#088' },
                { x: -2, y: 0, color: '#0a0' },
                { x: -2, y: 1, color: '#088' },
                { x: -2, y: 2, color: '#088' },
                { x: -3, y: -1, color: '#066' },
                { x: -3, y: 0, color: '#088' },
                { x: -3, y: 1, color: '#066' },
                { x: -4, y: -1, color: '#066' },
                { x: -4, y: 0, color: '#066' },
                { x: -4, y: 1, color: '#066' },
                // Highlight pixels (bright green)
                { x: 5, y: 0, color: '#4f4' },
                { x: 4, y: 0, color: '#4f4' },
                { x: 3, y: 0, color: '#2f2' },
            ];
            
            // Draw shadow first
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for (let pixel of pixels) {
                ctx.fillRect(
                    pixel.x * pixelSize + 2,
                    pixel.y * pixelSize + 2,
                    pixelSize,
                    pixelSize
                );
            }
            
            // Draw pixels
            for (let pixel of pixels) {
                ctx.fillStyle = pixel.color;
                ctx.fillRect(
                    pixel.x * pixelSize,
                    pixel.y * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
            
            // Draw pixel outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-8 * pixelSize, -3 * pixelSize, 14 * pixelSize, 7 * pixelSize);
        }
        
        ctx.restore();
        
        // Draw debug information
        if (window.DEBUG) {
            // Draw aim line
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.mouseX, this.mouseY);
            ctx.stroke();
            
            // Draw player collision box
            const playerSize = Math.max(this.width, this.height);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x - playerSize/2, 
                this.y - playerSize/2, 
                playerSize, 
                playerSize
            );
            
            // Draw player center point
            ctx.fillStyle = 'rgba(0, 255, 0, 1)';
            ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
            
            // Show position and walkability
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';
            const isWalkable = window.game && window.game.world ? 
                window.game.world.isWalkable(this.x, this.y, 20, 20) : 'unknown';
            ctx.fillText(`Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`, this.x + 20, this.y - 20);
            ctx.fillText(`Walkable: ${isWalkable}`, this.x + 20, this.y - 5);
            
            // Test positions below player
            for (let i = 1; i <= 3; i++) {
                const testY = this.y + (i * 10);
                const walkable = window.game && window.game.world ? 
                    window.game.world.isWalkable(this.x, testY, 20, 20) : false;
                ctx.fillStyle = walkable ? '#0f0' : '#f00';
                ctx.fillRect(this.x - 5, testY - 2, 10, 4);
            }
        }
    }
    
    
    getCenter() {
        return { x: this.x, y: this.y };
    }
    
    startDash(moveX, moveY) {
        // Normalize dash direction
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        this.dashDirection.x = moveX / length;
        this.dashDirection.y = moveY / length;
        
        // Start dash
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        
        // Give initial velocity boost
        this.vx = this.dashDirection.x * this.dashSpeed * 0.5;
        this.vy = this.dashDirection.y * this.dashSpeed * 0.5;
        
        console.log('Dash activated!');
    }
    
    endDash() {
        this.isDashing = false;
        this.dashTimer = 0;
        // Velocity will naturally slow down due to friction
        console.log('Dash ended');
    }
}