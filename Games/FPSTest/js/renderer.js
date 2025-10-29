
function draw(ctx, canvas, player, allResourcesLoaded, numRays, fov, maxDepth, wallHeight, castRay, map, FALLBACK_WALL_COLOR, textures) {
    if (!allResourcesLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bobOffset = Math.sin(player.bobAmount) * 5 * (player.isSprinting ? 2 : 1);
    const pitchOffset = player.pitch * canvas.height + bobOffset;

    drawFloorAndCeiling(ctx, canvas, player, pitchOffset, textures.floor, textures.ceiling);
    
    drawWalls(ctx, canvas, player, pitchOffset, textures.wall, textures.wall2, numRays, fov, maxDepth, wallHeight, castRay, map, FALLBACK_WALL_COLOR);
}

function drawFloorAndCeiling(ctx, canvas, player, pitchOffset, floorTexture, ceilingTexture) {
    const horizon = canvas.height / 2 + pitchOffset;
    
    // Simple textured floor and ceiling (optimized version)
    // Draw ceiling
    if (false && ceilingTexture && ceilingTexture.complete) {
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
    if (false && floorTexture && floorTexture.complete) {
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

function drawWalls(ctx, canvas, player, pitchOffset, wallTexture1, wallTexture2, numRays, fov, maxDepth, wallHeight, castRay, map, FALLBACK_WALL_COLOR) {
    const rayWidth = canvas.width / numRays;
    
    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1;
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle, player, maxDepth, map, wallHeight);

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



function drawHUD(ctx, canvas, player, gun, map, enemies) {
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
    drawMinimap(ctx, canvas, player, map, enemies);
}

function drawMinimap(ctx, canvas, player, map, enemies) {
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

function drawMenu(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FPSTest', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px monospace';
    ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 20);
}

function drawPauseScreen(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
}

function drawGameOver(ctx, canvas, player, waveNumber) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    ctx.fillText(`You reached wave ${waveNumber}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 120);
}

export { draw, drawFloorAndCeiling, drawWalls, getCeilingColor, getFloorColor, drawHUD, drawMinimap, drawMenu, drawPauseScreen, drawGameOver };
