class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.rooms = [];
        this.corridors = [];
        this.walls = [];
        this.tiles = [];
        this.doorways = [];
        
        // Generation parameters
        this.roomCount = 8;
        this.minRoomSize = 60;
        this.maxRoomSize = 120;
        this.corridorWidth = 120;
        
        this.generate();
    }
    
    generate() {
        // Always use Doom-style generation for clean, predictable layouts
        this.generateDoomStyleWorld();
    }
    
    generateDoomStyleWorld() {
        console.log('Generating organic procedural world...');
        
        // Generate world organically starting from one room
        this.generateOrganicWorld();
        this.generateWalls();
    }
    
    generateOrganicWorld() {
        console.log('Starting generateOrganicWorld...');
        this.rooms = [];
        this.corridors = [];
        
        console.log('Arrays initialized, starting room creation...');
        
        // Start with one big room and build from there
        try {
            this.createStartingRoom();
        } catch (error) {
            console.error('Error in createStartingRoom:', error);
        }
        
        console.log(`After createStartingRoom: ${this.rooms.length} rooms`);
        
        this.addTopHallway();
        this.addTopRoom();
        
        console.log(`Generated ${this.rooms.length} rooms and ${this.corridors.length} corridors`);
    }
    
    createStartingRoom() {
        console.log('Creating starting room...');
        
        // Create a medium starting room in the center
        const roomWidth = 400;  // Reduced from 800 back to 400
        const roomHeight = 300; // Reduced from 600 back to 300
        const startX = this.width / 2 - roomWidth / 2;
        const startY = this.height / 2;
        
        const startingRoom = {
            x: startX,
            y: startY,
            width: roomWidth,
            height: roomHeight,
            center: {
                x: startX + roomWidth / 2,
                y: startY + roomHeight / 2
            },
            id: 1,
            hasTopDoor: true,
            hasBottomDoor: false,
            hasLeftDoor: false,
            hasRightDoor: false
        };
        
        this.rooms.push(startingRoom);
        console.log(`Created starting room at (${startingRoom.x}, ${startingRoom.y})`);
        console.log(`Rooms array length: ${this.rooms.length}`);
        console.log(`First room:`, this.rooms[0]);
    }
    
    addTopHallway() {
        console.log('Adding top hallway...');
        console.log(`Rooms available: ${this.rooms.length}`);
        
        if (this.rooms.length === 0) {
            console.error('No rooms available to add hallway to!');
            return;
        }
        
        // Add a hallway extending from the top of the starting room
        const room = this.rooms[0];
        console.log('Using room:', room);
        const hallwayWidth = 240;  // Was 120, now 2x wider
        const hallwayLength = 600; // Was 300, now 2x longer
        const wallThickness = 8;
        
        // Position hallway at the top center of the room, with proper wall alignment
        // The hallway should end exactly where the room's top wall begins
        const hallway = {
            x: room.center.x - hallwayWidth / 2,
            y: room.y - hallwayLength - wallThickness,  // Account for wall thickness to prevent overlap
            width: hallwayWidth,
            height: hallwayLength,
            type: 'vertical',
            connectsTo: 'room1_top',
            hasBottomDoor: true  // Add door at bottom to connect to room
        };
        
        this.corridors.push(hallway);
        console.log(`Added hallway extending from top of starting room`);
    }
    
    addTopRoom() {
        console.log('Adding top room...');
        
        if (this.corridors.length === 0) {
            console.error('No corridors available to add top room to!');
            return;
        }
        
        // Get the hallway we just created
        const hallway = this.corridors[0];
        const roomWidth = 600;  // Larger room (was 400)
        const roomHeight = 450; // Larger room (was 300)
        const wallThickness = 8;
        
        // Position room at the top of the hallway
        const topRoom = {
            x: hallway.x + (hallway.width / 2) - (roomWidth / 2), // Center on hallway
            y: hallway.y - roomHeight - wallThickness, // Above the hallway
            width: roomWidth,
            height: roomHeight,
            center: {
                x: hallway.x + (hallway.width / 2),
                y: hallway.y - roomHeight / 2 - wallThickness
            },
            id: 2,
            hasTopDoor: false,
            hasBottomDoor: true, // Door to connect to hallway
            hasLeftDoor: false,
            hasRightDoor: false
        };
        
        // Also update the hallway to have a top door
        hallway.hasTopDoor = true;
        
        this.rooms.push(topRoom);
        console.log(`Added top room at (${topRoom.x}, ${topRoom.y})`);
    }
    
    generateWalls() {
        this.walls = [];
        
        // Add walls around all rooms
        for (let room of this.rooms) {
            this.addRoomWalls(room);
        }
        
        // Add walls around all corridors
        for (let corridor of this.corridors) {
            this.addCorridorWalls(corridor);
        }
        
        console.log(`Generated ${this.walls.length} walls for ${this.rooms.length} rooms and ${this.corridors.length} corridors`);
    }
    
    addRoomWalls(room) {
        const wallThickness = 8;
        
        // Check if room has doors that should create openings in walls
        const doorwayWidth = 120;  // Reduced from 180 to 120
        
        // Top wall
        if (room.hasTopDoor) {
            // Create opening for top door
            const doorCenterX = room.x + room.width / 2;
            const doorLeft = doorCenterX - doorwayWidth / 2;
            const doorRight = doorCenterX + doorwayWidth / 2;
            
            // Left part of top wall
            if (doorLeft > room.x) {
                this.walls.push({
                    x: room.x - wallThickness,
                    y: room.y - wallThickness,
                    width: doorLeft - room.x + wallThickness,
                    height: wallThickness
                });
            }
            
            // Right part of top wall  
            if (doorRight < room.x + room.width) {
                this.walls.push({
                    x: doorRight,
                    y: room.y - wallThickness,
                    width: (room.x + room.width) - doorRight + wallThickness,
                    height: wallThickness
                });
            }
        } else {
            // Solid top wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Bottom wall
        if (room.hasBottomDoor) {
            // Create opening for bottom door
            const doorCenterX = room.x + room.width / 2;
            const doorLeft = doorCenterX - doorwayWidth / 2;
            const doorRight = doorCenterX + doorwayWidth / 2;
            
            // Left part of bottom wall
            if (doorLeft > room.x) {
                this.walls.push({
                    x: room.x - wallThickness,
                    y: room.y + room.height,
                    width: doorLeft - room.x + wallThickness,
                    height: wallThickness
                });
            }
            
            // Right part of bottom wall
            if (doorRight < room.x + room.width) {
                this.walls.push({
                    x: doorRight,
                    y: room.y + room.height,
                    width: (room.x + room.width) - doorRight + wallThickness,
                    height: wallThickness
                });
            }
        } else {
            // Solid bottom wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Left wall (solid for now)
        this.walls.push({
            x: room.x - wallThickness,
            y: room.y - wallThickness,
            width: wallThickness,
            height: room.height + wallThickness * 2
        });
        
        // Right wall (solid for now)
        this.walls.push({
            x: room.x + room.width,
            y: room.y - wallThickness,
            width: wallThickness,
            height: room.height + wallThickness * 2
        });
    }
    
    addCorridorWalls(corridor) {
        const wallThickness = 8;
        const doorwayWidth = 120;  // Reduced from 180 to 120
        
        // Handle corridors with segments
        if (corridor.segments) {
            for (let segment of corridor.segments) {
                this.addCorridorWallsForSegment(segment);
            }
        } else {
            // Handle simple corridor (single segment)
            this.addCorridorWallsForSegment(corridor);
        }
    }
    
    addCorridorWallsForSegment(segment) {
        const wallThickness = 8;
        const doorwayWidth = 180;
        
        // For vertical hallways
        if (segment.type === 'vertical' || segment.height > segment.width) {
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
            
            // Top wall with door opening if needed
            if (segment.hasTopDoor) {
                const doorCenterX = segment.x + segment.width / 2;
                const doorLeft = doorCenterX - doorwayWidth / 2;
                const doorRight = doorCenterX + doorwayWidth / 2;
                
                // Left part of top wall
                if (doorLeft > segment.x) {
                    this.walls.push({
                        x: segment.x - wallThickness,
                        y: segment.y - wallThickness,
                        width: doorLeft - segment.x + wallThickness,
                        height: wallThickness
                    });
                }
                
                // Right part of top wall
                if (doorRight < segment.x + segment.width) {
                    this.walls.push({
                        x: doorRight,
                        y: segment.y - wallThickness,
                        width: (segment.x + segment.width) - doorRight + wallThickness,
                        height: wallThickness
                    });
                }
            } else {
                // Solid top wall
                this.walls.push({
                    x: segment.x - wallThickness,
                    y: segment.y - wallThickness,
                    width: segment.width + wallThickness * 2,
                    height: wallThickness
                });
            }
            
            // Bottom wall with door opening
            if (segment.hasBottomDoor) {
                const doorCenterX = segment.x + segment.width / 2;
                const doorLeft = doorCenterX - doorwayWidth / 2;
                const doorRight = doorCenterX + doorwayWidth / 2;
                
                // Left part of bottom wall
                if (doorLeft > segment.x) {
                    this.walls.push({
                        x: segment.x - wallThickness,
                        y: segment.y + segment.height,
                        width: doorLeft - segment.x + wallThickness,
                        height: wallThickness
                    });
                }
                
                // Right part of bottom wall
                if (doorRight < segment.x + segment.width) {
                    this.walls.push({
                        x: doorRight,
                        y: segment.y + segment.height,
                        width: (segment.x + segment.width) - doorRight + wallThickness,
                        height: wallThickness
                    });
                }
            } else {
                // Solid bottom wall
                this.walls.push({
                    x: segment.x - wallThickness,
                    y: segment.y + segment.height,
                    width: segment.width + wallThickness * 2,
                    height: wallThickness
                });
            }
        } else {
            // Horizontal hallways would go here (not currently used)
            // Add standard walls around horizontal segments
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: segment.width + wallThickness * 2,
                height: wallThickness
            });
            
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y + segment.height,
                width: segment.width + wallThickness * 2,
                height: wallThickness
            });
            
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: segment.height + wallThickness * 2
            });
            
            this.walls.push({
                x: segment.x + segment.width,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: segment.height + wallThickness * 2
            });
        }
    }
    
    isWalkable(x, y, width = 1, height = 1) {
        // Check if the given rectangular area is walkable (not blocked by walls)
        const testRect = {
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height
        };
        
        for (let wall of this.walls) {
            if (this.rectangleIntersects(testRect, wall)) {
                return false;
            }
        }
        
        return true;
    }
    
    rectangleIntersects(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && 
               a.y < b.y + b.height && a.y + a.height > b.y;
    }
    
    getRandomSpawnPoint() {
        // Always spawn player in the starting room (rooms[0])
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            // Always use the starting room (first room)
            if (this.rooms.length > 0) {
                const room = this.rooms[0];  // Always use starting room
                const x = room.x + 50 + Math.random() * (room.width - 100);
                const y = room.y + 50 + Math.random() * (room.height - 100);
                
                if (this.isWalkable(x, y, 32, 32)) {
                    return { x, y };
                }
            }
            attempts++;
        }
        
        // Fallback to center of starting room if available
        if (this.rooms.length > 0) {
            const room = this.rooms[0];
            return { x: room.x + room.width / 2, y: room.y + room.height / 2 };
        }
        
        // Final fallback to center of world
        return { x: this.width / 2, y: this.height / 2 };
    }
    
    render(ctx) {
        // Render rooms
        ctx.fillStyle = '#333';
        for (let room of this.rooms) {
            ctx.fillRect(room.x, room.y, room.width, room.height);
        }
        
        // Render corridors
        for (let corridor of this.corridors) {
            if (corridor.segments) {
                for (let segment of corridor.segments) {
                    ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
                }
            } else {
                ctx.fillRect(corridor.x, corridor.y, corridor.width, corridor.height);
            }
        }
        
        // Render walls
        ctx.fillStyle = '#666';
        for (let wall of this.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    }
}