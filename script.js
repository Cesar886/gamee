// Estado inicial de la mascota
const defaultPetState = {
    name: "Capibara",
    hunger: 100,
    happiness: 100,
    health: 100,
    energy: 100,
    age: 0,
    lastFed: null,
    lastPlayed: null,
    lastHealed: null,
    lastSlept: null,
    isSleeping: false,
    createdAt: Date.now(),
    lastUpdate: Date.now()
};

let petState = { ...defaultPetState };
let gameInterval;

// Sprites y estados de la mascota
const petSprites = {
    normal: "capibara_normal.png",
    happy: "capibara_feliz.png",
    sad: "capibara_triste.png",
    sick: "capibara_enfermo.png",
    sleeping: "capibara_durmiendo.png",
    dead: "capibara_enfermo.png" // Usar la imagen de enfermo para el estado de muerto
};

const petMoods = {
    excellent: "😍",
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    sick: "🤒",
    sleeping: "😴",
    dead: "💀"
};

// Inicializar el juego
function initGame() {
    loadPetState();
    updateDisplay();
    startGameLoop();
    
    // Actualizar cada 30 segundos
    gameInterval = setInterval(() => {
        updatePetStats();
        updateDisplay();
        savePetState();
    }, 30000);
}

// Cargar estado desde localStorage
function loadPetState() {
    const savedState = localStorage.getItem('tamagotchiPet');
    if (savedState) {
        petState = { ...defaultPetState, ...JSON.parse(savedState) };
        
        // Calcular el tiempo transcurrido desde la última actualización
        const timeDiff = Date.now() - petState.lastUpdate;
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));
        
        // Aplicar degradación basada en el tiempo transcurrido
        if (minutesPassed > 0) {
            applyTimeDegradation(minutesPassed);
        }
    }
}

// Guardar estado en localStorage
function savePetState() {
    petState.lastUpdate = Date.now();
    localStorage.setItem('tamagotchiPet', JSON.stringify(petState));
}

// Aplicar degradación por tiempo transcurrido
function applyTimeDegradation(minutesPassed) {
    if (!petState.isSleeping) {
        petState.hunger = Math.max(0, petState.hunger - (minutesPassed * 2));
        petState.happiness = Math.max(0, petState.happiness - (minutesPassed * 1.5));
        petState.energy = Math.max(0, petState.energy - (minutesPassed * 1));
    }
    
    // La salud se degrada más lentamente
    if (petState.hunger < 20 || petState.happiness < 20) {
        petState.health = Math.max(0, petState.health - (minutesPassed * 0.5));
    }
    
    // Calcular edad en días
    const daysPassed = Math.floor((Date.now() - petState.createdAt) / (1000 * 60 * 60 * 24));
    petState.age = daysPassed;
}

// Actualizar estadísticas de la mascota
function updatePetStats() {
    if (petState.isSleeping) {
        // Durante el sueño, la energía se recupera y otras estadísticas se degradan más lentamente
        petState.energy = Math.min(100, petState.energy + 5);
        petState.hunger = Math.max(0, petState.hunger - 0.5);
        
        // Despertar automáticamente cuando la energía esté llena
        if (petState.energy >= 100) {
            petState.isSleeping = false;
            showMessage("¡Tu mascota se ha despertado y está llena de energía!");
        }
    } else {
        // Degradación normal cuando está despierta
        petState.hunger = Math.max(0, petState.hunger - 2);
        petState.happiness = Math.max(0, petState.happiness - 1.5);
        petState.energy = Math.max(0, petState.energy - 1);
        
        // La salud se ve afectada por otras estadísticas bajas
        if (petState.hunger < 20 || petState.happiness < 20 || petState.energy < 10) {
            petState.health = Math.max(0, petState.health - 0.5);
        }
    }
    
    // Recuperación gradual de salud si otras estadísticas están bien
    if (petState.hunger > 70 && petState.happiness > 70 && petState.energy > 50 && petState.health < 100) {
        petState.health = Math.min(100, petState.health + 0.2);
    }
}

