class World {
    constructor(width, height, roomSprites = [], hallwaySprites = []) {
        this.width = width;
        this.height = height;
        this.rooms = [];
        this.corridors = [];
        this.walls = [];
        this.tiles = [];
        this.doorways = [];
        this.roomSprites = roomSprites || [];
        this.hallwaySprites = hallwaySprites || [];
        
        // Generation parameters - always try to create multiple rooms
        this.roomCount = this.roomSprites.length > 0 ? 6 : 8;
        this.minRoomSize = 60;
        this.maxRoomSize = 120;
        this.corridorWidth = 120;
        this.roomScale = 1; // Scale factor for room sprites - reduced from 4x to 1x
        
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
        this.hallwaySegments = [];
        
        console.log('Arrays initialized, starting room creation...');
        
        // Start with one big room and build from there
        try {
            this.createStartingRoom();
        } catch (error) {
            console.error('Error in createStartingRoom:', error);
        }
        
        console.log(`After createStartingRoom: ${this.rooms.length} rooms`);
        
        this.addTopHallway();
        
        console.log(`Generated ${this.rooms.length} rooms and ${this.corridors.length} corridors`);
    }
    
    createStartingRoom() {
        console.log('Creating starting room...');
        
        // Create a large starting room in the center (4x bigger)
        const roomWidth = 400;  // Was 200, now 2x wider
        const roomHeight = 300; // Was 150, now 2x taller (4x area total)
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
        const hallwayWidth = 120;  // Was 60, now 2x wider
        const hallwayLength = 300; // Was 150, now 2x longer
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
    
    getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    createSimpleCorridor(roomA, roomB) {
        const corridorWidth = 40;
        const gap = 5; // Small gap between room and corridor
        
        // Create L-shaped corridor that doesn't overlap rooms
        // Go horizontally from roomA, then vertically to roomB
        
        let hallway1, hallway2;
        let doorway1, doorway2;
        
        if (roomA.center.x < roomB.center.x) {
            // Room A is left of Room B - exit right from A
            const exitX = roomA.x + roomA.width;
            const exitY = roomA.center.y;
            const targetX = roomB.x - gap;
            
            // Horizontal corridor from A to B's X position
            hallway1 = {
                type: 'straight',
                direction: 'horizontal',
                x: exitX + gap,
                y: exitY - corridorWidth / 2,
                width: targetX - exitX - gap * 2,
                height: corridorWidth
            };
            
            // Store doorway for room A (right side)
            doorway1 = { room: roomA, side: 'right', x: exitX, y: exitY };
            
        } else {
            // Room A is right of Room B - exit left from A
            const exitX = roomA.x;
            const exitY = roomA.center.y;
            const targetX = roomB.x + roomB.width + gap;
            
            // Horizontal corridor from A to B's X position
            hallway1 = {
                type: 'straight',
                direction: 'horizontal',
                x: targetX,
                y: exitY - corridorWidth / 2,
                width: exitX - targetX - gap,
                height: corridorWidth
            };
            
            // Store doorway for room A (left side)
            doorway1 = { room: roomA, side: 'left', x: exitX, y: exitY };
        }
        
        // Vertical corridor to connect to room B
        if (roomA.center.y < roomB.center.y) {
            // Room A is above Room B - enter from top of B
            const entryX = roomB.center.x;
            const entryY = roomB.y;
            
            hallway2 = {
                type: 'straight',
                direction: 'vertical',
                x: entryX - corridorWidth / 2,
                y: hallway1.y,
                width: corridorWidth,
                height: entryY - hallway1.y - gap
            };
            
            // Store doorway for room B (top side)
            doorway2 = { room: roomB, side: 'top', x: entryX, y: entryY };
            
        } else {
            // Room A is below Room B - enter from bottom of B
            const entryX = roomB.center.x;
            const entryY = roomB.y + roomB.height;
            
            hallway2 = {
                type: 'straight',
                direction: 'vertical',
                x: entryX - corridorWidth / 2,
                y: entryY + gap,
                width: corridorWidth,
                height: hallway1.y - entryY - gap
            };
            
            // Store doorway for room B (bottom side)
            doorway2 = { room: roomB, side: 'bottom', x: entryX, y: entryY };
        }
        
        // Add hallways if they have positive dimensions
        if (hallway1.width > 0) {
            this.hallwaySegments.push(hallway1);
            this.corridors.push({ segments: [hallway1] });
        }
        
        if (hallway2.height > 0) {
            this.hallwaySegments.push(hallway2);
            this.corridors.push({ segments: [hallway2] });
        }
        
        // Store doorway information
        this.doorways.push(doorway1, doorway2);
    }
    
    
    addRandomElement() {
        // Pick a random existing element to connect from
        if (this.connections.length === 0) {
            console.log('❌ No connections available');
            return;
        }
        
        console.log(`Available connections: ${this.connections.length}`);
        const fromConnection = this.connections[Math.floor(Math.random() * this.connections.length)];
        console.log(`Selected connection from ${fromConnection.type}`);
        
        // Pick a random connection point on that element
        const connectionPoints = fromConnection.connectionPoints.filter(cp => !cp.used);
        console.log(`Available connection points: ${connectionPoints.length}/${fromConnection.connectionPoints.length}`);
        
        if (connectionPoints.length === 0) {
            console.log('❌ No unused connection points');
            return;
        }
        
        const fromPoint = connectionPoints[Math.floor(Math.random() * connectionPoints.length)];
        fromPoint.used = true;
        console.log(`Using connection point at (${Math.round(fromPoint.x)}, ${Math.round(fromPoint.y)}) direction: ${fromPoint.direction}`);
        
        // Decide what to add (60% room, 40% hallway)
        const addRoom = Math.random() < 0.6;
        console.log(`Adding: ${addRoom ? 'room' : 'hallway'}`);
        
        if (addRoom) {
            this.addRoomFromPoint(fromPoint, fromConnection);
        } else {
            this.addHallwayFromPoint(fromPoint, fromConnection);
        }
    }
    
    addRoomFromPoint(fromPoint, fromConnection) {
        const roomWidth = 80 + Math.random() * 40; // 80-120 (smaller)
        const roomHeight = 60 + Math.random() * 30; // 60-90 (smaller)
        const hallwayLength = 80; // Fixed length
        const hallwayWidth = 50; // Fixed width
        
        // Calculate room position based on connection direction (simpler calculations)
        let roomX, roomY, hallwayX, hallwayY, hallwayW, hallwayH;
        
        switch (fromPoint.direction) {
            case 'north':
                hallwayX = fromPoint.x - hallwayWidth / 2;
                hallwayY = fromPoint.y - hallwayLength;
                hallwayW = hallwayWidth;
                hallwayH = hallwayLength;
                roomX = hallwayX + (hallwayWidth - roomWidth) / 2;
                roomY = hallwayY - roomHeight - 10;
                break;
            case 'south':
                hallwayX = fromPoint.x - hallwayWidth / 2;
                hallwayY = fromPoint.y;
                hallwayW = hallwayWidth;
                hallwayH = hallwayLength;
                roomX = hallwayX + (hallwayWidth - roomWidth) / 2;
                roomY = hallwayY + hallwayLength + 10;
                break;
            case 'east':
                hallwayX = fromPoint.x;
                hallwayY = fromPoint.y - hallwayWidth / 2;
                hallwayW = hallwayLength;
                hallwayH = hallwayWidth;
                roomX = hallwayX + hallwayLength + 10;
                roomY = hallwayY + (hallwayWidth - roomHeight) / 2;
                break;
            case 'west':
                hallwayX = fromPoint.x - hallwayLength;
                hallwayY = fromPoint.y - hallwayWidth / 2;
                hallwayW = hallwayLength;
                hallwayH = hallwayWidth;
                roomX = hallwayX - roomWidth - 10;
                roomY = hallwayY + (hallwayWidth - roomHeight) / 2;
                break;
        }
        
        console.log(`Calculated positions: room(${Math.round(roomX)}, ${Math.round(roomY)}, ${Math.round(roomWidth)}x${Math.round(roomHeight)}), hallway(${Math.round(hallwayX)}, ${Math.round(hallwayY)}, ${Math.round(hallwayW)}x${Math.round(hallwayH)})`);
        
        // Check if placement is valid (within bounds and no overlap)
        const roomValid = this.isValidPlacement(roomX, roomY, roomWidth, roomHeight);
        const hallwayValid = this.isValidPlacement(hallwayX, hallwayY, hallwayW, hallwayH);
        console.log(`Placement validity: room=${roomValid}, hallway=${hallwayValid}`);
        
        if (!roomValid || !hallwayValid) {
            console.log('❌ Placement failed - invalid position');
            return;
        }
        
        // Create the connecting hallway
        const hallway = {
            type: 'straight',
            direction: (fromPoint.direction === 'north' || fromPoint.direction === 'south') ? 'vertical' : 'horizontal',
            x: hallwayX,
            y: hallwayY,
            width: hallwayW,
            height: hallwayH
        };
        
        // Create the new room
        const room = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            center: {
                x: roomX + roomWidth / 2,
                y: roomY + roomHeight / 2
            },
            id: this.rooms.length + 1
        };
        
        this.rooms.push(room);
        this.hallwaySegments.push(hallway);
        this.corridors.push({ segments: [hallway] });
        
        // Add connection points for the new room
        const roomConnections = this.getRoomConnectionPoints(room).filter(cp => {
            // Don't add connection point where hallway connects
            const distance = Math.sqrt(Math.pow(cp.x - fromPoint.x, 2) + Math.pow(cp.y - fromPoint.y, 2));
            return distance > 30;
        });
        
        this.connections.push({ element: room, type: 'room', connectionPoints: roomConnections });
        
        console.log(`Added room ${room.id} via ${fromPoint.direction} hallway`);
    }
    
