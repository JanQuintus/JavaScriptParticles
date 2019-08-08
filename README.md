# JavaScriptParticles
Simple but great looking JavaScript particles

## How to use:
- Add a container 
  ```html
  <div id="particles"></div>
  ```
- After the document is loaded, initialize the particles:
  ```javascript
  document.addEventListener("DOMContentLoaded", function(event) {
    window.particles.init(particleSettings);
  });
  ```
- Done.

## Particle Settings
```javascript
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
```
**autoCount**: If true, the amount of particles automatically changes with screen width.

**autoCountMultiplier**: Multiplier for AutoCount-Mode.

**count**: Amount of particles if autoCount = false.

**maxSize**: Max. particle size.

**maxSpeed**: Max. particle speed.

**lineThikness**: Thikness of connecting lines.

**zMode**: How the deepness will be calculated:
  - 'width': by the width of the screen.
  - 'height': by the height of the screen.
  - 'wh': by the width and height of the screen.
  - 'number': as the number set in **z**
  
**z**: 