// Actualizar la visualización
function updateDisplay() {
    // Actualizar barras de estadísticas
    updateStatBar('hunger', petState.hunger);
    updateStatBar('happiness', petState.happiness);
    updateStatBar('health', petState.health);
    updateStatBar('energy', petState.energy);
    
    // Actualizar sprite y estado de la mascota
    updatePetAppearance();
    
    // Actualizar información
    document.getElementById('petAge').textContent = petState.age;
    document.getElementById('lastFed').textContent = petState.lastFed ? 
        formatTime(petState.lastFed) : 'Nunca';
    
    // Actualizar mensaje de estado
    updateStatusMessage();
}

// Actualizar barra de estadística
function updateStatBar(statName, value) {
    const bar = document.getElementById(statName + 'Bar');
    const valueSpan = document.getElementById(statName + 'Value');
    
    bar.style.width = value + '%';
    valueSpan.textContent = Math.round(value) + '%';
    
    // Cambiar color según el valor
    if (value < 20) {
        bar.style.filter = 'brightness(0.6) saturate(1.5)';
    } else if (value < 50) {
        bar.style.filter = 'brightness(0.8)';
    } else {
        bar.style.filter = 'brightness(1)';
    }
}

// Actualizar apariencia de la mascota
function updatePetAppearance() {
    const sprite = document.getElementById("petSprite");
    const mood = document.getElementById("petMood");
    const petDisplay = sprite.parentElement;
    
    // Remover clases anteriores
    petDisplay.classList.remove("pet-sleeping", "pet-sick", "pet-happy", "pet-sad");
    
    if (petState.health <= 0) {
        sprite.src = petSprites.dead;
        mood.textContent = petMoods.dead;
        petDisplay.classList.add("pet-sick");
    } else if (petState.isSleeping) {
        sprite.src = petSprites.sleeping;
        mood.textContent = petMoods.sleeping;
        petDisplay.classList.add("pet-sleeping");
    } else if (petState.health < 30) {
        sprite.src = petSprites.sick;
        mood.textContent = petMoods.sick;
        petDisplay.classList.add("pet-sick");
    } else if (petState.happiness < 30) {
        sprite.src = petSprites.sad;
        mood.textContent = petMoods.sad;
        petDisplay.classList.add("pet-sad");
    } else if (petState.happiness > 80 && petState.hunger > 80) {
        sprite.src = petSprites.happy;
        mood.textContent = petMoods.excellent;
        petDisplay.classList.add("pet-happy");
    } else if (petState.happiness > 60) {
        sprite.src = petSprites.normal;
        mood.textContent = petMoods.happy;
    } else {
        sprite.src = petSprites.normal;
        mood.textContent = petMoods.neutral;
    }
}

// Actualizar mensaje de estado
function updateStatusMessage() {
    let message = "";
    
    if (petState.health <= 0) {
        message = "💀 ¡Oh no! Tu mascota ha muerto. Presiona 'Reiniciar Mascota' para empezar de nuevo.";
    } else if (petState.isSleeping) {
        message = "😴 Tu mascota está durmiendo plácidamente...";
    } else if (petState.health < 20) {
        message = "🤒 ¡Tu mascota está muy enferma! Necesita cuidados médicos urgentes.";
    } else if (petState.hunger < 20) {
        message = "🍎 ¡Tu mascota tiene mucha hambre! Dale algo de comer.";
    } else if (petState.happiness < 20) {
        message = "😢 Tu mascota está muy triste. ¡Juega con ella!";
    } else if (petState.energy < 20) {
        message = "😴 Tu mascota está muy cansada. Debería dormir un poco.";
    } else if (petState.happiness > 80 && petState.hunger > 80) {
        message = "😍 ¡Tu mascota está súper feliz y saludable!";
    } else if (petState.happiness > 60 && petState.hunger > 60) {
        message = "😊 Tu mascota está contenta y bien cuidada.";
    } else {
        message = "😐 Tu mascota está bien, pero podría estar mejor.";
    }
    
    document.getElementById('statusMessage').textContent = message;
}

// Acciones del jugador
function feedPet() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes alimentar a una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡No la despiertes!");
        return;
    }
    
    if (petState.hunger >= 95) {
        showMessage("🤢 Tu mascota está muy llena. No puede comer más ahora.");
        return;
    }
    
    petState.hunger = Math.min(100, petState.hunger + 25);
    petState.happiness = Math.min(100, petState.happiness + 5);
    petState.lastFed = Date.now();
    
    showMessage("🍎 ¡Ñam ñam! Tu mascota ha disfrutado la comida.");
    updateDisplay();
    savePetState();
}