    addHallwayFromPoint(fromPoint, fromConnection) {
        const hallwayLength = 80 + Math.random() * 60; // 80-140
        const hallwayWidth = 50 + Math.random() * 20; // 50-70
        
        let hallwayX, hallwayY, hallwayW, hallwayH, hallwayDir;
        
        switch (fromPoint.direction) {
            case 'north':
                hallwayX = fromPoint.x - hallwayWidth / 2;
                hallwayY = fromPoint.y - hallwayLength;
                hallwayW = hallwayWidth;
                hallwayH = hallwayLength;
                hallwayDir = 'vertical';
                break;
            case 'south':
                hallwayX = fromPoint.x - hallwayWidth / 2;
                hallwayY = fromPoint.y;
                hallwayW = hallwayWidth;
                hallwayH = hallwayLength;
                hallwayDir = 'vertical';
                break;
            case 'east':
                hallwayX = fromPoint.x;
                hallwayY = fromPoint.y - hallwayWidth / 2;
                hallwayW = hallwayLength;
                hallwayH = hallwayWidth;
                hallwayDir = 'horizontal';
                break;
            case 'west':
                hallwayX = fromPoint.x - hallwayLength;
                hallwayY = fromPoint.y - hallwayWidth / 2;
                hallwayW = hallwayLength;
                hallwayH = hallwayWidth;
                hallwayDir = 'horizontal';
                break;
        }
        
        if (!this.isValidPlacement(hallwayX, hallwayY, hallwayW, hallwayH)) {
            return;
        }
        
        // Randomly choose hallway type
        const hallwayTypes = ['straight', 'corner', 'T'];
        const hallwayType = hallwayTypes[Math.floor(Math.random() * hallwayTypes.length)];
        
        const hallway = {
            type: hallwayType,
            direction: hallwayDir,
            x: hallwayX,
            y: hallwayY,
            width: hallwayW,
            height: hallwayH,
            rotation: Math.random() < 0.5 ? 0 : 90
        };
        
        this.hallwaySegments.push(hallway);
        this.corridors.push({ segments: [hallway] });
        
        // Add connection points for the new hallway
        const hallwayConnections = this.getHallwayConnectionPoints(hallway).filter(cp => {
            const distance = Math.sqrt(Math.pow(cp.x - fromPoint.x, 2) + Math.pow(cp.y - fromPoint.y, 2));
            return distance > 30;
        });
        
        this.connections.push({ element: hallway, type: 'hallway', connectionPoints: hallwayConnections });
        
        console.log(`Added ${hallwayType} hallway via ${fromPoint.direction} direction`);
    }
    
    getRoomConnectionPoints(room) {
        const points = [];
        const margin = 30;
        
        // North
        points.push({ x: room.center.x, y: room.y, direction: 'north' });
        // South  
        points.push({ x: room.center.x, y: room.y + room.height, direction: 'south' });
        // East
        points.push({ x: room.x + room.width, y: room.center.y, direction: 'east' });
        // West
        points.push({ x: room.x, y: room.center.y, direction: 'west' });
        
        return points.filter(p => p.x > margin && p.x < this.width - margin && 
                                p.y > margin && p.y < this.height - margin);
    }
    
    getHallwayConnectionPoints(hallway) {
        const points = [];
        const margin = 30;
        
        if (hallway.type === 'straight') {
            if (hallway.direction === 'horizontal') {
                points.push({ x: hallway.x, y: hallway.y + hallway.height / 2, direction: 'west' });
                points.push({ x: hallway.x + hallway.width, y: hallway.y + hallway.height / 2, direction: 'east' });
            } else {
                points.push({ x: hallway.x + hallway.width / 2, y: hallway.y, direction: 'north' });
                points.push({ x: hallway.x + hallway.width / 2, y: hallway.y + hallway.height, direction: 'south' });
            }
        } else if (hallway.type === 'corner' || hallway.type === 'T') {
            // Add connection points for all directions
            points.push({ x: hallway.x + hallway.width / 2, y: hallway.y, direction: 'north' });
            points.push({ x: hallway.x + hallway.width / 2, y: hallway.y + hallway.height, direction: 'south' });
            points.push({ x: hallway.x + hallway.width, y: hallway.y + hallway.height / 2, direction: 'east' });
            points.push({ x: hallway.x, y: hallway.y + hallway.height / 2, direction: 'west' });
        }
        
        return points.filter(p => p.x > margin && p.x < this.width - margin && 
                                p.y > margin && p.y < this.height - margin);
    }
    
    isValidPlacement(x, y, width, height) {
        const margin = 50;
        
        // Check world bounds
        if (x < margin || y < margin || 
            x + width > this.width - margin || 
            y + height > this.height - margin) {
            return false;
        }
        
        const newRect = { x, y, width, height };
        
        // Check overlap with existing rooms
        for (let room of this.rooms) {
            if (this.rectangleIntersects(newRect, room)) {
                return false;
            }
        }
        
        // Check overlap with existing hallways
        for (let hallway of this.hallwaySegments) {
            if (this.rectangleIntersects(newRect, hallway)) {
                return false;
            }
        }
        
        return true;
    }
    
    generateDoomRooms() {
        this.rooms = [];
        
        // Create rooms in a grid pattern like Doom maps
        const roomsPerRow = 4;
        const roomsPerCol = 3;
        const roomWidth = 250;
        const roomHeight = 180;
        const corridorSpace = 80;
        
        const totalWidth = roomsPerRow * roomWidth + (roomsPerRow - 1) * corridorSpace;
        const totalHeight = roomsPerCol * roomHeight + (roomsPerCol - 1) * corridorSpace;
        
        const startX = (this.width - totalWidth) / 2;
        const startY = (this.height - totalHeight) / 2;
        
        for (let row = 0; row < roomsPerCol; row++) {
            for (let col = 0; col < roomsPerRow; col++) {
                const x = startX + col * (roomWidth + corridorSpace);
                const y = startY + row * (roomHeight + corridorSpace);
                
                const room = {
                    x: x,
                    y: y,
                    width: roomWidth,
                    height: roomHeight,
                    center: {
                        x: x + roomWidth / 2,
                        y: y + roomHeight / 2
                    },
                    row: row,
                    col: col,
                    id: this.rooms.length + 1
                };
                
                this.rooms.push(room);
                console.log(`Created room ${room.id} at (${Math.round(x)}, ${Math.round(y)})`);
            }
        }
        
        console.log(`Generated ${this.rooms.length} rooms in ${roomsPerCol}x${roomsPerRow} grid`);
    }
    
