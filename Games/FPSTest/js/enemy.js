
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

const ENEMY_VERTICAL_OFFSET = 40; // Adjust this to move sprites up/down. Higher value = lower on screen.

const enemySprites = {
    idle: document.getElementById('enemyIdle'),
    walk1: document.getElementById('enemyWalk1'),
    walk2: document.getElementById('enemyWalk2'),
    hurt: document.getElementById('enemyHurt'),
    dead: document.getElementById('enemyDead')
};

let enemies = [];

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

function spawnEnemy(type = 'SOLDIER', map, player) {
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

function updateEnemies(player, map, keys, isMouseDown, sounds, GAME_STATES) {
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
                            !isOccluded(enemy.x, enemy.y, player.x, player.y, map);
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
                    return GAME_STATES.GAME_OVER;
                }
            }
        }
    }
    return null;
}

function damageEnemy(enemy, damage, player, sounds, gun) {
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
        if (aliveEnemies === 0) { // Last enemy killed
            return true; // Wave complete
        }
    }
    return false; // Wave not complete
}

function drawEnemies(ctx, player, worldToScreen, map) {
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

        // Calculate distance and angle to enemy
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        // Check if enemy is behind a wall using raycasting
        if (isOccluded(player.x, player.y, enemy.x, enemy.y, map)) {
            continue; // Skip rendering this enemy as it's occluded by a wall
        }

        // Convert to screen space
        const screenPos = worldToScreen(enemy.x, enemy.y, enemy.z);

        // If not visible in view frustum, skip
        if (!screenPos.visible) continue;

        let sprite;
        if (enemy.state === 'dead') {
            sprite = enemySprites.dead;
        } else if (enemy.state === 'hurt') {
            sprite = enemySprites.hurt;
        } else if (enemy.state === 'chasing' || enemy.state === 'attacking') {
            // Simple walk animation
            if (Math.floor(Date.now() / 300) % 2 === 0) {
                sprite = enemySprites.walk1;
            } else {
                sprite = enemySprites.walk2;
            }
        } else {
            sprite = enemySprites.idle;
        }

        const scaleFactor = 900 / screenPos.distance;
        let height, width;

        if (sprite && sprite.complete) {
            height = enemy.size * 2 * scaleFactor;
            width = height * (sprite.width / sprite.height); // Maintain aspect ratio
            ctx.drawImage(
                sprite,
                screenPos.x - width / 2,
                screenPos.y - height / 2 + (ENEMY_VERTICAL_OFFSET * scaleFactor),
                width,
                height
            );
        } else {
            // Fallback to drawing a rectangle if sprite is not available
            width = enemy.size * scaleFactor;
            height = enemy.size * 2 * scaleFactor;
            const gradient = ctx.createLinearGradient(screenPos.x - width / 2, 0, screenPos.x + width / 2, 0);
            if (enemy.state === 'hurt') {
                gradient.addColorStop(0, 'white');
                gradient.addColorStop(1, '#aaaaaa');
            } else {
                switch (enemy.type) {
                    case 'HEAVY':
                        gradient.addColorStop(0, '#A00000');
                        gradient.addColorStop(0.5, '#600000');
                        gradient.addColorStop(1, '#400000');
                        break;
                    case 'SCOUT':
                        gradient.addColorStop(0, '#FFC83D');
                        gradient.addColorStop(0.5, '#CC8400');
                        gradient.addColorStop(1, '#A66A00');
                        break;
                    case 'SOLDIER':
                    default:
                        gradient.addColorStop(0, '#FF4D4D');
                        gradient.addColorStop(0.5, '#B20000');
                        gradient.addColorStop(1, '#800000');
                        break;
                }
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(
                screenPos.x - width / 2,
                screenPos.y - height / 2,
                width,
                height
            );
        }

        // Draw health bar above enemy (only if not dead)
        if (enemy.state !== 'dead') {
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
}

function isOccluded(x1, y1, x2, y2, map) {
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

export { ENEMY_TYPES, enemies, spawnEnemies, spawnEnemy, updateEnemies, damageEnemy, drawEnemies, isOccluded };