function playWithPet() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes jugar con una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡Déjala descansar!");
        return;
    }
    
    if (petState.energy < 20) {
        showMessage("😴 Tu mascota está muy cansada para jugar. Necesita dormir.");
        return;
    }
    
    petState.happiness = Math.min(100, petState.happiness + 20);
    petState.energy = Math.max(0, petState.energy - 15);
    petState.hunger = Math.max(0, petState.hunger - 5);
    petState.lastPlayed = Date.now();
    
    showMessage("🎾 ¡Qué divertido! Tu mascota ha disfrutado jugando contigo.");
    updateDisplay();
    savePetState();
}

function healPet() {
    if (petState.health <= 0) {
        showMessage("💀 Es demasiado tarde para curar a tu mascota...");
        return;
    }
    
    if (petState.health >= 95) {
        showMessage("💚 Tu mascota ya está muy saludable.");
        return;
    }
    
    petState.health = Math.min(100, petState.health + 30);
    petState.happiness = Math.min(100, petState.happiness + 10);
    petState.lastHealed = Date.now();
    
    showMessage("💊 ¡Tu mascota se siente mucho mejor ahora!");
    updateDisplay();
    savePetState();
}

function putToSleep() {
    if (petState.health <= 0) {
        showMessage("💀 Tu mascota ya está en el sueño eterno...");
        return;
    }
    
    if (petState.isSleeping) {
        // Despertar
        petState.isSleeping = false;
        showMessage("☀️ ¡Tu mascota se ha despertado!");
    } else {
        // Dormir
        if (petState.energy > 80) {
            showMessage("😊 Tu mascota no tiene sueño ahora. Juega con ella primero.");
            return;
        }
        
        petState.isSleeping = true;
        showMessage("😴 Tu mascota se ha ido a dormir. ¡Que descanse bien!");
    }
    
    petState.lastSlept = Date.now();
    updateDisplay();
    savePetState();
}

function resetPet() {
    if (confirm("¿Estás seguro de que quieres reiniciar tu mascota? Se perderá todo el progreso.")) {
        localStorage.removeItem('tamagotchiPet');
        petState = { ...defaultPetState };
        petState.createdAt = Date.now();
        petState.lastUpdate = Date.now();
        
        showMessage("🌱 ¡Una nueva mascota ha nacido! Cuídala bien.");
        updateDisplay();
        savePetState();
    }
}

// Funciones auxiliares
function showMessage(message) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    
    // Efecto visual temporal
    statusElement.style.background = '#e6fffa';
    statusElement.style.borderColor = '#38b2ac';
    
    setTimeout(() => {
        statusElement.style.background = '#f7fafc';
        statusElement.style.borderColor = '#e2e8f0';
        updateStatusMessage();
    }, 3000);
}

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace un momento';
}

function startGameLoop() {
    // Bucle principal del juego que se ejecuta cada segundo
    setInterval(() => {
        // Solo actualizar la visualización, no las estadísticas
        updateDisplay();
    }, 1000);
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);

// Guardar estado antes de cerrar la página
window.addEventListener('beforeunload', savePetState);



// --- Lógica del Juego de Plataformas (Capibara Jump) ---