    generateDoomCorridors() {
        this.corridors = [];
        this.hallwaySegments = [];
        
        // First, create a grid of intersection points between rooms
        this.createHallwayGrid();
        
        console.log(`Generated ${this.corridors.length} corridors and ${this.hallwaySegments.length} hallway segments`);
    }
    
    createHallwayGrid() {
        const roomsPerRow = 4;
        const roomsPerCol = 3;
        const roomWidth = 250;
        const roomHeight = 180;
        const corridorSpace = 80;
        
        // Calculate intersection points between rooms
        for (let row = 0; row < roomsPerCol; row++) {
            for (let col = 0; col < roomsPerRow; col++) {
                const room = this.rooms.find(r => r.row === row && r.col === col);
                if (!room) continue;
                
                // Check connections in all 4 directions
                const hasNorth = row > 0 && this.rooms.find(r => r.row === row - 1 && r.col === col);
                const hasEast = col < roomsPerRow - 1 && this.rooms.find(r => r.row === row && r.col === col + 1);
                const hasSouth = row < roomsPerCol - 1 && this.rooms.find(r => r.row === row + 1 && r.col === col);
                const hasWest = col > 0 && this.rooms.find(r => r.row === row && r.col === col - 1);
                
                // Create hallway segments based on connections
                if (hasEast) {
                    this.createHorizontalHallway(room, this.rooms.find(r => r.row === row && r.col === col + 1));
                }
                
                if (hasSouth) {
                    this.createVerticalHallway(room, this.rooms.find(r => r.row === row + 1 && r.col === col));
                }
                
                // Create intersection hallways at corners
                this.createIntersectionHallway(row, col, hasNorth, hasEast, hasSouth, hasWest);
            }
        }
    }
    
    createHorizontalHallway(roomA, roomB) {
        const corridorWidth = 60;
        const wallThickness = 8;
        const gap = 5;
        
        const hallway = {
            type: 'straight',
            direction: 'horizontal',
            x: roomA.x + roomA.width + wallThickness + gap,
            y: roomA.y + (roomA.height - corridorWidth) / 2,
            width: roomB.x - (roomA.x + roomA.width) - (wallThickness * 2) - (gap * 2),
            height: corridorWidth
        };
        
        this.corridors.push({
            direction: 'horizontal',
            segments: [hallway]
        });
        this.hallwaySegments.push(hallway);
    }
    
    createVerticalHallway(roomA, roomB) {
        const corridorWidth = 60;
        const wallThickness = 8;
        const gap = 5;
        
        const hallway = {
            type: 'straight',
            direction: 'vertical',
            x: roomA.x + (roomA.width - corridorWidth) / 2,
            y: roomA.y + roomA.height + wallThickness + gap,
            width: corridorWidth,
            height: roomB.y - (roomA.y + roomA.height) - (wallThickness * 2) - (gap * 2)
        };
        
        this.corridors.push({
            direction: 'vertical',
            segments: [hallway]
        });
        this.hallwaySegments.push(hallway);
    }
    
    createIntersectionHallway(row, col, hasNorth, hasEast, hasSouth, hasWest) {
        const connectionCount = [hasNorth, hasEast, hasSouth, hasWest].filter(Boolean).length;
        
        if (connectionCount < 2) return; // No intersection needed
        
        const room = this.rooms.find(r => r.row === row && r.col === col);
        if (!room) return;
        
        const hallwaySize = 60;
        let hallwayType, rotation = 0;
        
        // Determine hallway type based on connections
        if (connectionCount === 2) {
            // Corner or straight
            if ((hasNorth && hasSouth) || (hasEast && hasWest)) {
                hallwayType = 'straight';
                rotation = hasNorth && hasSouth ? 90 : 0; // Vertical or horizontal
            } else {
                hallwayType = 'corner';
                // Determine corner rotation
                if (hasNorth && hasEast) rotation = 0;    // ┌
                else if (hasEast && hasSouth) rotation = 90;   // ┐
                else if (hasSouth && hasWest) rotation = 180;  // ┘
                else if (hasWest && hasNorth) rotation = 270;  // └
            }
        } else if (connectionCount === 3) {
            hallwayType = 'T';
            // Determine T rotation
            if (!hasNorth) rotation = 180; // T pointing up
            else if (!hasEast) rotation = 270; // T pointing right
            else if (!hasSouth) rotation = 0;   // T pointing down
            else if (!hasWest) rotation = 90;   // T pointing left
        } else if (connectionCount === 4) {
            hallwayType = 'cross';
            rotation = 0;
        }
        
        const intersectionX = room.x + room.width / 2;
        const intersectionY = room.y + room.height / 2;
        
        const intersection = {
            type: hallwayType,
            direction: 'intersection',
            x: intersectionX - hallwaySize / 2,
            y: intersectionY - hallwaySize / 2,
            width: hallwaySize,
            height: hallwaySize,
            rotation: rotation,
            connections: { hasNorth, hasEast, hasSouth, hasWest }
        };
        
        this.hallwaySegments.push(intersection);
    }
    
    createSimpleCorridor(roomA, roomB, direction) {
        const corridorWidth = 80;
        const wallThickness = 8;
        const gap = 5; // Small gap between room and corridor
        
        if (direction === 'horizontal') {
            // Horizontal corridor between rooms - no overlap
            const corridor = {
                direction: 'horizontal',
                segments: [{
                    x: roomA.x + roomA.width + wallThickness + gap,
                    y: roomA.y + (roomA.height - corridorWidth) / 2,
                    width: roomB.x - (roomA.x + roomA.width) - (wallThickness * 2) - (gap * 2),
                    height: corridorWidth
                }]
            };
            this.corridors.push(corridor);
        } else {
            // Vertical corridor between rooms - no overlap
            const corridor = {
                direction: 'vertical',
                segments: [{
                    x: roomA.x + (roomA.width - corridorWidth) / 2,
                    y: roomA.y + roomA.height + wallThickness + gap,
                    width: corridorWidth,
                    height: roomB.y - (roomA.y + roomA.height) - (wallThickness * 2) - (gap * 2)
                }]
            };
            this.corridors.push(corridor);
        }
    }
    
    addCorridorWallsWithDoorways(segment, direction) {
        const wallThickness = 8;
        const doorwayWidth = 60;
        
        if (direction === 'horizontal') {
            // Horizontal corridor - needs doorways on left and right ends
            // Top wall (solid)
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: segment.width + wallThickness * 2,
                height: wallThickness
            });
            
