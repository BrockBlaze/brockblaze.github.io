class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 200; // pixels per second
        this.angle = 0;
        this.health = 100;
        this.maxHealth = 100;
        
        // Movement state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.85;
        
        // Mouse position for aiming
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
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
        // Movement input
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys.w) moveY -= 1;
        if (this.keys.s) moveY += 1;
        if (this.keys.a) moveX -= 1;
        if (this.keys.d) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        // Apply acceleration
        const acceleration = this.speed * 3;
        this.vx += moveX * acceleration * deltaTime;
        this.vy += moveY * acceleration * deltaTime;
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Keep player in bounds (basic boundary checking)
        const canvas = document.getElementById('gameCanvas');
        const padding = this.width / 2;
        this.x = Math.max(padding, Math.min(canvas.width - padding, this.x));
        this.y = Math.max(padding, Math.min(canvas.height - padding, this.y));
        
        // Update rotation based on mouse position
        this.updateRotation();
    }
    
    updateRotation() {
        const dx = this.mouseX - this.x;
        const dy = this.mouseY - this.y;
        this.angle = Math.atan2(dy, dx);
    }
    
    render(ctx) {
        ctx.save();
        
        // Translate to player position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw player (simple triangle for now, can be replaced with sprite)
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height / 3);
        ctx.lineTo(-this.width / 4, 0);
        ctx.lineTo(-this.width / 2, this.height / 3);
        ctx.closePath();
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Draw aim line (optional, for debugging)
        if (window.DEBUG) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.mouseX, this.mouseY);
            ctx.stroke();
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            return true; // Player is dead
        }
        return false;
    }
    
    getCenter() {
        return { x: this.x, y: this.y };
    }
}