const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
const gameOverlay = document.getElementById("platformGameOverlay");
const gameStartScreen = document.getElementById("gameStartScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameScoreDisplay = document.getElementById("gameScore");
const finalScoreDisplay = document.getElementById("finalScore");

let capybara;
let platforms = [];
let score;
let gameRunning;
let gameFrame;
let cameraY = 0;
let maxHeight = 0;

const CAPYBARA_SIZE = 40;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const JUMP_STRENGTH = -12;
const GRAVITY = 0.4;
const PLATFORM_SPEED = 1;
const CAMERA_FOLLOW_SPEED = 0.1;

// Cargar imagen del capibara para el juego
let capibaraImage = new Image();
capibaraImage.src = "capibara_normal.png";

let capibaraJumpImage = new Image();
capibaraJumpImage.src = "capibara_saltando.png";

function Capybara() {
    this.x = gameCanvas.width / 2 - CAPYBARA_SIZE / 2;
    this.y = gameCanvas.height - CAPYBARA_SIZE - 20;
    this.width = CAPYBARA_SIZE;
    this.height = CAPYBARA_SIZE;
    this.velocityY = 0;
    this.velocityX = 0;
    this.onGround = false;
    this.jumpCount = 0;
    this.maxJumps = 2; // Doble salto

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Dibujar el capibara usando la imagen
        if (capibaraImage && capibaraImage.complete) {
            if (this.velocityY !== 0) { // Si está saltando o cayendo
                ctx.drawImage(capibaraJumpImage, -this.width/2, -this.height/2, this.width, this.height);
            } else {
                ctx.drawImage(capibaraImage, -this.width/2, -this.height/2, this.width, this.height);
            }
        } else {
            // Fallback si la imagen no carga
            ctx.fillStyle = "#D2691E";
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Ojos
            ctx.fillStyle = "#000";
            ctx.fillRect(-this.width/4, -this.height/4, 4, 4);
            ctx.fillRect(this.width/4 - 4, -this.height/4, 4, 4);
        }
        
        ctx.restore();
    };

    this.update = function() {
        // Aplicar gravedad
        this.velocityY += GRAVITY;
        
        // Actualizar posición
        this.y += this.velocityY;
        this.x += this.velocityX;
        
        // Fricción horizontal
        this.velocityX *= 0.95;
        
        // Mantener dentro de los límites horizontales
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > gameCanvas.width) {
            this.x = gameCanvas.width - this.width;
            this.velocityX = 0;
        }

        // Verificar si cayó fuera de la pantalla
        if (this.y > cameraY + gameCanvas.height + 100) {
            endGame();
        }
        
        // Actualizar altura máxima
        if (this.y < maxHeight) {
            maxHeight = this.y;
            score = Math.max(0, Math.floor((gameCanvas.height - maxHeight) / 10));
            gameScoreDisplay.textContent = score;
        }
    };

    this.jump = function() {
        if (this.jumpCount < this.maxJumps) {
            this.velocityY = JUMP_STRENGTH;
            this.jumpCount++;
            this.onGround = false;
        }
    };
    
    this.moveLeft = function() {
        this.velocityX = Math.max(this.velocityX - 1, -5);
    };
    
    this.moveRight = function() {
        this.velocityX = Math.min(this.velocityX + 1, 5);
    };
}

function Platform(x, y, type = 'normal') {
    this.x = x;
    this.y = y;
    this.width = PLATFORM_WIDTH;
    this.height = PLATFORM_HEIGHT;
    this.type = type;

    this.draw = function() {
        ctx.save();
        
        // Diferentes colores según el tipo
        switch(this.type) {
            case 'spring':
                ctx.fillStyle = "#FF6B6B"; // Rojo para plataformas de resorte
                break;
            case 'moving':
                ctx.fillStyle = "#4ECDC4"; // Turquesa para plataformas móviles
                break;
            default:
                ctx.fillStyle = "#556B2F"; // Verde oscuro para plataformas normales
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Añadir un borde más claro
        ctx.strokeStyle = "#8FBC8F";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    };

    this.update = function() {
        // Las plataformas móviles se mueven horizontalmente
        if (this.type === 'moving') {
            this.x += Math.sin(Date.now() * 0.002 + this.y * 0.01) * 2;
            
            // Mantener dentro de los límites
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > gameCanvas.width) this.x = gameCanvas.width - this.width;
        }
    };
}

function initPlatformGame() {
    capybara = new Capybara();
    platforms = [];
    score = 0;
    cameraY = 0;
    maxHeight = capybara.y;
    gameScoreDisplay.textContent = score;
    gameRunning = false;
    gameStartScreen.style.display = "flex";
    gameOverScreen.style.display = "none";
    gameOverlay.classList.add("active");

    // Generar plataformas iniciales
    generateInitialPlatforms();
}

function generateInitialPlatforms() {
    // Plataforma inicial en el suelo
    platforms.push(new Platform(gameCanvas.width / 2 - PLATFORM_WIDTH / 2, gameCanvas.height - 30));
    
    // Generar plataformas hacia arriba
    for (let i = 1; i < 20; i++) {
        const x = Math.random() * (gameCanvas.width - PLATFORM_WIDTH);
        const y = gameCanvas.height - 100 - (i * 80);
        
        // Determinar tipo de plataforma
        let type = 'normal';
        const rand = Math.random();
        if (rand < 0.1) type = 'spring';
        else if (rand < 0.2) type = 'moving';
        
        platforms.push(new Platform(x, y, type));
    }
}