            // Bottom wall (solid)
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y + segment.height,
                width: segment.width + wallThickness * 2,
                height: wallThickness
            });
            
            // Left wall (with doorway opening)
            const leftWallHeight = segment.height + wallThickness * 2;
            const doorwayStart = (leftWallHeight - doorwayWidth) / 2;
            
            // Top part of left wall
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: doorwayStart
            });
            
            // Bottom part of left wall
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness + doorwayStart + doorwayWidth,
                width: wallThickness,
                height: leftWallHeight - doorwayStart - doorwayWidth
            });
            
            // Right wall (with doorway opening)
            // Top part of right wall
            this.walls.push({
                x: segment.x + segment.width,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: doorwayStart
            });
            
            // Bottom part of right wall
            this.walls.push({
                x: segment.x + segment.width,
                y: segment.y - wallThickness + doorwayStart + doorwayWidth,
                width: wallThickness,
                height: leftWallHeight - doorwayStart - doorwayWidth
            });
            
        } else {
            // Vertical corridor - needs doorways on top and bottom ends
            // Left wall (solid)
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: segment.height + wallThickness * 2
            });
            
            // Right wall (solid)
            this.walls.push({
                x: segment.x + segment.width,
                y: segment.y - wallThickness,
                width: wallThickness,
                height: segment.height + wallThickness * 2
            });
            
            // Top wall (with doorway opening)
            const topWallWidth = segment.width + wallThickness * 2;
            const doorwayStart = (topWallWidth - doorwayWidth) / 2;
            
            // Left part of top wall
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y - wallThickness,
                width: doorwayStart,
                height: wallThickness
            });
            
            // Right part of top wall
            this.walls.push({
                x: segment.x - wallThickness + doorwayStart + doorwayWidth,
                y: segment.y - wallThickness,
                width: topWallWidth - doorwayStart - doorwayWidth,
                height: wallThickness
            });
            
            // Bottom wall (with doorway opening)
            // Left part of bottom wall
            this.walls.push({
                x: segment.x - wallThickness,
                y: segment.y + segment.height,
                width: doorwayStart,
                height: wallThickness
            });
            
            // Right part of bottom wall
            this.walls.push({
                x: segment.x - wallThickness + doorwayStart + doorwayWidth,
                y: segment.y + segment.height,
                width: topWallWidth - doorwayStart - doorwayWidth,
                height: wallThickness
            });
        }
    }
    
    generateRooms() {
        this.rooms = [];
        
        if (this.roomSprites.length > 0) {
            // Use sprite-based room generation
            this.generateSpriteRooms();
        } else {
            // Fallback to procedural generation
            this.generateProceduralRooms();
        }
    }
    
    generateSpriteRooms() {
        const attempts = 100;
        
        for (let attempt = 0; attempt < attempts && this.rooms.length < this.roomCount; attempt++) {
            // Cycle through available room sprites
            const spriteIndex = this.rooms.length % this.roomSprites.length;
            const roomSprite = this.roomSprites[spriteIndex];
            const room = this.createSpriteRoom(roomSprite);
            
            if (!this.doesRoomOverlap(room)) {
                this.rooms.push(room);
                console.log(`✓ Created room ${this.rooms.length} at (${Math.round(room.x)}, ${Math.round(room.y)}) with ${room.connectionPoints.length} connection points`);
                
                // Log connection point types
                const yellowCount = room.connectionPoints.filter(p => p.type === 'yellow').length;
                const redCount = room.connectionPoints.filter(p => p.type === 'red').length;
                console.log(`  - ${yellowCount} yellow, ${redCount} red connection points`);
            } else {
                console.log(`✗ Room placement attempt ${attempt + 1} failed due to overlap`);
            }
        }
        
        if (this.rooms.length < this.roomCount) {
            console.log(`⚠️  Only placed ${this.rooms.length} out of ${this.roomCount} requested rooms after ${attempts} attempts`);
        }
        
        console.log(`Generated ${this.rooms.length} total rooms from ${this.roomSprites.length} sprite(s)`);
    }
    
    generateProceduralRooms() {
        const attempts = 50;
        
        for (let i = 0; i < attempts && this.rooms.length < this.roomCount; i++) {
            const room = this.createRandomRoom();
            
            if (!this.doesRoomOverlap(room)) {
                this.rooms.push(room);
            }
        }
    }
    
    createSpriteRoom(roomSprite) {
        const width = roomSprite.width * this.roomScale;
        const height = roomSprite.height * this.roomScale;
        
        // Use larger spacing for room placement
        const margin = 200; // Increased margin
        const x = Math.random() * (this.width - width - margin * 2) + margin;
        const y = Math.random() * (this.height - height - margin * 2) + margin;
        
        console.log(`Attempting to place ${width}x${height} room at (${Math.round(x)}, ${Math.round(y)}) in world ${this.width}x${this.height}`);
        
        // Scale connection points and preserve their type
        const connectionPoints = roomSprite.connectionPoints.map(point => ({
            x: x + (point.x * this.roomScale),
            y: y + (point.y * this.roomScale),
            type: point.type
        }));
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            center: {
                x: x + width / 2,
                y: y + height / 2
            },
            sprite: roomSprite,
            connectionPoints: connectionPoints,
            walkableAreas: roomSprite.walkableAreas.map(point => ({
                x: x + (point.x * this.roomScale),
                y: y + (point.y * this.roomScale)
            }))
        };
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
        const padding = 100; // Padding between rooms for hallway placement
        
        for (let room of this.rooms) {
            const overlap = newRoom.x < room.x + room.width + padding &&
                           newRoom.x + newRoom.width + padding > room.x &&
                           newRoom.y < room.y + room.height + padding &&
                           newRoom.y + newRoom.height + padding > room.y;
            
            if (overlap) {
                console.log(`Room overlap detected: new room at (${Math.round(newRoom.x)}, ${Math.round(newRoom.y)}) overlaps with existing room at (${Math.round(room.x)}, ${Math.round(room.y)})`);
                return true;
            }
        }
        return false;
    }
    
    connectRooms() {
        this.corridors = [];
        
        if (this.rooms.length < 2) return;
        
        if (this.roomSprites.length > 0) {
            // Use connection points from sprites
            this.connectSpriteRooms();
        } else {
            // Use center-to-center connections
            this.connectProceduralRooms();
        }
    }
    
    connectSpriteRooms() {
        console.log(`Connecting ${this.rooms.length} rooms via hallway sprites...`);
        
        // Connect rooms by placing hallway sprites between them
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            
            console.log(`Connecting room ${i + 1} to room ${i + 2} via hallway`);
            this.connectRoomsViaHallway(roomA, roomB);
        }
        
        // Connect last room to first to create a loop
        if (this.rooms.length > 2) {
            const roomA = this.rooms[this.rooms.length - 1];
            const roomB = this.rooms[0];
            console.log(`Creating loop connection via hallway`);
            this.connectRoomsViaHallway(roomA, roomB);
        }
    }
    
    connectRoomsViaHallway(roomA, roomB) {
        // Find closest connection points between the two rooms
        if (roomA.connectionPoints.length === 0 || roomB.connectionPoints.length === 0) {
            console.log(`Skipping connection - missing connection points`);
            return;
        }
        
        let bestDistance = Infinity;
        let bestPointA = null;
        let bestPointB = null;
        
        for (let pointA of roomA.connectionPoints) {
            for (let pointB of roomB.connectionPoints) {
                const distance = Math.sqrt(
                    Math.pow(pointA.x - pointB.x, 2) + 
                    Math.pow(pointA.y - pointB.y, 2)
                );
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestPointA = pointA;
                    bestPointB = pointB;
                }
            }
        }
        
        if (bestPointA && bestPointB) {
            console.log(`✓ Placing hallway between points (distance: ${Math.round(bestDistance)})`);
            this.placeHallwayBetweenPoints(bestPointA, bestPointB);
        }
    }
    
    placeHallwayBetweenPoints(pointA, pointB) {
        // Find appropriate hallway sprite
        const straightHallway = this.hallwaySprites.find(h => h.roomNumber === 'straight');
        if (!straightHallway) {
            console.log(`No straight hallway sprite available`);
            return;
        }
        
        if (straightHallway.connectionPoints.length < 2) {
            console.log(`Hallway sprite needs at least 2 connection points`);
            return;
        }
        
        console.log(`Using hallway sprite with ${straightHallway.connectionPoints.length} connection points`);
        
        // Get the hallway's connection points (should have red and yellow)
        const hallwayPoints = straightHallway.connectionPoints;
        
        // Find red and yellow points in the hallway sprite
        const redPoint = hallwayPoints.find(p => p.type === 'red');
        const yellowPoint = hallwayPoints.find(p => p.type === 'yellow');
        
        if (!redPoint || !yellowPoint) {
            console.log(`Hallway needs both red and yellow connection points`);
            return;
        }
        
        // Calculate distance and angle between room connection points
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Calculate the distance between hallway connection points in the sprite
        const hallwayDx = yellowPoint.x - redPoint.x;
        const hallwayDy = yellowPoint.y - redPoint.y;
        const hallwayDistance = Math.sqrt(hallwayDx * hallwayDx + hallwayDy * hallwayDy) * this.roomScale;
        
        // Calculate scale factor to make hallway fit the distance between rooms
        const scaleToFit = distance / hallwayDistance;
        
        // Position hallway at midpoint between rooms
        const midX = (pointA.x + pointB.x) / 2;
        const midY = (pointA.y + pointB.y) / 2;
        
        // Calculate hallway center in sprite coordinates
        const hallwayCenterX = (redPoint.x + yellowPoint.x) / 2;
        const hallwayCenterY = (redPoint.y + yellowPoint.y) / 2;
        
        // Position hallway so its center aligns with midpoint
        const hallwayX = midX - (hallwayCenterX * this.roomScale * scaleToFit);
        const hallwayY = midY - (hallwayCenterY * this.roomScale * scaleToFit);
        
        // Create hallway segment
        const hallwayWidth = straightHallway.width * this.roomScale * scaleToFit;
        const hallwayHeight = straightHallway.height * this.roomScale * scaleToFit;
        
        const hallway = {
            x: hallwayX,
            y: hallwayY,
            width: hallwayWidth,
            height: hallwayHeight,
            angle: angle,
            sprite: straightHallway,
            isSprite: true,
            scaleToFit: scaleToFit
        };
        
        // Add to corridors for rendering
        this.corridors.push({
            segments: [hallway],
            isSprite: true,
            sprite: straightHallway
        });
        
        console.log(`✓ Placed hallway at (${Math.round(hallwayX)}, ${Math.round(hallwayY)}) scaled ${scaleToFit.toFixed(2)}x to fit distance ${Math.round(distance)}`);
    }
    
    connectProceduralRooms() {
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
    
    createConnectionCorridor(pointA, pointB) {
        console.log(`Creating corridor between ${pointA.type} and ${pointB.type} connection points`);
        
        // Try to use hallway sprites if available
        if (this.hallwaySprites.length > 0) {
            // Find a hallway sprite that has compatible connection points
            const straightHallway = this.hallwaySprites.find(h => h.roomNumber === 'straight');
            if (straightHallway && straightHallway.connectionPoints.length >= 2) {
                console.log(`Using straight hallway sprite with ${straightHallway.connectionPoints.length} connection points`);
                this.createSpriteHallway(pointA, pointB, straightHallway);
                return;
            }
        }
        
        console.log(`No suitable hallway sprite found, creating basic corridor`);
        // Fallback to basic corridor
        const corridor = {
            segments: [{
                x: Math.min(pointA.x, pointB.x) - this.corridorWidth / 2,
                y: Math.min(pointA.y, pointB.y) - this.corridorWidth / 2,
                width: Math.abs(pointB.x - pointA.x) + this.corridorWidth,
                height: Math.abs(pointB.y - pointA.y) + this.corridorWidth
            }]
        };
        
        this.corridors.push(corridor);
    }
    
    createSpriteHallway(pointA, pointB, hallwaySprite) {
        // Calculate distance and angle between points
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Calculate number of hallway segments needed
        const hallwayLength = hallwaySprite.width * this.roomScale;
        const segmentCount = Math.ceil(distance / hallwayLength);
        
        const corridor = {
            segments: [],
            isSprite: true,
            sprite: hallwaySprite
        };
        
        // Place hallway segments along the path
        for (let i = 0; i < segmentCount; i++) {
            const progress = i / segmentCount;
            const x = pointA.x + (dx * progress) - (hallwaySprite.width * this.roomScale) / 2;
            const y = pointA.y + (dy * progress) - (hallwaySprite.height * this.roomScale) / 2;
            
            corridor.segments.push({
                x: x,
                y: y,
                width: hallwaySprite.width * this.roomScale,
                height: hallwaySprite.height * this.roomScale,
                angle: angle,
                sprite: hallwaySprite
            });
        }
        
        this.corridors.push(corridor);
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
        
        // Generate walls for rooms with doorways where corridors connect
        for (let room of this.rooms) {
            this.addRoomWallsSimple(room);
        }
        
        // Generate walls for corridors
        for (let corridor of this.corridors) {
            if (corridor.segments) {
                // Handle corridors with segments
                for (let segment of corridor.segments) {
                    this.addCorridorWalls(segment);
                }
            } else {
                // Handle simple corridor format (like our hallway)
                this.addCorridorWalls(corridor);
            }
        }
    }
    
    addRoomWallsSimple(room) {
        const wallThickness = 8;
        const doorwayWidth = 80;  // Increased for larger rooms
        
        // Use room's door flags if they exist
        const hasTopDoor = room.hasTopDoor || false;
        const hasBottomDoor = room.hasBottomDoor || false;
        const hasLeftDoor = room.hasLeftDoor || false;
        const hasRightDoor = room.hasRightDoor || false;
        
        // Debug room processing only if DEBUG flag is set
        if (window.DEBUG) {
            console.log(`Processing room ${room.id} walls - door flags: top=${hasTopDoor}, bottom=${hasBottomDoor}, left=${hasLeftDoor}, right=${hasRightDoor}`);
        }
        
        // Top wall - with doorway if flag is set
        if (hasTopDoor) {
            // Left part
            const leftWall = {
                x: room.x,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2,
                height: wallThickness
            };
            this.walls.push(leftWall);
            
            // Right part
            const rightWall = {
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2,
                height: wallThickness
            };
            this.walls.push(rightWall);
            
            if (window.DEBUG) {
                console.log(`Added room top doorway walls: left at (${leftWall.x}, ${leftWall.y}, ${leftWall.width}x${leftWall.height}), right at (${rightWall.x}, ${rightWall.y}, ${rightWall.width}x${rightWall.height})`);
            }
        } else {
            // Solid wall
            const solidWall = {
                x: room.x,
                y: room.y - wallThickness,
                width: room.width,
                height: wallThickness
            };
            this.walls.push(solidWall);
            
            if (window.DEBUG) {
                console.log(`Added solid room top wall at (${solidWall.x}, ${solidWall.y}, ${solidWall.width}x${solidWall.height})`);
            }
        }
        
        // Bottom wall
        if (hasBottomDoor) {
            // Left part
            this.walls.push({
                x: room.x,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2,
                height: wallThickness
            });
            // Right part
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x,
                y: room.y + room.height,
                width: room.width,
                height: wallThickness
            });
        }
        
        // Left wall - extend to connect with top/bottom walls
        if (hasLeftDoor) {
            // Top part
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: wallThickness + (room.height - doorwayWidth) / 2
            });
            // Bottom part
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall - extend to connect with top/bottom walls
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
        
        // Right wall - extend to connect with top/bottom walls
        if (hasRightDoor) {
            // Top part
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: wallThickness + (room.height - doorwayWidth) / 2
            });
            // Bottom part
            this.walls.push({
                x: room.x + room.width,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall - extend to connect with top/bottom walls
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
    }
    
    addCorridorWalls(corridor) {
        const wallThickness = 8;
        const doorwayWidth = 80;  // Increased for larger corridors
        
        // Use corridor's door flags if they exist
        const hasTopDoor = corridor.hasTopDoor || false;
        const hasBottomDoor = corridor.hasBottomDoor || false;
        const hasLeftDoor = corridor.hasLeftDoor || false;
        const hasRightDoor = corridor.hasRightDoor || false;
        
        // Debug corridor processing only if DEBUG flag is set
        if (window.DEBUG) {
            console.log(`Processing corridor walls - door flags: top=${hasTopDoor}, bottom=${hasBottomDoor}, left=${hasLeftDoor}, right=${hasRightDoor}`);
        }
        
        // Top wall - with doorway if flag is set
        if (hasTopDoor) {
            // Left part
            this.walls.push({
                x: corridor.x,
                y: corridor.y - wallThickness,
                width: (corridor.width - doorwayWidth) / 2,
                height: wallThickness
            });
            // Right part
            this.walls.push({
                x: corridor.x + (corridor.width + doorwayWidth) / 2,
                y: corridor.y - wallThickness,
                width: (corridor.width - doorwayWidth) / 2,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: corridor.x,
                y: corridor.y - wallThickness,
                width: corridor.width,
                height: wallThickness
            });
        }
        
        // Bottom wall - with doorway if flag is set
        if (hasBottomDoor) {
            // Left part
            const leftWall = {
                x: corridor.x,
                y: corridor.y + corridor.height,
                width: (corridor.width - doorwayWidth) / 2,
                height: wallThickness
            };
            this.walls.push(leftWall);
            
            // Right part
            const rightWall = {
                x: corridor.x + (corridor.width + doorwayWidth) / 2,
                y: corridor.y + corridor.height,
                width: (corridor.width - doorwayWidth) / 2,
                height: wallThickness
            };
            this.walls.push(rightWall);
            
            if (window.DEBUG) {
                console.log(`Added corridor bottom doorway walls: left at (${leftWall.x}, ${leftWall.y}, ${leftWall.width}x${leftWall.height}), right at (${rightWall.x}, ${rightWall.y}, ${rightWall.width}x${rightWall.height})`);
            }
        } else {
            // Solid wall
            const solidWall = {
                x: corridor.x,
                y: corridor.y + corridor.height,
                width: corridor.width,
                height: wallThickness
            };
            this.walls.push(solidWall);
            
            if (window.DEBUG) {
                console.log(`Added solid bottom wall at (${solidWall.x}, ${solidWall.y}, ${solidWall.width}x${solidWall.height})`);
            }
        }
        
        // Only add side walls if corridor is vertical
        if (corridor.width < corridor.height) {
            // Left wall - extend to connect with top/bottom walls
            if (hasLeftDoor) {
                // Top part
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y - wallThickness,
                    width: wallThickness,
                    height: wallThickness + (corridor.height - doorwayWidth) / 2
                });
                // Bottom part
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y + (corridor.height + doorwayWidth) / 2,
                    width: wallThickness,
                    height: (corridor.height - doorwayWidth) / 2 + wallThickness
                });
            } else {
                // Solid wall - extend to connect with top/bottom walls
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y - wallThickness,
                    width: wallThickness,
                    height: corridor.height + wallThickness * 2
                });
            }
            
            // Right wall - extend to connect with top/bottom walls
            if (hasRightDoor) {
                // Top part
                this.walls.push({
                    x: corridor.x + corridor.width,
                    y: corridor.y - wallThickness,
                    width: wallThickness,
                    height: wallThickness + (corridor.height - doorwayWidth) / 2
                });
                // Bottom part
                this.walls.push({
                    x: corridor.x + corridor.width,
                    y: corridor.y + (corridor.height + doorwayWidth) / 2,
                    width: wallThickness,
                    height: (corridor.height - doorwayWidth) / 2 + wallThickness
                });
            } else {
                // Solid wall - extend to connect with top/bottom walls
                this.walls.push({
                    x: corridor.x + corridor.width,
                    y: corridor.y - wallThickness,
                    width: wallThickness,
                    height: corridor.height + wallThickness * 2
                });
            }
        }
        // Add side walls for horizontal corridors
        else if (corridor.height < corridor.width) {
            // Top wall - extend to connect with left/right walls
            if (hasTopDoor) {
                // Left part
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y - wallThickness,
                    width: wallThickness + (corridor.width - doorwayWidth) / 2,
                    height: wallThickness
                });
                // Right part
                this.walls.push({
                    x: corridor.x + (corridor.width + doorwayWidth) / 2,
                    y: corridor.y - wallThickness,
                    width: (corridor.width - doorwayWidth) / 2 + wallThickness,
                    height: wallThickness
                });
            } else {
                // Solid wall - extend to connect with left/right walls
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y - wallThickness,
                    width: corridor.width + wallThickness * 2,
                    height: wallThickness
                });
            }
            
            // Bottom wall - extend to connect with left/right walls
            if (hasBottomDoor) {
                // Left part
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y + corridor.height,
                    width: wallThickness + (corridor.width - doorwayWidth) / 2,
                    height: wallThickness
                });
                // Right part
                this.walls.push({
                    x: corridor.x + (corridor.width + doorwayWidth) / 2,
                    y: corridor.y + corridor.height,
                    width: (corridor.width - doorwayWidth) / 2 + wallThickness,
                    height: wallThickness
                });
            } else {
                // Solid wall - extend to connect with left/right walls
                this.walls.push({
                    x: corridor.x - wallThickness,
                    y: corridor.y + corridor.height,
                    width: corridor.width + wallThickness * 2,
                    height: wallThickness
                });
            }
        }
    }
    
    addRoomWallsUsingDoorways(room) {
        const wallThickness = 8;
        const doorwayWidth = 50;
        
        // Find doorways for this room
        const roomDoorways = this.doorways.filter(d => d.room === room);
        
        // Check which sides have doorways
        const hasDoorway = {
            top: roomDoorways.some(d => d.side === 'top'),
            bottom: roomDoorways.some(d => d.side === 'bottom'),
            left: roomDoorways.some(d => d.side === 'left'),
            right: roomDoorways.some(d => d.side === 'right')
        };
        
        // Top wall
        if (hasDoorway.top) {
            // Wall with doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Bottom wall
        if (hasDoorway.bottom) {
            // Wall with doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Left wall
        if (hasDoorway.left) {
            // Wall with doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
        
        // Right wall
        if (hasDoorway.right) {
            // Wall with doorway
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            this.walls.push({
                x: room.x + room.width,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
    }
    
    addRoomWallsWithAutoDoorways(room) {
        const wallThickness = 8;
        const doorwayWidth = 60;
        
        // Check which sides have hallway connections
        const connections = {
            top: false,
            bottom: false,
            left: false,
            right: false
        };
        
        // Check for hallway intersections
        for (let hallway of this.hallwaySegments) {
            const hallwayRect = {
                x: hallway.x,
                y: hallway.y,
                width: hallway.width,
                height: hallway.height
            };
            
            // Check top edge
            if (Math.abs(hallway.y + hallway.height - room.y) < 10 &&
                hallway.x < room.x + room.width && hallway.x + hallway.width > room.x) {
                connections.top = true;
            }
            
            // Check bottom edge
            if (Math.abs(hallway.y - (room.y + room.height)) < 10 &&
                hallway.x < room.x + room.width && hallway.x + hallway.width > room.x) {
                connections.bottom = true;
            }
            
            // Check left edge
            if (Math.abs(hallway.x + hallway.width - room.x) < 10 &&
                hallway.y < room.y + room.height && hallway.y + hallway.height > room.y) {
                connections.left = true;
            }
            
            // Check right edge
            if (Math.abs(hallway.x - (room.x + room.width)) < 10 &&
                hallway.y < room.y + room.height && hallway.y + hallway.height > room.y) {
                connections.right = true;
            }
        }
        
        // Create walls with doorways where needed
        
        // Top wall
        if (connections.top) {
            // Split wall for doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Bottom wall
        if (connections.bottom) {
            // Split wall for doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Left wall
        if (connections.left) {
            // Split wall for doorway
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
        
        // Right wall
        if (connections.right) {
            // Split wall for doorway
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            this.walls.push({
                x: room.x + room.width,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid wall
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
    }
    
    addSimpleRoomWalls(room) {
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
    
    addSimpleHallwayWalls(hallway) {
        const wallThickness = 8;
        
        // Top wall
        this.walls.push({
            x: hallway.x - wallThickness,
            y: hallway.y - wallThickness,
            width: hallway.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Bottom wall
        this.walls.push({
            x: hallway.x - wallThickness,
            y: hallway.y + hallway.height,
            width: hallway.width + wallThickness * 2,
            height: wallThickness
        });
        
        // Left wall
        this.walls.push({
            x: hallway.x - wallThickness,
            y: hallway.y - wallThickness,
            width: wallThickness,
            height: hallway.height + wallThickness * 2
        });
        
        // Right wall
        this.walls.push({
            x: hallway.x + hallway.width,
            y: hallway.y - wallThickness,
            width: wallThickness,
            height: hallway.height + wallThickness * 2
        });
    }
    
    removeConnectionWalls() {
        // Remove walls that block connections between rooms and hallways
        this.walls = this.walls.filter(wall => {
            // Check if this wall blocks a room-hallway connection
            for (let room of this.rooms) {
                for (let hallway of this.hallwaySegments) {
                    if (this.wallBlocksConnection(wall, room, hallway)) {
                        return false; // Remove this wall
                    }
                }
            }
            
            // Check if this wall blocks a hallway-hallway connection
            for (let i = 0; i < this.hallwaySegments.length; i++) {
                for (let j = i + 1; j < this.hallwaySegments.length; j++) {
                    if (this.wallBlocksConnection(wall, this.hallwaySegments[i], this.hallwaySegments[j])) {
                        return false; // Remove this wall
                    }
                }
            }
            
            return true; // Keep this wall
        });
    }
    
    wallBlocksConnection(wall, elementA, elementB) {
        const connectionThreshold = 10; // How close elements need to be to be considered connected
        
        // Check if elements are adjacent
        const distanceX = Math.abs((elementA.x + elementA.width / 2) - (elementB.x + elementB.width / 2));
        const distanceY = Math.abs((elementA.y + elementA.height / 2) - (elementB.y + elementB.height / 2));
        const totalWidth = elementA.width / 2 + elementB.width / 2 + connectionThreshold;
        const totalHeight = elementA.height / 2 + elementB.height / 2 + connectionThreshold;
        
        if (distanceX > totalWidth || distanceY > totalHeight) {
            return false; // Not adjacent
        }
        
        // Check if wall is between the elements
        const elementACenter = { x: elementA.x + elementA.width / 2, y: elementA.y + elementA.height / 2 };
        const elementBCenter = { x: elementB.x + elementB.width / 2, y: elementB.y + elementB.height / 2 };
        
        // Simplified check: if wall overlaps with the space between elements
        const minX = Math.min(elementACenter.x, elementBCenter.x) - 20;
        const maxX = Math.max(elementACenter.x, elementBCenter.x) + 20;
        const minY = Math.min(elementACenter.y, elementBCenter.y) - 20;
        const maxY = Math.max(elementACenter.y, elementBCenter.y) + 20;
        
        return wall.x < maxX && wall.x + wall.width > minX && 
               wall.y < maxY && wall.y + wall.height > minY;
    }
    
    addRoomWallsWithDoorways(room) {
        const wallThickness = 8;
        const doorwayWidth = 60;
        
        // Check which directions have corridors
        const hasRight = this.rooms.find(r => r.row === room.row && r.col === room.col + 1);
        const hasBottom = this.rooms.find(r => r.row === room.row + 1 && r.col === room.col);
        const hasLeft = this.rooms.find(r => r.row === room.row && r.col === room.col - 1);
        const hasTop = this.rooms.find(r => r.row === room.row - 1 && r.col === room.col);
        
        // Top wall (with doorway if there's a room above)
        if (hasTop) {
            // Left part of top wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            // Right part of top wall
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y - wallThickness,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid top wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Bottom wall (with doorway if there's a room below)
        if (hasBottom) {
            // Left part of bottom wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
            // Right part of bottom wall
            this.walls.push({
                x: room.x + (room.width + doorwayWidth) / 2,
                y: room.y + room.height,
                width: (room.width - doorwayWidth) / 2 + wallThickness,
                height: wallThickness
            });
        } else {
            // Solid bottom wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + room.height,
                width: room.width + wallThickness * 2,
                height: wallThickness
            });
        }
        
        // Left wall (with doorway if there's a room to the left)
        if (hasLeft) {
            // Top part of left wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            // Bottom part of left wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid left wall
            this.walls.push({
                x: room.x - wallThickness,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
        }
        
        // Right wall (with doorway if there's a room to the right)
        if (hasRight) {
            // Top part of right wall
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
            // Bottom part of right wall
            this.walls.push({
                x: room.x + room.width,
                y: room.y + (room.height + doorwayWidth) / 2,
                width: wallThickness,
                height: (room.height - doorwayWidth) / 2 + wallThickness
            });
        } else {
            // Solid right wall
            this.walls.push({
                x: room.x + room.width,
                y: room.y - wallThickness,
                width: wallThickness,
                height: room.height + wallThickness * 2
            });
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
    
    // Removed duplicate addCorridorWalls - using the one with doorway support above
    
    isWalkable(x, y, width = 1, height = 1) {
        // Simplified: just check if we're NOT intersecting with any walls
        const rect = { x: x - width/2, y: y - width/2, width, height };
        
        // Check if intersecting with any walls
        for (let wall of this.walls) {
            if (this.rectangleIntersects(rect, wall)) {
                if (window.DEBUG && y > 900) { // Debug for bottom rooms
                    console.log(`Wall collision at (${Math.round(x)}, ${Math.round(y)}) with wall at (${Math.round(wall.x)}, ${Math.round(wall.y)}, ${wall.width}x${wall.height})`);
                }
                return false;
            }
        }
        
        // If no wall collision, check if we're in a walkable area (room or corridor)
        // Check rooms
        for (let room of this.rooms) {
            if (this.rectangleIntersects(rect, room)) {
                return true;
            }
        }
        
        // Check corridors (both old format and new simple format)
        for (let corridor of this.corridors) {
            // Check if it's a simple corridor (not segments)
            if (corridor.x !== undefined) {
                if (this.rectangleIntersects(rect, corridor)) {
                    return true;
                }
            } else if (corridor.segments) {
                // Old format with segments
                for (let segment of corridor.segments) {
                    if (this.rectangleIntersects(rect, segment)) {
                        return true;
                    }
                }
            }
        }
        
        // Check hallway segments
        for (let segment of this.hallwaySegments || []) {
            if (this.rectangleIntersects(rect, segment)) {
                return true;
            }
        }
        
        // Not in any walkable area
        if (window.DEBUG && Math.random() < 0.01) { // Occasional debug log
            console.log(`Not in walkable area at (${Math.round(x)}, ${Math.round(y)})`);
        }
        return false;
    }
    
    testWalkable(x, y, width = 1, height = 1) {
        // Debug version of isWalkable that logs everything
        const rect = { x: x - width/2, y: y - width/2, width, height };
        console.log(`Testing rect: x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, w=${width}, h=${height}`);
        
        // Check walls
        for (let i = 0; i < this.walls.length; i++) {
            const wall = this.walls[i];
            if (this.rectangleIntersects(rect, wall)) {
                console.log(`❌ Wall collision with wall ${i}: (${Math.round(wall.x)}, ${Math.round(wall.y)}, ${wall.width}x${wall.height})`);
                return false;
            }
        }
        console.log(`✓ No wall collisions`);
        
        // Check rooms
        console.log(`Checking ${this.rooms.length} rooms for walkability`);
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            console.log(`Room ${i}: (${Math.round(room.x)}, ${Math.round(room.y)}, ${room.width}x${room.height})`);
            if (this.rectangleIntersects(rect, room)) {
                console.log(`✓ In room ${room.id}: (${Math.round(room.x)}, ${Math.round(room.y)}, ${room.width}x${room.height})`);
                return true;
            }
        }
        
        // Check corridors
        for (let i = 0; i < this.corridors.length; i++) {
            const corridor = this.corridors[i];
            for (let j = 0; j < corridor.segments.length; j++) {
                const segment = corridor.segments[j];
                if (this.rectangleIntersects(rect, segment)) {
                    console.log(`✓ In corridor ${i}, segment ${j}: (${Math.round(segment.x)}, ${Math.round(segment.y)}, ${segment.width}x${segment.height})`);
                    return true;
                }
            }
        }
        
        // Check hallway segments
        for (let i = 0; i < (this.hallwaySegments || []).length; i++) {
            const segment = this.hallwaySegments[i];
            if (this.rectangleIntersects(rect, segment)) {
                console.log(`✓ In hallway segment ${i} (${segment.type}): (${Math.round(segment.x)}, ${Math.round(segment.y)}, ${segment.width}x${segment.height})`);
                return true;
            }
        }
        
        console.log(`❌ Not in any walkable area`);
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
            console.log('No rooms available, spawning at center');
            return { x: this.width / 2, y: this.height / 2 };
        }
        
        // Always spawn in first room for consistency
        const room = this.rooms[0];
        const spawnX = room.x + room.width / 2;
        const spawnY = room.y + room.height / 2;
        
        console.log(`Spawning in room 1 at (${spawnX}, ${spawnY})`);
        console.log(`Room details:`, room);
        console.log(`World size: ${this.width}x${this.height}`);
        console.log(`Total rooms: ${this.rooms.length}, Total corridors: ${this.corridors.length}`);
        
        return { x: spawnX, y: spawnY };
    }
    
    render(ctx) {
        // Draw rooms with improved styling
        for (let room of this.rooms) {
            // Draw room shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(room.x + 4, room.y + 4, room.width, room.height);
            
            // Draw room floor with gradient
            const gradient = ctx.createLinearGradient(room.x, room.y, room.x, room.y + room.height);
            gradient.addColorStop(0, '#3a3a3a');
            gradient.addColorStop(1, '#2a2a2a');
            ctx.fillStyle = gradient;
            ctx.fillRect(room.x, room.y, room.width, room.height);
            
            // Draw subtle floor pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            for (let x = room.x; x < room.x + room.width; x += 20) {
                for (let y = room.y; y < room.y + room.height; y += 20) {
                    if ((x + y) % 40 === 0) {
                        ctx.fillRect(x, y, 20, 20);
                    }
                }
            }
            
            // Draw room border with glow effect
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.strokeRect(room.x, room.y, room.width, room.height);
            
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(room.x - 1, room.y - 1, room.width + 2, room.height + 2);
            
            // Draw doorway indicators
            if (room.hasTopDoor) {
                const doorX = room.x + (room.width - 50) / 2;
                ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
                ctx.fillRect(doorX, room.y - 10, 50, 10);
            }
            
            // Draw room number for debugging
            if (window.DEBUG) {
                ctx.fillStyle = '#fff';
                ctx.font = '16px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(`Room ${room.id}`, room.center.x, room.center.y);
                ctx.textAlign = 'left';
            }
        }
        
        // Draw corridors with improved styling
        for (let corridor of this.corridors) {
            // Check if it's a simple corridor or has segments
            if (corridor.x !== undefined) {
                // Simple corridor
                // Draw shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(corridor.x + 3, corridor.y + 3, corridor.width, corridor.height);
                
                // Draw corridor floor with gradient
                const gradient = ctx.createLinearGradient(corridor.x, corridor.y, corridor.x + corridor.width, corridor.y);
                gradient.addColorStop(0, '#222');
                gradient.addColorStop(0.5, '#1a1a1a');
                gradient.addColorStop(1, '#222');
                ctx.fillStyle = gradient;
                ctx.fillRect(corridor.x, corridor.y, corridor.width, corridor.height);
                
                // Draw corridor edges
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 1;
                ctx.strokeRect(corridor.x, corridor.y, corridor.width, corridor.height);
                
                // Draw doorway indicators
                if (corridor.hasBottomDoor) {
                    const doorX = corridor.x + (corridor.width - 50) / 2;
                    ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
                    ctx.fillRect(doorX, corridor.y + corridor.height, 50, 10);
                }
            } else if (corridor.segments) {
                // Old format with segments
                for (let segment of corridor.segments) {
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
                    
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(segment.x, segment.y, segment.width, segment.height);
                }
            }
        }
        
        // Draw hallway segments with different visual styles based on type
        for (let segment of this.hallwaySegments || []) {
            ctx.save();
            
            // Draw hallway floor
            ctx.fillStyle = '#252525';
            ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
            
            // Apply rotation for corner and T-junction visuals
            if (segment.rotation && segment.rotation !== 0) {
                ctx.translate(segment.x + segment.width / 2, segment.y + segment.height / 2);
                ctx.rotate((segment.rotation * Math.PI) / 180);
                ctx.translate(-segment.width / 2, -segment.height / 2);
            } else {
                ctx.translate(segment.x, segment.y);
            }
            
            // Draw type-specific visual indicators
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            
            switch (segment.type) {
                case 'straight':
                    // Draw directional lines for straight hallways
                    if (segment.direction === 'horizontal' || segment.rotation === 0 || segment.rotation === 180) {
                        ctx.beginPath();
                        ctx.moveTo(0, segment.height * 0.3);
                        ctx.lineTo(segment.width, segment.height * 0.3);
                        ctx.moveTo(0, segment.height * 0.7);
                        ctx.lineTo(segment.width, segment.height * 0.7);
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(segment.width * 0.3, 0);
                        ctx.lineTo(segment.width * 0.3, segment.height);
                        ctx.moveTo(segment.width * 0.7, 0);
                        ctx.lineTo(segment.width * 0.7, segment.height);
                        ctx.stroke();
                    }
                    break;
                    
                case 'corner':
                    // Draw corner connection lines
                    ctx.strokeStyle = '#777';
                    ctx.beginPath();
                    ctx.moveTo(segment.width / 2, 0);
                    ctx.lineTo(segment.width / 2, segment.height / 2);
                    ctx.lineTo(segment.width, segment.height / 2);
                    ctx.stroke();
                    break;
                    
                case 'T':
                    // Draw T-junction lines
                    ctx.strokeStyle = '#777';
                    ctx.beginPath();
                    // Horizontal bar
                    ctx.moveTo(0, segment.height / 2);
                    ctx.lineTo(segment.width, segment.height / 2);
                    // Vertical connection
                    ctx.moveTo(segment.width / 2, segment.height / 2);
                    ctx.lineTo(segment.width / 2, segment.height);
                    ctx.stroke();
                    break;
                    
                case 'cross':
                    // Draw cross intersection lines
                    ctx.strokeStyle = '#777';
                    ctx.beginPath();
                    // Horizontal line
                    ctx.moveTo(0, segment.height / 2);
                    ctx.lineTo(segment.width, segment.height / 2);
                    // Vertical line
                    ctx.moveTo(segment.width / 2, 0);
                    ctx.lineTo(segment.width / 2, segment.height);
                    ctx.stroke();
                    break;
            }
            
            // Draw outer border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, segment.width, segment.height);
            
            ctx.restore();
            
            // Debug info for hallway types
            if (window.DEBUG) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(`${segment.type}`, segment.x + segment.width / 2, segment.y + segment.height / 2 - 5);
                if (segment.rotation) {
                    ctx.fillText(`${segment.rotation}°`, segment.x + segment.width / 2, segment.y + segment.height / 2 + 8);
                }
                ctx.textAlign = 'left';
            }
        }
        
        // Draw walls with 3D effect
        for (let wall of this.walls) {
            // Draw wall shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(wall.x + 2, wall.y + 2, wall.width, wall.height);
            
            // Draw main wall
            const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y + wall.height);
            gradient.addColorStop(0, '#888');
            gradient.addColorStop(0.5, '#666');
            gradient.addColorStop(1, '#444');
            ctx.fillStyle = gradient;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            
            // Draw wall highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(wall.x, wall.y, wall.width, 2);
            ctx.fillRect(wall.x, wall.y, 2, wall.height);
            
            // Draw wall outline
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        }
        
        // Draw debug information
        if (window.DEBUG) {
            // Draw room outlines
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            for (let room of this.rooms) {
                ctx.strokeRect(room.x, room.y, room.width, room.height);
                
                // Show door flags
                ctx.fillStyle = '#fff';
                ctx.font = '12px Courier New';
                ctx.textAlign = 'center';
                if (room.hasTopDoor) {
                    ctx.fillText('TOP DOOR', room.center.x, room.y - 15);
                }
                ctx.textAlign = 'left';
            }
            
            // Draw all walls in red for debugging
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            for (let wall of this.walls) {
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            }
            
            // Draw corridor outlines and show door flags
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            for (let corridor of this.corridors) {
                if (corridor.x !== undefined) {
                    // Simple corridor
                    ctx.strokeRect(corridor.x, corridor.y, corridor.width, corridor.height);
                    
                    // Show door flags for corridors
                    ctx.fillStyle = '#0ff';
                    ctx.font = '10px Courier New';
                    ctx.textAlign = 'center';
                    if (corridor.hasBottomDoor) {
                        ctx.fillText('BOTTOM DOOR', corridor.x + corridor.width/2, corridor.y + corridor.height + 15);
                    }
                    if (corridor.hasTopDoor) {
                        ctx.fillText('TOP DOOR', corridor.x + corridor.width/2, corridor.y - 5);
                    }
                    ctx.textAlign = 'left';
                } else if (corridor.segments) {
                    // Old format with segments
                    for (let segment of corridor.segments) {
                        ctx.strokeRect(segment.x, segment.y, segment.width, segment.height);
                    }
                }
            }
        }
    }
}