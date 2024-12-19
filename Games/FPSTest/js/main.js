import { player, updatePlayer } from './player.js';
import { lightSource } from './light.js';
import { map } from './map.js';
import { draw } from './renderer.js';
import { setupInput, keys } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wallTexture = document.getElementById('wallTexture');

canvas.width = window.innerWidth - 5;
canvas.height = window.innerHeight - 5;

setupInput(canvas, player);

function gameLoop() {
    updatePlayer(keys, map);
    draw(ctx, canvas, map, player, lightSource, wallTexture);
    requestAnimationFrame(gameLoop);
}

gameLoop();