function generateMorePlatforms() {
    const topPlatform = platforms.reduce((top, platform) => 
        platform.y < top.y ? platform : top, platforms[0]);
    
    // Generar más plataformas arriba
    for (let i = 1; i <= 5; i++) {
        const x = Math.random() * (gameCanvas.width - PLATFORM_WIDTH);
        const y = topPlatform.y - (i * 80);
        
        let type = 'normal';
        const rand = Math.random();
        if (rand < 0.1) type = 'spring';
        else if (rand < 0.2) type = 'moving';
        
        platforms.push(new Platform(x, y, type));
    }
}

function drawBackground() {
    // Calcular el progreso basado en la altura alcanzada
    const progress = Math.max(0, Math.min(1, -maxHeight / 2000)); // Normalizar entre 0 y 1
    
    // Crear gradiente que cambia con la altura
    const gradient = ctx.createLinearGradient(0, 0, 0, gameCanvas.height);
    
    if (progress < 0.3) {
        // Nivel bajo - cielo azul claro
        gradient.addColorStop(0, `hsl(200, 80%, ${80 - progress * 20}%)`);
        gradient.addColorStop(1, `hsl(220, 60%, ${90 - progress * 10}%)`);
    } else if (progress < 0.6) {
        // Nivel medio - atardecer
        const sunsetProgress = (progress - 0.3) / 0.3;
        gradient.addColorStop(0, `hsl(${30 - sunsetProgress * 10}, 70%, ${70 + sunsetProgress * 10}%)`);
        gradient.addColorStop(0.5, `hsl(${15 - sunsetProgress * 5}, 80%, ${60 + sunsetProgress * 20}%)`);
        gradient.addColorStop(1, `hsl(${240 + sunsetProgress * 20}, 60%, ${40 + sunsetProgress * 20}%)`);
    } else {
        // Nivel alto - espacio
        const spaceProgress = (progress - 0.6) / 0.4;
        gradient.addColorStop(0, `hsl(240, ${40 - spaceProgress * 30}%, ${20 - spaceProgress * 15}%)`);
        gradient.addColorStop(1, `hsl(260, ${30 - spaceProgress * 20}%, ${10 - spaceProgress * 8}%)`);
        
        // Añadir estrellas en el espacio
        if (spaceProgress > 0.3) {
            drawStars(spaceProgress);
        }
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, cameraY, gameCanvas.width, gameCanvas.height);
}

function drawStars(intensity) {
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
    
    // Generar estrellas pseudo-aleatorias basadas en la posición de la cámara
    const starCount = Math.floor(intensity * 50);
    for (let i = 0; i < starCount; i++) {
        const x = (i * 37 + cameraY * 0.1) % gameCanvas.width;
        const y = cameraY + (i * 73) % gameCanvas.height;
        const size = 1 + (i % 3);
        
        ctx.fillRect(x, y, size, size);
    }
}

function updateCamera() {
    const targetY = capybara.y - gameCanvas.height * 0.7;
    cameraY += (targetY - cameraY) * CAMERA_FOLLOW_SPEED;
}

function gameLoop() {
    if (!gameRunning) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Actualizar cámara
    updateCamera();
    
    // Dibujar fondo dinámico
    drawBackground();
    
    // Guardar contexto para transformaciones de cámara
    ctx.save();
    ctx.translate(0, -cameraY);

    // Actualizar y dibujar capibara
    capybara.update();
    capybara.draw();

    // Actualizar y dibujar plataformas
    for (let i = platforms.length - 1; i >= 0; i--) {
        const platform = platforms[i];
        platform.update();
        platform.draw();

        // Colisión con el capibara
        if (
            capybara.velocityY > 0 && // Solo si el capibara está cayendo
            capybara.x < platform.x + platform.width &&
            capybara.x + capybara.width > platform.x &&
            capybara.y + capybara.height > platform.y &&
            capybara.y + capybara.height < platform.y + platform.height + 10
        ) {
            capybara.y = platform.y - capybara.height;
            capybara.jumpCount = 0; // Resetear contador de saltos
            capybara.onGround = true;
            
            // Efectos especiales según el tipo de plataforma
            switch(platform.type) {
                case 'spring':
                    capybara.velocityY = JUMP_STRENGTH * 1.5; // Salto más alto
                    break;
                case 'moving':
                    capybara.velocityY = JUMP_STRENGTH;
                    // Transferir algo del movimiento de la plataforma
                    capybara.velocityX += Math.sin(Date.now() * 0.002 + platform.y * 0.01) * 1;
                    break;
                default:
                    capybara.velocityY = JUMP_STRENGTH;
            }
            
            capybara.onGround = false;
        }

        // Eliminar plataformas muy por debajo
        if (platform.y > cameraY + gameCanvas.height + 200) {
            platforms.splice(i, 1);
        }
    }
    
    // Generar más plataformas si es necesario
    if (platforms.length < 15) {
        generateMorePlatforms();
    }

    ctx.restore();

    gameFrame = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameStartScreen.style.display = "none";
    gameRunning = true;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(gameFrame);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = "flex";
}

