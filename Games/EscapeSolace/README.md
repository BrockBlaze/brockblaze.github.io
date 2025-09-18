# Escape Solace - Game Documentation

## Overview
Escape Solace is a top-down survival shooter game built with HTML5 Canvas and vanilla JavaScript. Players must navigate procedurally generated levels, defeat enemies, and survive as long as possible while managing resources and weapons.

## Game Features

### Core Mechanics
- **Top-down perspective** with smooth camera following
- **Procedural level generation** creating unique room layouts each playthrough
- **Real-time combat** with multiple weapon types
- **Health and shield system** with regeneration mechanics
- **Enemy AI** with sight range and attack behaviors
- **Pickup system** for weapons and ammunition

## Controls

| Action | Control |
|--------|---------|
| **Movement** | W, A, S, D keys |
| **Aim** | Mouse cursor |
| **Shoot** | Left mouse click |
| **Dash** | Spacebar (1 second cooldown) |
| **Pause** | ESC key |
| **Reload** | R key |
| **Switch Weapons** | 1, 2 keys |
| **Debug Mode** | F1 key (toggles debug visuals) |
| **Restart** | R key (when dead) |

## Player Systems

### Health & Shield
- **Max Health**: 100 HP
- **Max Shield**: 50 points
- **Health Regeneration**: 25 HP/second after 4 seconds without taking damage
- **Shield**: Absorbs damage before health is affected

### Movement
- **Base Speed**: 700 pixels/second
- **Dash Ability**:
  - Speed: 800 pixels/second
  - Duration: 150ms
  - Cooldown: 1 second
- **Friction-based movement** for smooth controls

## Weapon System

### Available Weapons

| Weapon | Clip Size | Fire Rate (RPM) | Damage | Reload Time | Auto |
|--------|-----------|-----------------|--------|-------------|------|
| **Pistol** | 12 | 300 | 25 | 1.5s | No |
| **Assault Rifle** | 36 | 900 | 30 | 2.0s | Yes |
| **Blaster** | 8 | 150 | 60 | 2.5s | No |
| **Shotgun** | 6 | 120 | 80 | 3.0s | No |

### Ammunition Types
- Small Bullets (Pistol)
- Large Bullets (Assault Rifle)
- Green Bullets (Blaster)
- Shotgun Shells

## Enemy System

### Badguy (Basic Enemy)
- **Health**: 50 HP
- **Speed**: 400 pixels/second
- **Sight Range**: 300 pixels
- **Attack Range**: 200 pixels
- **Fire Rate**: 300 RPM
- **AI States**: Idle, Chase, Attack

### Enemy Behavior
1. **Idle**: Default state when player is out of sight range
2. **Chase**: Moves toward player when within sight range
3. **Attack**: Shoots at player when within attack range

### Death & Loot
- Enemies remain on the battlefield for 10 seconds after death
- Random chance to drop pickups:
  - Ammunition (40% chance)
  - Weapons (20% chance)
  - Shield regeneration (20% chance)

## World Generation

### Procedural Generation
- **Organic room placement** starting from a central room
- **Connected hallways** between rooms
- **Room dimensions**: 60-120 pixels (min-max)
- **Corridor width**: 120 pixels
- **World size**: 2400x1800 pixels

### Level Structure
1. Central starting room (400x300 pixels)
2. Top hallway connection
3. Additional rooms branching off
4. Wall collision boundaries

## Pickup System

### Pickup Types
1. **Weapon Pickups**: Pistol, AR, Shotgun
2. **Ammo Pickups**: Bullets for each weapon type
3. **Shield Regen**: Restores shield points

### Spawn Mechanics
- Maximum 5 pickups active at once
- Drop from defeated enemies
- Automatic collection on player contact

## Technical Architecture

### File Structure
```
EscapeSolace/
├── index.html          # Main HTML structure
├── style/
│   └── main.css       # Game styling and UI
├── js/
│   ├── main.js        # Entry point and initialization
│   ├── game.js        # Core game loop and systems
│   ├── player.js      # Player class and controls
│   ├── badguy.js      # Enemy AI and behavior
│   └── world.js       # Level generation
└── sprites/
    ├── player/        # Player sprites and animations
    ├── badguy/        # Enemy sprites
    ├── pickups/       # Item sprites
    └── objects/       # Environmental sprites
```

### Core Classes

#### Game Class
- Manages game state and main loop
- Handles entity spawning and management
- Controls camera and rendering
- Processes collisions and physics

#### Player Class
- Handles input and movement
- Manages health, shields, and weapons
- Controls dash ability
- Processes aiming and shooting

#### Badguy Class
- Implements enemy AI state machine
- Handles pathfinding and targeting
- Manages enemy combat and death

#### World Class
- Generates procedural levels
- Creates room and corridor layouts
- Manages collision boundaries

## UI Elements

### HUD Components
1. **Health Bar**: Visual representation of current health
2. **Shield Bar**: Shows remaining shield points
3. **Weapon Display**: Current weapons and ammo count
4. **Reload Indicator**: Shows reload progress
5. **Death Screen**: Restart prompt when player dies

### Visual Effects
- Smooth camera following with 1.2x zoom
- Walking animations for player and enemies
- Death animations and corpse persistence
- Particle effects for hits and explosions
- Muzzle flash and recoil animations

## Performance Features

- **Delta time movement** for frame-rate independence
- **Efficient collision detection** using spatial partitioning
- **Sprite-based rendering** for optimized graphics
- **Tab visibility handling** to pause when inactive

## Debug Mode

Press F1 to toggle debug mode, which displays:
- Collision boundaries
- Entity positions
- AI sight/attack ranges
- Performance metrics
- Room and corridor boundaries

## Game States

1. **Running**: Normal gameplay
2. **Paused**: Game frozen (ESC or tab switch)
3. **Game Over**: Player death state with restart option
4. **Reloading**: Weapon reload animation

## Tips for Players

1. **Manage your ammo** - Switch weapons when low instead of reloading mid-combat
2. **Use dash strategically** - Great for dodging enemy fire or repositioning
3. **Keep moving** - Standing still makes you an easy target
4. **Prioritize shield pickups** - Shields regenerate health indirectly
5. **Learn enemy patterns** - Enemies have predictable AI behaviors
6. **Use corners** - Break line of sight to avoid enemy fire

## Development Notes

### Technologies Used
- Pure JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 for UI styling
- No external dependencies

### Browser Compatibility
- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge
- Hardware acceleration recommended

### Future Enhancements
- Additional enemy types
- Boss battles
- Power-ups and special abilities
- Multiplayer support
- Level progression system
- Score/leaderboard system