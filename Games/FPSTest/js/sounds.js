const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function loadSound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

function playSound(buffer) {
    if (!buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

let shootBuffer;
let reloadBuffer;
const footstepBuffers = [];

export async function loadAllSounds() {
    try {
        // Load all sounds in parallel
        [shootBuffer, reloadBuffer] = await Promise.all([
            loadSound('./sounds/weapons/pistol_fire_handgun2.wav'),
            loadSound('./sounds/weapons/pistol_reload_pistolreload.wav')
        ]);

        // Load footstep sounds
        const footstepFiles = [
            './sounds/footsteps/general_dirt1.wav',
            './sounds/footsteps/general_dirt2.wav',
            './sounds/footsteps/general_dirt3.wav',
            './sounds/footsteps/general_dirt4.wav',
        ];

        const loadedFootsteps = await Promise.all(footstepFiles.map(loadSound));
        footstepBuffers.push(...loadedFootsteps);

    } catch (error) {
        console.error("Failed to load sounds:", error);
    }


    return {
        shoot: {
            play: () => playSound(shootBuffer)
        },
        reload: {
            play: () => playSound(reloadBuffer)
        },
        footstep: {
            play: () => {
                if (footstepBuffers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * footstepBuffers.length);
                    playSound(footstepBuffers[randomIndex]);
                }
            }
        },
        // Placeholders for other sounds
        enemyHit: { play: () => console.log('Sound: Enemy Hit') },
        playerHit: { play: () => console.log('Sound: Player Hit') },
        enemyDeath: { play: () => console.log('Sound: Enemy Death') },
        pickup: { play: () => console.log('Sound: Pickup') },
        ambience: { play: () => console.log('Sound: Ambience') }
    };
}