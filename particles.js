// IE Fix
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function(obj) {
            var newArr = this.filter(function(el) {
            return el == obj;
            });
            return newArr.length > 0;
        }
    });
    }

window.particles = {
    canvas: null,
    ctx: null,
    particles: [],
    updateInt: null,
    width: 0,
    height: 0,
    running: false,
    settings: {},

    init: function (settings) { 
        window.particles.settings = settings;

        window.particles.width = document.getElementById('particles').offsetWidth;
        window.particles.height = document.getElementById('particles').offsetHeight;
    
        window.particles.initParticles();
        if(window.particles.isInViewport(document.getElementById('particles'))) window.particles.start();
        
        window.addEventListener('resize', function() {
            window.particles.width = document.getElementById('particles').offsetWidth;
            window.particles.height = document.getElementById('particles').offsetHeight;
            window.particles.initParticles();
            if(window.particles.isInViewport(document.getElementById('particles'))) window.particles.start();
        });
    
        window.addEventListener("scroll", function() {
            if(!window.particles.isInViewport(document.getElementById('particles')) && window.particles.running){
                window.particles.stop();
            }
            if(window.particles.isInViewport(document.getElementById('particles')) && !window.particles.running){
                window.particles.start();
            }
        });
    },

    initParticles: function() {
        var html = '<canvas id="particles-canvas" width="' + window.particles.width + '" height="' + window.particles.height + '"></canvas>'
        
        document.getElementById('particles').style.backgroundColor = 'rgb(' + window.particles.settings.backgroundColor.r +
                                                    ', ' + window.particles.settings.backgroundColor.g + 
                                                    ', ' + window.particles.settings.backgroundColor.b + ')';
    
        var canvas = document.getElementById("particles-canvas");
        if(canvas){
            canvas.parentNode.removeChild(canvas);
        }                                     
        document.getElementById("particles").insertAdjacentHTML( 'beforeend', html );

        window.particles.canvas = document.getElementById("particles-canvas");
        window.particles.ctx = window.particles.canvas.getContext("2d");
    
        if(window.particles.settings.autoCount){
            window.particles.settings.count = Math.round(window.particles.width * 0.035 * window.particles.settings.autoCountMultiplier);
        }
    
        switch(window.particles.settings.zMode){
            case 'width':
                window.particles.settings.z = window.particles.width;
                break;
            case 'height':
                window.particles.settings.z = window.particles.height;
                break;
            case 'wh':
                window.particles.settings.z = (window.particles.width + window.particles.height) / 2;
                break;
        }
        
        window.particles.spawnParticles();
    },

    start: function() { 
        if(window.particles.updateInt){
            clearInterval(window.particles.updateInt);
        }
    
        window.particles.running = true;
    
        window.particles.updateInt = setInterval(function () { 
            window.particles.updateParticles();
        }, 25);
    },
    
    stop: function(){
        if(window.particles.updateInt){
            clearInterval(window.particles.updateInt);
        }
    
        window.particles.running = false;
    },

    spawnParticles: function(){
        window.particles.particles = [];
        for(var i = 0; i < window.particles.settings.count; i++){
            window.particles.particles.push({
                x: Math.random() * window.particles.canvas.width,
                y: Math.random() * window.particles.canvas.height,
                z: Math.random() * window.particles.settings.z,
                zVelocityBoost: 1,
                velocityX: (Math.random() - .5) * window.particles.settings.maxSpeed * 2,
                velocityY: (Math.random() - .5) * window.particles.settings.maxSpeed * 2,
                velocityZ: (Math.random() - .5) * window.particles.settings.maxSpeed * 2,
                connected: [],
                plong: {
                    x: 0,
                    y: 0,
                    lifetiem: 0
                }
            });
        }
    },

    updateParticles: function() {
        for(var i = 0; i < window.particles.particles.length; i++){
            var particle = window.particles.particles[i];

            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.z += particle.velocityZ * particle.zVelocityBoost;
    
            if(particle.zVelocityBoost > 1) particle.zVelocityBoost -= (window.particles.settings.z * 0.04) / 20;
            if(particle.zVelocityBoost < 1) particle.zVelocityBoost = 1;

            var size = ((particle.z / window.particles.settings.z) * window.particles.settings.maxSize).toFixed(2) / 2;
    
            if(particle.x > window.particles.canvas.width + size){
                particle.x = -size;
            }
            if(particle.x < -size){
                particle.x = window.particles.canvas.width + size;
            }
    
            if(particle.y > window.particles.canvas.height + size){
                particle.y = -size;
            }
            if(particle.y < -size){
                particle.y = window.particles.canvas.height + size;
            }
    
            if(particle.z > window.particles.settings.z){
                particle.velocityZ = -particle.velocityZ;
                particle.plong = {
                    x: particle.x,
                    y: particle.y,
                    lifetime: window.particles.settings.plongLifeTime
                }
                if(window.particles.settings.plongLifeTime > 30) particle.zVelocityBoost = window.particles.settings.z * 0.04;
            }
            if(particle.z < 0){
                particle.velocityZ = -particle.velocityZ;
            }
        }
    
        window.particles.particles.sort(function(a, b) {
            return a.z - b.z;
        });
    
        window.particles.drawParticles();
    },

    drawParticles: function(){
        window.particles.ctx.clearRect(0, 0, window.particles.canvas.width, window.particles.canvas.height);
        window.particles.ctx.lineWidth  = window.particles.settings.lineThikness;
    
        for(var i = 0; i < window.particles.particles.length; i++){
            var particle = window.particles.particles[i];

            var opacity = (particle.z / window.particles.settings.z).toFixed(5);
    
            if(window.particles.settings.fadeOut){
                var nXDist = 1 - (Math.abs(particle.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                var nYDist = 1 - (Math.abs(particle.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                opacity *= nXDist;
                opacity *= nYDist;
            }
    
            var size = (window.particles.settings.fadeOutAffectsSize ? opacity : (particle.z / window.particles.settings.z).toFixed(5)) * window.particles.settings.maxSize;
    
            particle.connected = [];
            for(var j = 0; j < window.particles.particles.length; j++){
                var other = window.particles.particles[j];

                if(other != particle && !other.connected.includes(particle)){
                    if(other.x < particle.x + window.particles.settings.connectionBox && other.x > particle.x - window.particles.settings.connectionBox
                        && other.y < particle.y + window.particles.settings.connectionBox && other.y > particle.y - window.particles.settings.connectionBox
                        && other.z < particle.z + window.particles.settings.connectionBox && other.z > particle.z - window.particles.settings.connectionBox){
    
                        particle.connected.push(other);
                        
                        var otherOpacity = (other.z / window.particles.settings.z).toFixed(5);
                        if(window.particles.settings.fadeOut){
                            var nXDist = 1 - (Math.abs(other.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                            var nYDist = 1 - (Math.abs(other.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                            otherOpacity *= nXDist;
                            otherOpacity *= nYDist;
                        }
    
                        var gradient = window.particles.ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
                        gradient.addColorStop("0", window.particles.getBlendedColor(opacity));
                        gradient.addColorStop("1", window.particles.getBlendedColor(otherOpacity));
                        window.particles.ctx.strokeStyle = gradient;
                        window.particles.ctx.beginPath();
                        window.particles.ctx.moveTo(particle.x, particle.y);
                        window.particles.ctx.lineTo(other.x, other.y)
                        window.particles.ctx.closePath();
                        window.particles.ctx.stroke();
                    }
                }
                
            }
    
            window.particles.ctx.fillStyle = window.particles.getBlendedColor(opacity);
            window.particles.ctx.beginPath();
            window.particles.ctx.moveTo(particle.x, particle.y - size);
            window.particles.ctx.lineTo(particle.x + size, particle.y - size / 2.5);
            window.particles.ctx.lineTo(particle.x + size, particle.y + size / 2.5);
            window.particles.ctx.lineTo(particle.x, particle.y + size);
            window.particles.ctx.lineTo(particle.x - size, particle.y + size / 2.5);
            window.particles.ctx.lineTo(particle.x - size, particle.y - size / 2.5);
            window.particles.ctx.closePath();
            window.particles.ctx.fill();
    
            if(particle.plong.lifetime > 0){
                var opacity = (particle.plong.lifetime / window.particles.settings.plongLifeTime).toFixed(2);
                if(window.particles.settings.fadeOut){
                    var nXDist = 1 - (Math.abs(particle.plong.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                    var nYDist = 1 - (Math.abs(particle.plong.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                    opacity *= nXDist;
                    opacity *= nYDist;
                }
                window.particles.ctx.strokeStyle = 'rgba(' + window.particles.settings.particleColor.r + 
                                    ', ' + window.particles.settings.particleColor.g + 
                                    ', ' + window.particles.settings.particleColor.b + 
                                    ',' + opacity + ')';

                var size = (1 - ((particle.plong.lifetime * .8) / window.particles.settings.plongLifeTime)) * (window.particles.settings.plongSize);
                window.particles.ctx.beginPath();
                window.particles.ctx.arc(particle.plong.x, particle.plong.y, size * Math.cos(opacity), 0, 2 * Math.PI);
                window.particles.ctx.arc(particle.plong.x, particle.plong.y, size * Math.cos(opacity) * Math.sin(opacity) * 2, 0, 2 * Math.PI);
                window.particles.ctx.arc(particle.plong.x, particle.plong.y, size * Math.cos(opacity) / 2, 0, 2 * Math.PI);
                window.particles.ctx.stroke();
                particle.plong.lifetime--;
            }
        }
    },

    getBlendedColor: function(opacity) { 

        var r = (window.particles.settings.backgroundColor.r * (1 - opacity)) + ((window.particles.settings.particleColor.r + window.particles.settings.particleColorBoost) * (opacity));
        var g = (window.particles.settings.backgroundColor.g * (1 - opacity)) + ((window.particles.settings.particleColor.g + window.particles.settings.particleColorBoost) * (opacity));
        var b = (window.particles.settings.backgroundColor.b * (1 - opacity)) + ((window.particles.settings.particleColor.b + window.particles.settings.particleColorBoost) * (opacity));

        if(r > 255) r = 255;
        if(g > 255) g = 255;
        if(b > 255) b = 255;
        if(r < 0) r = 0;
        if(g < 0) g = 0;
        if(b < 0) b = 0;

        var rHex = Number(Math.floor(r)).toString(16);
        if (rHex.length < 2) rHex = "0" + rHex;
        var gHex = Number(Math.floor(g)).toString(16);
        if (gHex.length < 2) gHex = "0" + gHex;
        var bHex = Number(Math.floor(b)).toString(16);
        if (bHex.length < 2) bHex = "0" + bHex;
        
        return '#' + rHex + gHex + bHex;
    },

    isInViewport: function (elem) {
        var bounding = elem.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
}