import { castRay } from './raycaster.js';
import { fov, numRays, maxDepth } from './player.js';

export function draw(ctx, canvas, player, wallTexture) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the pitch offset
    const pitchOffset = player.pitch * canvas.height;

    // Draw the ceiling and floor with gradients
    addCeilingAndFloorGradient(pitchOffset);

    const sliceWidth = canvas.width / numRays;

    for (let i = 0; i < numRays; i++) {
        const screenX = (2 * i) / numRays - 1; // Normalized screen coordinate
        const rayAngle = player.angle + Math.atan(screenX * Math.tan(fov / 2));
        const ray = castRay(rayAngle);

        const wallHeight = (canvas.height / ray.distance) * 50;

        // Combine distance-based shading and light effect
        const distanceShade = Math.max(0.3, 1 - ray.distance / maxDepth);
        const brightness = Math.min(1, distanceShade + ray.lightEffect);

        const textureX = Math.floor(ray.textureX * (wallTexture.width / 50));

        // Apply brightness using ctx.filter
        ctx.filter = `brightness(${brightness})`;

        ctx.drawImage(
            wallTexture,
            textureX, 0,
            1, wallTexture.height,
            Math.floor(i * sliceWidth),
            Math.floor(canvas.height / 2 - wallHeight / 2 + pitchOffset),
            Math.ceil(sliceWidth),
            Math.floor(wallHeight)
        );
    }

    // Reset the filter after rendering
    ctx.filter = 'none';
}

function addCeilingAndFloorGradient(pitchOffset) {
    // Clamp pitch offset to ensure gradients don't draw out of bounds
    const clampedPitchOffset = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, pitchOffset));

    // Ceiling gradient
    const ceilingGradient = ctx.createLinearGradient(0, 0 + clampedPitchOffset, 0, canvas.height / 2 + clampedPitchOffset);
    ceilingGradient.addColorStop(0, '#2e2727');
    ceilingGradient.addColorStop(1, '#1c1818');
    ctx.fillStyle = ceilingGradient;

    // Draw ceiling
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + clampedPitchOffset);

    // Floor gradient
    const floorGradient = ctx.createLinearGradient(0, canvas.height / 2 + clampedPitchOffset, 0, canvas.height);
    floorGradient.addColorStop(0, '#4b4d43');
    floorGradient.addColorStop(1, '#2d2e27');
    ctx.fillStyle = floorGradient;

    // Draw the floor
    ctx.fillRect(0, canvas.height / 2 + clampedPitchOffset, canvas.width, canvas.height / 2 - clampedPitchOffset);
}