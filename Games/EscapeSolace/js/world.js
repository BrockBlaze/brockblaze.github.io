class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.rooms = [];
        this.corridors = [];
        this.walls = [];
        this.tiles = [];
        
        // Generation parameters
        this.roomCount = 8;
        this.minRoomSize = 60;
        this.maxRoomSize = 120;
        this.corridorWidth = 40;
        
        this.generate();
    }
    
    generate() {
        this.generateRooms();
        this.connectRooms();
        this.generateWalls();
    }
    
    generateRooms() {
        this.rooms = [];
        const attempts = 50;
        
        for (let i = 0; i < attempts && this.rooms.length < this.roomCount; i++) {
            const room = this.createRandomRoom();
            
            if (!this.doesRoomOverlap(room)) {
                this.rooms.push(room);
            }
        }
    }
    
    createRandomRoom() {
        const width = Math.random() * (this.maxRoomSize - this.minRoomSize) + this.minRoomSize;
        const height = Math.random() * (this.maxRoomSize - this.minRoomSize) + this.minRoomSize;
        const x = Math.random() * (this.width - width - 100) + 50;
        const y = Math.random() * (this.height - height - 100) + 50;
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            center: {
                x: x + width / 2,
                y: y + height / 2
            }
        };
    }
    
    doesRoomOverlap(newRoom) {
        const padding = 30;
        
        for (let room of this.rooms) {
            if (newRoom.x < room.x + room.width + padding &&
                newRoom.x + newRoom.width + padding > room.x &&
                newRoom.y < room.y + room.height + padding &&
                newRoom.y + newRoom.height + padding > room.y) {
                return true;
            }
        }
        return false;
    }
    
    connectRooms() {
        this.corridors = [];
        
        if (this.rooms.length < 2) return;
        
        // Connect each room to the next one
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            this.createCorridor(roomA, roomB);
        }
        
        // Connect last room to first to create a loop
        if (this.rooms.length > 2) {
            this.createCorridor(this.rooms[this.rooms.length - 1], this.rooms[0]);
        }
    }
    
    createCorridor(roomA, roomB) {
        const startX = roomA.center.x;
        const startY = roomA.center.y;
        const endX = roomB.center.x;
        const endY = roomB.center.y;
        
        // Create L-shaped corridor
        const corridor = {
            segments: [
                {
                    x: Math.min(startX, endX) - this.corridorWidth / 2,
                    y: startY - this.corridorWidth / 2,
                    width: Math.abs(endX - startX) + this.corridorWidth,
                    height: this.corridorWidth
                },
                {
                    x: endX - this.corridorWidth / 2,
                    y: Math.min(startY, endY) - this.corridorWidth / 2,
                    width: this.corridorWidth,
                    height: Math.abs(endY - startY) + this.corridorWidth
                }
            ]
        };
        
        this.corridors.push(corridor);
    }
    
    generateWalls() {
        this.walls = [];
        
        // Generate walls around rooms
        for (let room of this.rooms) {
            this.addRoomWalls(room);
        }
        
        // Generate walls around corridors
        for (let corridor of this.corridors) {
            for (let segment of corridor.segments) {
                this.addCorridorWalls(segment);
            }
        }
    }
    
    addRoomWalls(room) {
        const wallThickness = 8;
        
        // Top wall
        this.walls.push({
            x: room.x - wallThickness,
            y: room.y - wallThickness,
            width: room.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Bottom wall
        this.walls.push({
            x: room.x - wallThickness,
            y: room.y + room.height,
            width: room.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Left wall
        this.walls.push({
            x: room.x - wallThickness,
            y: room.y - wallThickness,
            width: wallThickness,
            height: room.height + wallThickness * 2
        });
        
        // Right wall
        this.walls.push({
            x: room.x + room.width,
            y: room.y - wallThickness,
            width: wallThickness,
            height: room.height + wallThickness * 2
        });
    }
    
    addCorridorWalls(segment) {
        const wallThickness = 8;
        
        // Top wall
        this.walls.push({
            x: segment.x - wallThickness,
            y: segment.y - wallThickness,
            width: segment.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Bottom wall
        this.walls.push({
            x: segment.x - wallThickness,
            y: segment.y + segment.height,
            width: segment.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Left wall
        this.walls.push({
            x: segment.x - wallThickness,
            y: segment.y - wallThickness,
            width: wallThickness,
            height: segment.height + wallThickness * 2
        });
        
        // Right wall
        this.walls.push({
            x: segment.x + segment.width,
            y: segment.y - wallThickness,
            width: wallThickness,
            height: segment.height + wallThickness * 2
        });
    }
    
    isWalkable(x, y, width = 1, height = 1) {
        // Check if the given rectangle is in a walkable area (room or corridor)
        const rect = { x: x - width/2, y: y - width/2, width, height };
        
        // Check rooms
        for (let room of this.rooms) {
            if (this.rectangleIntersects(rect, room)) {
                return true;
            }
        }
        
        // Check corridors
        for (let corridor of this.corridors) {
            for (let segment of corridor.segments) {
                if (this.rectangleIntersects(rect, segment)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    rectangleIntersects(a, b) {
        return !(a.x + a.width < b.x || 
                 b.x + b.width < a.x || 
                 a.y + a.height < b.y || 
                 b.y + b.height < a.y);
    }
    
    getRandomSpawnPoint() {
        if (this.rooms.length === 0) {
            return { x: this.width / 2, y: this.height / 2 };
        }
        
        const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
        return {
            x: room.x + room.width * 0.2 + Math.random() * room.width * 0.6,
            y: room.y + room.height * 0.2 + Math.random() * room.height * 0.6
        };
    }
    
    render(ctx) {
        // Draw floor tiles
        ctx.fillStyle = '#222';
        
        // Draw room floors
        for (let room of this.rooms) {
            ctx.fillRect(room.x, room.y, room.width, room.height);
        }
        
        // Draw corridor floors
        for (let corridor of this.corridors) {
            for (let segment of corridor.segments) {
                ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
            }
        }
        
        // Draw walls
        ctx.fillStyle = '#666';
        for (let wall of this.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
        
        // Draw room outlines (for debugging)
        if (window.DEBUG) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            for (let room of this.rooms) {
                ctx.strokeRect(room.x, room.y, room.width, room.height);
            }
        }
    }
}