class Badguy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 400; // pixels per second
        this.health = 50;
        this.maxHealth = 50;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathDuration = 10000; // 10 seconds before removal
        
        // Movement and AI
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.85;
        this.angle = 0;
        this.targetAngle = 0;
        this.rotationSpeed = 6; // radians per second
        
        // Animation
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 300; // milliseconds per frame
        
        // AI behavior
        this.state = 'idle'; // idle, chase, attack
        this.sightRange = 300;
        this.attackRange = 200;
        this.lastShotTime = 0;
        this.fireRate = 300; // rounds per minute (slower than player)
        this.bulletSpeed = 600;
        
        // Weapon rendering
        this.weaponAngle = 0;
        
        // Recoil animation
        this.recoilOffset = 0;
        this.maxRecoil = 5; // pixels
        this.recoilRecoverySpeed = 30; // pixels per second
    }
    
    update(deltaTime) {
        if (!window.game || !window.game.player) return;
        
        // If dead, just update death timer
        if (this.isDead) {
            this.deathTimer += deltaTime * 1000;
            if (this.deathTimer === deltaTime * 1000) { // First frame of being dead
                console.log('Badguy entered death state, timer started');
            }
            return;
        }
        
        const player = window.game.player;
        
        // Don't target dead players
        if (player.isDead) {
            this.state = 'idle';
        } else {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
            
            // AI state machine
            if (distanceToPlayer <= this.sightRange) {
                if (distanceToPlayer <= this.attackRange) {
                    this.state = 'attack';
                } else {
                    this.state = 'chase';
                }
            } else {
                this.state = 'idle';
            }
        }
        
        // Update behavior based on state
        switch (this.state) {
            case 'chase':
                if (!player.isDead) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
                    this.chasePlayer(deltaTime, dx, dy, distanceToPlayer);
                }
                break;
            case 'attack':
                if (!player.isDead) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    this.attackPlayer(deltaTime, dx, dy);
                }
                break;
            case 'idle':
                this.idle(deltaTime);
                break;
        }
        
        // Update rotation
        this.updateRotation(deltaTime);
        
        // Apply movement
        this.updateMovement(deltaTime);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update recoil animation
        this.updateRecoil(deltaTime);
    }
    
    chasePlayer(deltaTime, dx, dy, distance) {
        // Move toward player
        const moveX = dx / distance;
        const moveY = dy / distance;
        
        const acceleration = this.speed * 2;
        this.vx += moveX * acceleration * deltaTime;
        this.vy += moveY * acceleration * deltaTime;
        
        // Face player
        this.targetAngle = Math.atan2(dy, dx);
        this.weaponAngle = this.targetAngle;
    }
    
    attackPlayer(deltaTime, dx, dy) {
        // Stop moving and shoot
        this.vx *= 0.9; // Slow down
        this.vy *= 0.9;
        
        // Face player
        this.targetAngle = Math.atan2(dy, dx);
        this.weaponAngle = this.targetAngle;
        
        // Try to shoot
        this.tryShoot();
    }
    
    idle(deltaTime) {
        // Just stand still and slow down
        this.vx *= this.friction;
        this.vy *= this.friction;
    }
    
    updateRotation(deltaTime) {
        // Smoothly rotate toward target angle
        let angleDiff = this.targetAngle - this.angle;
        
        // Handle angle wrapping
        if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
        } else if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
        }
        
        // Rotate toward target
        const rotationStep = this.rotationSpeed * deltaTime;
        if (Math.abs(angleDiff) > rotationStep) {
            this.angle += Math.sign(angleDiff) * rotationStep;
        } else {
            this.angle = this.targetAngle;
        }
    }
    
    updateMovement(deltaTime) {
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Clamp to max speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.speed) {
            const scale = this.speed / currentSpeed;
            this.vx *= scale;
            this.vy *= scale;
        }
        
        // Calculate new position
        const newX = this.x + this.vx * deltaTime;
        const newY = this.y + this.vy * deltaTime;
        
        // Check if new position is walkable
        if (window.game && window.game.world && window.game.world.isWalkable(newX, newY, 20, 20)) {
            this.x = newX;
            this.y = newY;
        } else {
            // Stop if hitting wall
            this.vx = 0;
            this.vy = 0;
        }
        
        // Update movement state
        this.isMoving = Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10;
    }
    
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.animationTimer += deltaTime * 1000;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 2;
            }
        } else {
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }
    
    tryShoot() {
        const currentTime = performance.now();
        const timeBetweenShots = 60000 / this.fireRate;
        
        if (currentTime - this.lastShotTime < timeBetweenShots) return;
        
        // Create bullet
        const bullet = {
            x: this.x,
            y: this.y,
            vx: Math.cos(this.weaponAngle) * this.bulletSpeed,
            vy: Math.sin(this.weaponAngle) * this.bulletSpeed,
            speed: this.bulletSpeed,
            damage: 15,
            lifetime: 3000,
            age: 0,
            isEnemyBullet: true
        };
        
        if (window.game) {
            window.game.bullets.push(bullet);
        }
        
        this.lastShotTime = currentTime;
        
        // Add recoil effect
        this.recoilOffset = this.maxRecoil;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            console.log('Badguy died!');
            return true; // Dead
        }
        return false;
    }
    
    updateRecoil(deltaTime) {
        if (this.recoilOffset > 0) {
            this.recoilOffset -= this.recoilRecoverySpeed * deltaTime;
            if (this.recoilOffset < 0) {
                this.recoilOffset = 0;
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Enable pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        
        // Translate to badguy position
        ctx.translate(Math.round(this.x), Math.round(this.y));
        
        // Draw weapon first (under badguy) - hide when dead
        const weaponSprite = window.game ? window.game.sprites.get('badguyBlaster') : null;
        if (weaponSprite && weaponSprite instanceof Image && !this.isDead) {
            ctx.save();
            ctx.rotate(this.weaponAngle);
            ctx.imageSmoothingEnabled = false;
            ctx.rotate(Math.PI / 2);
            // Position weapon with recoil offset
            ctx.drawImage(weaponSprite, -16, -27 + this.recoilOffset, 32, 32);
            ctx.restore();
        }
        
        // Rotate for badguy body
        ctx.rotate(this.angle);
        
        // Choose sprite based on death and movement
        let spriteToUse = null;
        if (window.game) {
            if (this.isDead) {
                spriteToUse = window.game.sprites.get('badguyDead');
                console.log(`Dead badguy rendering - sprite found: ${spriteToUse ? 'YES' : 'NO'}`);
                if (!spriteToUse) {
                    console.log('Available sprites:', Array.from(window.game.sprites.keys()));
                }
            } else if (this.isMoving) {
                spriteToUse = this.animationFrame === 0 
                    ? window.game.sprites.get('badguyWalk1')
                    : window.game.sprites.get('badguyWalk2');
            } else {
                spriteToUse = window.game.sprites.get('badguy');
            }
        }
        
        if (spriteToUse && spriteToUse instanceof Image) {
            ctx.rotate(Math.PI / 2);
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
        } else {
            // Fallback red triangle
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, -8);
            ctx.lineTo(-10, 8);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw health bar above badguy (only if alive)
        if (!this.isDead && this.health < this.maxHealth) {
            ctx.save();
            const barWidth = 30;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 25;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            ctx.restore();
        }
    }
}