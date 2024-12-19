import { player } from './player.js';


export function castRay(rayAngle, map, maxDepth, lightSource) {
    let x = player.x;
    let y = player.y;

    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    for (let depth = 0; depth < maxDepth; depth++) {
        x += cos;
        y += sin;

        const mapX = Math.floor(x / 50);
        const mapY = Math.floor(y / 50);

        if (map[mapY] && map[mapY][mapX] === 1) {
            const rawDistance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);

            // Correct the distance for fish-eye effect
            const correctedDistance = rawDistance * Math.cos(rayAngle - player.angle);

            // Determine texture offset based on hit side
            const hitX = x % 50;
            const hitY = y % 50;
            const isVerticalHit = Math.abs(cos) < Math.abs(sin);
            const textureX = isVerticalHit ? hitY : hitX;

            // Directional lighting calculation
            const dx = lightSource.x - x;
            const dy = lightSource.y - y;
            const distanceToLight = Math.sqrt(dx ** 2 + dy ** 2);
            const lightAngle = Math.atan2(dy, dx);
            const angleToLight = Math.abs(rayAngle - lightAngle);

            // Light intensity fades with distance and angle
            const lightEffect = lightSource.intensity / (1 + distanceToLight / 50) * Math.max(0, Math.cos(angleToLight));

            return { distance: correctedDistance, textureX, lightEffect };
        }
    }

    return { distance: maxDepth, lightEffect: 0 }; // If no wall hit, no light effect
}
