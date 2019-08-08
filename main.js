var particleSettings = {
    autoCount: true,
    autoCountMultiplier: 1,
    count: 1,
    maxSize: 25,
    maxSpeed: 1,
    lineThinkness: 1,
    zMode: 'wh',
    z: 0,
    fadeOut: true,
    fadeOutStrength: 0.4,
    fadeOutAffectsSize: true,
    connectionBox: 150,
    backgroundColor: {r: 12, g: 30, b: 48},
    particleColor: {r: 200, g: 229, b: 255},
    particleColorBoost: 50,
    plongLifeTime: 50,
    plongSize: 100
}

document.addEventListener("DOMContentLoaded", function(event) {
    window.particles.init(particleSettings);
});