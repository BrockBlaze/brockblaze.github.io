
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

function shoot(player, sounds) {
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

function drawGun(ctx, canvas, player) {
    // Update recoil recovery
    if (gun.recoil > 0) {
        gun.recoil -= gun.recoilRecovery;
        if (gun.recoil < 0) gun.recoil = 0;
    }

    const gunWidth = 300; // Set the gun image width
    const gunHeight = 300; // Set the gun image height

    // Add recoil effect to gun position
    const recoilOffsetY = gun.recoil;

    // Gun bobbing based on player movement
    const bobX = Math.cos(player.bobAmount * 2) * 5; // Horizontal bob
    const bobY = Math.sin(player.bobAmount * 4) * 5; // Vertical bob

    const gunX = canvas.width / 2 - gunWidth / 2 + 150 + bobX; // Center the gun horizontally and apply bob
    const gunY = canvas.height - gunHeight + recoilOffsetY + bobY; // Position with recoil and bob offset

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

function drawBullets(ctx, canvas, worldToScreen) {
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

function drawTracerFromGun(ctx, from, to) {
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

export { gun, reloadWeapon, shoot, createMuzzleFlash, drawGun, createImpactEffect, drawBullets, drawTracerFromGun };