function restartGame() {
    initPlatformGame();
    startGame();
}

function closeGame() {
    gameOverlay.classList.remove("active");
    // Opcional: pausar o resetear el juego si no se reinicia
    gameRunning = false;
    cancelAnimationFrame(gameFrame);
}

// Controles del juego
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    
    if (gameRunning) {
        switch(e.code) {
            case "Space":
            case "ArrowUp":
                e.preventDefault();
                capybara.jump();
                break;
            case "ArrowLeft":
                capybara.moveLeft();
                break;
            case "ArrowRight":
                capybara.moveRight();
                break;
        }
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// Controles táctiles mejorados
let touchStartX = 0;
let touchStartY = 0;
let isMovingLeft = false;
let isMovingRight = false;

gameCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    touchStartX = touchX;
    touchStartY = touchY;
    
    // Dividir la pantalla en tres zonas: izquierda, centro, derecha
    const canvasWidth = gameCanvas.width;
    const leftZone = canvasWidth * 0.3;
    const rightZone = canvasWidth * 0.7;
    
    if (touchX < leftZone) {
        // Zona izquierda - mover a la izquierda
        isMovingLeft = true;
        capybara.moveLeft();
    } else if (touchX > rightZone) {
        // Zona derecha - mover a la derecha
        isMovingRight = true;
        capybara.moveRight();
    } else {
        // Zona central - saltar
        capybara.jump();
    }
});

gameCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
    // Continuar movimiento si está en la zona correspondiente
    const canvasWidth = gameCanvas.width;
    const leftZone = canvasWidth * 0.3;
    const rightZone = canvasWidth * 0.7;
    
    if (touchX < leftZone && !isMovingLeft) {
        isMovingLeft = true;
        isMovingRight = false;
        capybara.moveLeft();
    } else if (touchX > rightZone && !isMovingRight) {
        isMovingRight = true;
        isMovingLeft = false;
        capybara.moveRight();
    } else if (touchX >= leftZone && touchX <= rightZone) {
        isMovingLeft = false;
        isMovingRight = false;
    }
});

gameCanvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    // Detener movimiento al soltar
    isMovingLeft = false;
    isMovingRight = false;
    
    // Aplicar fricción más rápida al soltar
    capybara.velocityX *= 0.8;
});

// Modificar la función playWithPet para abrir el juego de plataformas
const originalPlayWithPet = playWithPet;
playWithPet = function() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes jugar con una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡Déjala descansar!");
        return;
    }
    
    if (petState.energy < 20) {
        showMessage("😴 Tu mascota está muy cansada para jugar. Necesita dormir.");
        return;
    }

    // Abrir el juego de plataformas
    initPlatformGame();
    showMessage("¡A jugar al Capibara Jump!");

    // Reducir energía y aumentar felicidad después de jugar
    petState.happiness = Math.min(100, petState.happiness + 20);
    petState.energy = Math.max(0, petState.energy - 15);
    petState.hunger = Math.max(0, petState.hunger - 5);
    petState.lastPlayed = Date.now();
    updateDisplay();
    savePetState();
};

// Asegurarse de que el juego de plataformas no se inicie automáticamente
// initPlatformGame(); // Comentar o eliminar esta línea si existe




// Funciones globales para el juego de plataformas
window.startGame = startGame;
window.endGame = endGame;
window.restartGame = restartGame;
window.closeGame = closeGame;
