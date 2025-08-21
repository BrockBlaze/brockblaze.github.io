class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
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
            zoom: 1
        };
        
        // Game objects
        this.player = null;
        this.world = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        
        // Sprite system
        this.sprites = new Map();
        this.spritesLoaded = false;
        
        this.init();
    }
    
    async init() {
        await this.loadSprites();
        this.createWorld();
        this.createPlayer();
        this.setupEventListeners();
        this.start();
    }
    
    async loadSprites() {
        // For now, we'll use simple colored rectangles
        // You can replace this with actual sprite loading later
        this.spritesLoaded = true;
        
        // Create simple colored rectangles as placeholder sprites
        this.createPlaceholderSprites();
    }
    
    createPlaceholderSprites() {
        const spriteSize = 32;
        
        // Player sprite
        const playerCanvas = document.createElement('canvas');
        playerCanvas.width = spriteSize;
        playerCanvas.height = spriteSize;
        const playerCtx = playerCanvas.getContext('2d');
        playerCtx.fillStyle = '#00ff00';
        playerCtx.fillRect(0, 0, spriteSize, spriteSize);
        this.sprites.set('player', playerCanvas);
        
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
        this.world = new World(2000, 1500);
    }
    
    createPlayer() {
        const spawnPoint = this.world.getRandomSpawnPoint();
        this.player = new Player(spawnPoint.x, spawnPoint.y);
    }
    
    setupEventListeners() {
        // Shooting
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning && !this.isPaused) {
                this.shoot();
            }
        });
        
        // Pause/unpause
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause();
                e.preventDefault();
            }
            if (e.key === 'F1') {
                window.DEBUG = !window.DEBUG;
                e.preventDefault();
            }
        });
    }
    
    shoot() {
        if (!this.player) return;
        
        const bullet = {
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(this.player.angle) * 400,
            vy: Math.sin(this.player.angle) * 400,
            speed: 400,
            damage: 25,
            lifetime: 3000,
            age: 0
        };
        
        this.bullets.push(bullet);
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
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update UI
        this.updateUI();
        
        // Check collision with walls
        this.checkPlayerWallCollision();
    }
    
    updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        // Smooth camera following
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.x += bullet.vx * deltaTime;
            bullet.y += bullet.vy * deltaTime;
            bullet.age += deltaTime * 1000;
            
            // Remove old bullets
            if (bullet.age > bullet.lifetime) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check wall collision
            if (this.checkBulletWallCollision(bullet)) {
                this.bullets.splice(i, 1);
                continue;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        // Enemy spawning and AI would go here
    }
    
    updateParticles(deltaTime) {
        // Particle system would go here
    }
    
    checkPlayerWallCollision() {
        // Basic wall collision for player
        // This is simplified - you might want more sophisticated collision detection
    }
    
    checkBulletWallCollision(bullet) {
        return !this.world.isWalkable(bullet.x, bullet.y, 4, 4);
    }
    
    updateUI() {
        document.getElementById('healthValue').textContent = this.player.health;
        document.getElementById('scoreValue').textContent = this.score;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transform
        this.ctx.save();
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
        
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderUI();
    }
    
    renderBullets() {
        this.ctx.fillStyle = '#ffff00';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
        }
    }
    
    renderEnemies() {
        // Enemy rendering would go here
    }
    
    renderParticles() {
        // Particle rendering would go here
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
}