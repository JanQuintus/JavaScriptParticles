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

        $(document).ready(function(){
            window.particles.width = $('#particles').innerWidth();
            window.particles.height = $('#particles').innerHeight();
        
            window.particles.initParticles();
            if($(window).scrollTop() < window.particles.height) window.particles.start();
            
            $(window).on('resize', function() {
                window.particles.width = $('#particles').innerWidth();
                window.particles.height = $('#particles').innerHeight();
                window.particles.initParticles();
                if($(window).scrollTop() < window.particles.height) window.particles.start();
            });
        
            $(window).on('scroll', function() {
                if($(window).scrollTop() > window.particles.height && window.particles.running){
                    window.particles.stop();
                }
                if($(window).scrollTop() < window.particles.height && !window.particles.running){
                    window.particles.start();
                }
            });
        });
    },

    initParticles: function() {
        let html = '<canvas id="particles-canvas" width="' + window.particles.width + '" height="' + window.particles.height + '"></canvas>'
        
        $('#particles').css('background-color', 'rgb(' + window.particles.settings.backgroundColor.r +
                                                    ', ' + window.particles.settings.backgroundColor.g + 
                                                    ', ' + window.particles.settings.backgroundColor.b + ')');
    
        $('#particles-canvas').remove();
        $('#particles').append(html);
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
        for(var particle of window.particles.particles){
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.z += particle.velocityZ * particle.zVelocityBoost;
    
            if(particle.zVelocityBoost > 1) particle.zVelocityBoost -= (window.particles.settings.z * 0.04) / 20;
            if(particle.zVelocityBoost < 1) particle.zVelocityBoost = 1;

            let size = ((particle.z / window.particles.settings.z) * window.particles.settings.maxSize).toFixed(2) / 2;
    
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
    
        window.particles.particles.sort((a, b) => {
            return a.z - b.z;
        });
    
        window.particles.drawParticles();
    },

    drawParticles: function(){
        window.particles.ctx.clearRect(0, 0, window.particles.canvas.width, window.particles.canvas.height);
        window.particles.ctx.lineWidth  = window.particles.settings.lineThinkness;
    
        for(var particle of window.particles.particles){
            let opacity = (particle.z / window.particles.settings.z).toFixed(5);
    
            if(window.particles.settings.fadeOut){
                let nXDist = 1 - (Math.abs(particle.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                let nYDist = 1 - (Math.abs(particle.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                opacity *= nXDist;
                opacity *= nYDist;
            }
    
            let size = (window.particles.settings.fadeOutAffectsSize ? opacity : (particle.z / window.particles.settings.z).toFixed(5)) * window.particles.settings.maxSize;
    
            particle.connected = [];
            for(var other of window.particles.particles){
                if(other != particle && !other.connected.includes(particle)){
                    if(other.x < particle.x + window.particles.settings.connectionBox && other.x > particle.x - window.particles.settings.connectionBox
                        && other.y < particle.y + window.particles.settings.connectionBox && other.y > particle.y - window.particles.settings.connectionBox
                        && other.z < particle.z + window.particles.settings.connectionBox && other.z > particle.z - window.particles.settings.connectionBox){
    
                        particle.connected.push(other);
                        
                        let otherOpacity = (other.z / window.particles.settings.z).toFixed(5);
                        if(window.particles.settings.fadeOut){
                            let nXDist = 1 - (Math.abs(other.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                            let nYDist = 1 - (Math.abs(other.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                            otherOpacity *= nXDist;
                            otherOpacity *= nYDist;
                        }
    
                        let gradient = window.particles.ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
                        gradient.addColorStop(0, window.particles.getBlendedColor(opacity));
                        gradient.addColorStop(1, window.particles.getBlendedColor(otherOpacity));
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
                let opacity = (particle.plong.lifetime / window.particles.settings.plongLifeTime).toFixed(2);
                if(window.particles.settings.fadeOut){
                    let nXDist = 1 - (Math.abs(particle.plong.x - (window.particles.width / 2)) / (window.particles.width / 2)) * window.particles.settings.fadeOutStrength;
                    let nYDist = 1 - (Math.abs(particle.plong.y - (window.particles.height / 2)) / (window.particles.height / 2)) * window.particles.settings.fadeOutStrength;
                    opacity *= nXDist;
                    opacity *= nYDist;
                }
                window.particles.ctx.strokeStyle = 'rgba(' + window.particles.settings.particleColor.r + 
                                    ', ' + window.particles.settings.particleColor.g + 
                                    ', ' + window.particles.settings.particleColor.b + 
                                    ',' + opacity + ')';

                let size = (1 - ((particle.plong.lifetime * .8) / window.particles.settings.plongLifeTime)) * (window.particles.settings.plongSize);
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

        let r = (window.particles.settings.backgroundColor.r * (1 - opacity)) + ((window.particles.settings.particleColor.r + window.particles.settings.particleColorBoost) * (opacity));
        let g = (window.particles.settings.backgroundColor.g * (1 - opacity)) + ((window.particles.settings.particleColor.g + window.particles.settings.particleColorBoost) * (opacity));
        let b = (window.particles.settings.backgroundColor.b * (1 - opacity)) + ((window.particles.settings.particleColor.b + window.particles.settings.particleColorBoost) * (opacity));

        return 'rgb(' + r + ', ' + g + ', ' + b + ')'
    }
}