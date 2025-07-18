
// ===== CONFIGURACIÓN DE PHASER.JS =====

let phaserGame = null;
let gameScene = null;
let gameScore = 0;
let coinsCollected = 0;
let gameRunning = false;

// Configuración del juego Phaser
const phaserConfig = {
    type: Phaser.AUTO,
    width: 320,
    height: 480,
    parent: 'phaserGameContainer',
    backgroundColor: '#87ceeb',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preloadGame,
        create: createGame,
        update: updateGame
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Variables del juego
let player;
let platforms;
let coins;
let cursors;
let gameOverFlag = false;
let cameraFollowY = 0;
let maxHeight = 0;

// ===== FUNCIONES DE PHASER =====

function preloadGame() {
    // Crear sprites simples usando gráficos de Phaser
    this.add.graphics()
        .fillStyle(0xD2691E)
        .fillRect(0, 0, 40, 40)
        .generateTexture('capybara', 40, 40);
    
    this.add.graphics()
        .fillStyle(0x8FBC8F)
        .fillRect(0, 0, 80, 15)
        .generateTexture('platform', 80, 15);
    
    this.add.graphics()
        .fillStyle(0xFFD700)
        .fillCircle(10, 10, 10)
        .generateTexture('coin', 20, 20);
    
    this.add.graphics()
        .fillStyle(0xFF6B6B)
        .fillRect(0, 0, 80, 15)
        .generateTexture('springPlatform', 80, 15);
    
    this.add.graphics()
        .fillStyle(0x4ECDC4)
        .fillRect(0, 0, 80, 15)
        .generateTexture('movingPlatform', 80, 15);
}

function createGame() {
    gameScene = this;
    
    // Crear grupos
    platforms = this.physics.add.staticGroup();
    coins = this.physics.add.group();
    
    // Crear plataforma inicial
    const startPlatform = platforms.create(160, 450, 'platform');
    startPlatform.setScale(2, 1).refreshBody();
    
    // Crear jugador
    player = this.physics.add.sprite(160, 400, 'capybara');
    player.setBounce(0.2);
    player.setCollideWorldBounds(false);
    player.setTint(0xD2691E);
    
    // Crear plataformas iniciales
    generatePlatforms();
    
    // Configurar colisiones
    this.physics.add.collider(player, platforms, hitPlatform, null, this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    
    // Configurar controles
    cursors = this.input.keyboard.createCursorKeys();
    
    // Configurar cámara
    this.cameras.main.startFollow(player);
    this.cameras.main.setDeadzone(50, 100);
    
    // Controles táctiles
    this.input.on('pointerdown', handleTouch, this);
    
    // Resetear variables
    gameScore = 0;
    coinsCollected = 0;
    maxHeight = player.y;
    gameOverFlag = false;
    
    // Actualizar UI
    document.getElementById('gameScore').textContent = gameScore;
}

function updateGame() {
    if (gameOverFlag) return;
    
    // Controles de movimiento
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }
    
    // Salto
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
    
    // Actualizar puntuación basada en altura
    if (player.y < maxHeight) {
        maxHeight = player.y;
        gameScore = Math.max(0, Math.floor((450 - maxHeight) / 10));
        document.getElementById('gameScore').textContent = gameScore;
    }
    
    // Verificar si el jugador cayó
    if (player.y > this.cameras.main.scrollY + 600) {
        endPhaserGame();
    }
    
    // Generar más plataformas si es necesario
    if (player.y < this.cameras.main.scrollY - 200) {
        generateMorePlatforms();
    }
    
    // Limpiar plataformas y monedas fuera de pantalla
    cleanupOffscreenObjects();
}

function generatePlatforms() {
    for (let i = 1; i < 20; i++) {
        const x = Phaser.Math.Between(40, 280);
        const y = 450 - (i * 60);
        
        const platformType = Phaser.Math.Between(1, 100);
        let platform;
        
        if (platformType <= 5) {
            // Plataforma de resorte (5%)
            platform = platforms.create(x, y, 'springPlatform');
            platform.platformType = 'spring';
        } else if (platformType <= 15) {
            // Plataforma móvil (10%)
            platform = platforms.create(x, y, 'movingPlatform');
            platform.platformType = 'moving';
            platform.moveDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
            platform.moveSpeed = 50;
        } else {
            // Plataforma normal (85%)
            platform = platforms.create(x, y, 'platform');
            platform.platformType = 'normal';
        }
        
        // Agregar moneda ocasionalmente
        if (Phaser.Math.Between(1, 100) <= 40) {
            const coin = coins.create(x, y - 30, 'coin');
            coin.setTint(0xFFD700);
            coin.body.setGravity(0, -300); // Sin gravedad para las monedas
        }
    }
}

function generateMorePlatforms() {
    const currentTopY = Math.min(...platforms.children.entries.map(p => p.y));
    
    for (let i = 1; i <= 10; i++) {
        const x = Phaser.Math.Between(40, 280);
        const y = currentTopY - (i * 60);
        
        const platformType = Phaser.Math.Between(1, 100);
        let platform;
        
        if (platformType <= 5) {
            platform = platforms.create(x, y, 'springPlatform');
            platform.platformType = 'spring';
        } else if (platformType <= 15) {
            platform = platforms.create(x, y, 'movingPlatform');
            platform.platformType = 'moving';
            platform.moveDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
            platform.moveSpeed = 50;
        } else {
            platform = platforms.create(x, y, 'platform');
            platform.platformType = 'normal';
        }
        
        if (Phaser.Math.Between(1, 100) <= 40) {
            const coin = coins.create(x, y - 30, 'coin');
            coin.setTint(0xFFD700);
            coin.body.setGravity(0, -300);
        }
    }
}

function cleanupOffscreenObjects() {
    const cameraBottom = gameScene.cameras.main.scrollY + 600;
    
    // Limpiar plataformas
    platforms.children.entries.forEach(platform => {
        if (platform.y > cameraBottom) {
            platform.destroy();
        }
    });
    
    // Limpiar monedas
    coins.children.entries.forEach(coin => {
        if (coin.y > cameraBottom) {
            coin.destroy();
        }
    });
}

function hitPlatform(player, platform) {
    if (player.body.velocity.y > 0) { // Solo si está cayendo
        switch (platform.platformType) {
            case 'spring':
                player.setVelocityY(-500); // Salto extra alto
                platform.setTint(0xFF9999); // Efecto visual
                gameScene.time.delayedCall(200, () => {
                    platform.clearTint();
                });
                break;
            case 'moving':
                player.setVelocityY(-330);
                // Mover la plataforma
                platform.x += platform.moveDirection * platform.moveSpeed * 0.016;
                if (platform.x <= 40 || platform.x >= 280) {
                    platform.moveDirection *= -1;
                }
                break;
            default:
                player.setVelocityY(-330);
                break;
        }
    }
}

function collectCoin(player, coin) {
    coin.destroy();
    coinsCollected++;
    
    // Efecto visual
    const emitter = gameScene.add.particles(coin.x, coin.y, 'coin', {
        speed: { min: 50, max: 100 },
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        quantity: 5
    });
    
    gameScene.time.delayedCall(300, () => {
        emitter.destroy();
    });
}

function handleTouch(pointer) {
    const x = pointer.x;
    const gameWidth = gameScene.cameras.main.width;
    
    if (x < gameWidth * 0.3) {
        // Lado izquierdo - mover izquierda
        player.setVelocityX(-160);
    } else if (x > gameWidth * 0.7) {
        // Lado derecho - mover derecha
        player.setVelocityX(160);
    } else {
        // Centro - saltar
        if (player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }
}

// ===== FUNCIONES DE CONTROL DEL JUEGO =====

function initPhaserGame() {
    document.getElementById('platformGameOverlay').classList.add('active');
    document.getElementById('gameStartScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    if (phaserGame) {
        phaserGame.destroy(true);
    }
    
    phaserGame = new Phaser.Game(phaserConfig);
}

function startPhaserGame() {
    document.getElementById('gameStartScreen').style.display = 'none';
    gameRunning = true;
}

function endPhaserGame() {
    if (gameOverFlag) return;
    
    gameOverFlag = true;
    gameRunning = false;
    
    // Actualizar UI
    document.getElementById('finalScore').textContent = gameScore;
    document.getElementById('coinsEarned').textContent = coinsCollected;
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // Actualizar estado del juego principal
    if (typeof petState !== 'undefined') {
        petState.coins += coinsCollected;
        petState.happiness = Math.min(100, petState.happiness + Math.floor(gameScore / 10));
        petState.energy = Math.max(0, petState.energy - 20);
        
        if (typeof gainExperience === 'function') {
            gainExperience(Math.floor(gameScore / 5) + coinsCollected * 2);
        }
        
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
        
        if (typeof savePetState === 'function') {
            savePetState();
        }
    }
}

function restartPhaserGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    
    if (phaserGame) {
        phaserGame.scene.restart();
    }
    
    startPhaserGame();
}

function closePhaserGame() {
    document.getElementById('platformGameOverlay').classList.remove('active');
    gameRunning = false;
    
    if (phaserGame) {
        phaserGame.destroy(true);
        phaserGame = null;
    }
}

// ===== FUNCIONES GLOBALES =====

window.initPhaserGame = initPhaserGame;
window.startPhaserGame = startPhaserGame;
window.endPhaserGame = endPhaserGame;
window.restartPhaserGame = restartPhaserGame;
window.closePhaserGame = closePhaserGame;
