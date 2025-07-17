// ===== CONFIGURACIÓN INICIAL =====
const TESTING_MODE = true; // Cambiar a false para producción
const STARTING_COINS = TESTING_MODE ? 10000 : 100;

// ===== ESTADO DEL JUEGO =====
let gameState = {
    // Estadísticas básicas
    hunger: 100,
    happiness: 100,
    health: 100,
    energy: 100,
    cleanliness: 100,
    
    // Progreso y experiencia
    level: 1,
    exp: 0,
    expToNext: 100,
    age: 0,
    
    // Recursos
    coins: STARTING_COINS,
    
    // Configuración
    petName: 'Capibara',
    petColor: 'normal',
    
    // Inventario
    inventory: {
        food: {},
        accessories: {},
        decorations: {},
        toys: {},
        special: {}
    },
    
    // Accesorios equipados
    equippedAccessories: [],
    
    // Estado actual
    currentRoom: 'living',
    lastFed: null,
    lastPlayed: null,
    lastCleaned: null,
    lastSlept: null,
    
    // Logros
    achievements: {
        'first_feed': false,
        'first_play': false,
        'first_clean': false,
        'first_sleep': false,
        'level_5': false,
        'level_10': false,
        'rich_player': false,
        'collector': false,
        'por_hermosa': false
    },
    
    // Timestamps
    lastUpdate: Date.now(),
    createdAt: Date.now()
};

// ===== DATOS DE LA TIENDA =====
const shopData = {
    food: [
        { id: 'apple', name: 'Manzana', price: 5, icon: '🍎', effect: '+20 Hambre', hunger: 20 },
        { id: 'banana', name: 'Plátano', price: 8, icon: '🍌', effect: '+30 Hambre', hunger: 30 },
        { id: 'orange', name: 'Naranja', price: 7, icon: '🍊', effect: '+25 Hambre', hunger: 25 },
        { id: 'strawberry', name: 'Fresa', price: 10, icon: '🍓', effect: '+35 Hambre', hunger: 35 },
        { id: 'watermelon', name: 'Sandía', price: 15, icon: '🍉', effect: '+50 Hambre', hunger: 50 },
        { id: 'grapes', name: 'Uvas', price: 12, icon: '🍇', effect: '+40 Hambre', hunger: 40 },
        { id: 'carrot', name: 'Zanahoria', price: 6, icon: '🥕', effect: '+22 Hambre', hunger: 22 },
        { id: 'lettuce', name: 'Lechuga', price: 4, icon: '🥬', effect: '+18 Hambre', hunger: 18 }
    ],
    accessories: [
        { id: 'hat', name: 'Sombrero', price: 50, icon: '🎩', effect: '+5 Felicidad', position: 'head' },
        { id: 'bow', name: 'Moño', price: 30, icon: '🎀', effect: '+3 Felicidad', position: 'head' },
        { id: 'glasses', name: 'Gafas', price: 40, icon: '🤓', effect: '+4 Felicidad', position: 'face' },
        { id: 'crown', name: 'Corona', price: 100, icon: '👑', effect: '+10 Felicidad', position: 'head' },
        { id: 'flower', name: 'Flor', price: 25, icon: '🌸', effect: '+2 Felicidad', position: 'head' },
        { id: 'scarf', name: 'Bufanda', price: 35, icon: '🧣', effect: '+3 Felicidad', position: 'neck' }
    ],
    decorations: [
        { id: 'plant', name: 'Planta', price: 80, icon: '🪴', effect: 'Decoración', room: 'living' },
        { id: 'painting', name: 'Cuadro', price: 120, icon: '🖼️', effect: 'Decoración', room: 'living' },
        { id: 'lamp', name: 'Lámpara', price: 90, icon: '💡', effect: 'Decoración', room: 'bedroom' },
        { id: 'rug', name: 'Alfombra', price: 70, icon: '🪣', effect: 'Decoración', room: 'living' },
        { id: 'clock', name: 'Reloj', price: 110, icon: '🕐', effect: 'Decoración', room: 'living' }
    ],
    toys: [
        { id: 'ball', name: 'Pelota', price: 60, icon: '⚽', effect: '+15 Felicidad', happiness: 15 },
        { id: 'teddy', name: 'Osito', price: 80, icon: '🧸', effect: '+20 Felicidad', happiness: 20 },
        { id: 'puzzle', name: 'Rompecabezas', price: 45, icon: '🧩', effect: '+12 Felicidad', happiness: 12 },
        { id: 'kite', name: 'Cometa', price: 55, icon: '🪁', effect: '+18 Felicidad', happiness: 18 },
        { id: 'frisbee', name: 'Frisbee', price: 40, icon: '🥏', effect: '+14 Felicidad', happiness: 14 },
        { id: 'robot', name: 'Robot', price: 150, icon: '🤖', effect: '+30 Felicidad', happiness: 30 }
    ],
    special: [
        { id: 'medicine', name: 'Medicina', price: 200, icon: '💊', effect: 'Cura completamente', health: 100 },
        { id: 'energy_drink', name: 'Bebida Energética', price: 150, icon: '🥤', effect: 'Restaura energía', energy: 100 },
        { id: 'soap', name: 'Jabón Premium', price: 100, icon: '🧼', effect: 'Limpieza completa', cleanliness: 100 },
        { id: 'vitamin', name: 'Vitaminas', price: 180, icon: '💊', effect: '+50 Salud', health: 50 },
        { id: 'happiness_potion', name: 'Poción de Felicidad', price: 250, icon: '🧪', effect: 'Felicidad máxima', happiness: 100 }
    ]
};

// ===== DATOS DE LOGROS =====
const achievementsData = {
    'first_feed': { name: 'Primera Comida', description: 'Alimenta a tu capibara por primera vez', icon: '🍎', reward: 10 },
    'first_play': { name: 'Primer Juego', description: 'Juega con tu capibara por primera vez', icon: '🎮', reward: 10 },
    'first_clean': { name: 'Primera Limpieza', description: 'Limpia a tu capibara por primera vez', icon: '🧼', reward: 10 },
    'first_sleep': { name: 'Primera Siesta', description: 'Haz dormir a tu capibara por primera vez', icon: '😴', reward: 10 },
    'level_5': { name: 'Nivel 5', description: 'Alcanza el nivel 5', icon: '⭐', reward: 50 },
    'level_10': { name: 'Nivel 10', description: 'Alcanza el nivel 10', icon: '🌟', reward: 100 },
    'rich_player': { name: 'Millonario', description: 'Acumula 1000 monedas', icon: '💰', reward: 0 },
    'collector': { name: 'Coleccionista', description: 'Compra 10 artículos diferentes', icon: '🏆', reward: 200 },
    'por_hermosa': { name: 'Por Hermosa', description: 'Un logro especial para alguien muy especial', icon: '💖', reward: 500 }
};

// ===== CONFIGURACIÓN DE HABITACIONES =====
const roomConfig = {
    living: {
        name: 'Sala',
        actions: [
            { id: 'feed', name: '🍎 Alimentar', class: 'feed-btn' },
            { id: 'play', name: '🎾 Jugar', class: 'play-btn' },
            { id: 'pet', name: '🤗 Acariciar', class: 'play-btn' },
            { id: 'accessories', name: '👒 Accesorios', class: 'shop-btn' }
        ]
    },
    kitchen: {
        name: 'Cocina',
        actions: [
            { id: 'feed', name: '🍽️ Dar Comida', class: 'feed-btn' },
            { id: 'cook', name: '👨‍🍳 Cocinar', class: 'play-btn' },
            { id: 'water', name: '💧 Dar Agua', class: 'heal-btn' },
            { id: 'snack', name: '🍪 Snack', class: 'feed-btn' }
        ]
    },
    bedroom: {
        name: 'Cuarto',
        actions: [
            { id: 'sleep', name: '😴 Dormir', class: 'sleep-btn' },
            { id: 'clean', name: '🛁 Limpiar', class: 'clean-btn' },
            { id: 'heal', name: '💊 Curar', class: 'heal-btn' },
            { id: 'rest', name: '🛌 Descansar', class: 'sleep-btn' }
        ]
    },
    game: {
        name: 'Juegos',
        actions: [
            { id: 'jump_game', name: '🦫 Capibara Jump', class: 'game-btn' },
            { id: 'tic_tac_toe', name: '⭕ Tres en Raya', class: 'game-btn' },
            { id: 'rock_paper', name: '✂️ Piedra Papel Tijera', class: 'game-btn' },
            { id: 'play_toys', name: '🧸 Jugar con Juguetes', class: 'play-btn' }
        ]
    },
    shop: {
        name: 'Tienda',
        actions: []
    }
};

// ===== SISTEMA DE MODALES =====
class ModalSystem {
    static show(title, content, buttons = []) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3>${title}</h3>
                    <div class="modal-body">${content}</div>
                    <div class="modal-buttons">
                        ${buttons.map((btn, index) => 
                            `<button onclick="ModalSystem.resolve(${index}, '${btn.value || btn.text}')" class="${btn.class || ''}">${btn.text}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Cerrar con click fuera del modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    ModalSystem.close();
                    resolve(null);
                }
            });
            
            ModalSystem.currentResolve = resolve;
            ModalSystem.currentModal = overlay;
        });
    }
    
    static resolve(index, value) {
        if (ModalSystem.currentResolve) {
            ModalSystem.currentResolve({ index, value });
            ModalSystem.close();
        }
    }
    
    static close() {
        if (ModalSystem.currentModal) {
            ModalSystem.currentModal.remove();
            ModalSystem.currentModal = null;
            ModalSystem.currentResolve = null;
        }
    }
    
    static showInventory(category) {
        const items = gameState.inventory[category];
        const itemsArray = Object.entries(items).filter(([id, count]) => count > 0);
        
        if (itemsArray.length === 0) {
            return ModalSystem.show(
                `📦 Inventario - ${category}`,
                '<p>No tienes artículos en esta categoría.</p>',
                [{ text: '❌ Cerrar' }]
            );
        }
        
        const content = `
            <div class="inventory-grid">
                ${itemsArray.map(([id, count]) => {
                    const item = shopData[category].find(item => item.id === id);
                    return `
                        <div class="inventory-item" onclick="ModalSystem.useItem('${category}', '${id}')">
                            <div class="item-icon">${item.icon}</div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-count">x${count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        return ModalSystem.show(
            `📦 Inventario - ${category}`,
            content,
            [{ text: '❌ Cerrar' }]
        );
    }
    
    static async useItem(category, itemId) {
        const item = shopData[category].find(item => item.id === itemId);
        const count = gameState.inventory[category][itemId] || 0;
        
        if (count <= 0) {
            return ModalSystem.show('❌ Error', 'No tienes este artículo.', [{ text: 'OK' }]);
        }
        
        // Usar el artículo
        gameState.inventory[category][itemId]--;
        
        if (category === 'food') {
            gameState.hunger = Math.min(100, gameState.hunger + (item.hunger || 0));
            showMessage(`🍽️ ${gameState.petName} comió ${item.name}. +${item.hunger} hambre!`, 'success');
            animatePet('eating');
        } else if (category === 'toys') {
            gameState.happiness = Math.min(100, gameState.happiness + (item.happiness || 0));
            gameState.energy = Math.max(0, gameState.energy - 10);
            showMessage(`🎾 ${gameState.petName} jugó con ${item.name}. +${item.happiness} felicidad!`, 'success');
            animatePet('playing');
            gainExp(5);
        } else if (category === 'special') {
            if (item.health) gameState.health = Math.min(100, gameState.health + item.health);
            if (item.energy) gameState.energy = Math.min(100, gameState.energy + item.energy);
            if (item.cleanliness) gameState.cleanliness = Math.min(100, gameState.cleanliness + item.cleanliness);
            if (item.happiness) gameState.happiness = Math.min(100, gameState.happiness + item.happiness);
            showMessage(`✨ ${gameState.petName} usó ${item.name}. ${item.effect}!`, 'success');
            animatePet('happy');
        }
        
        updateDisplay();
        saveGame();
        ModalSystem.close();
    }
}

// ===== FUNCIONES DE INICIALIZACIÓN =====
function initGame() {
    loadGame();
    updateDisplay();
    changeRoom('living');
    startGameLoop();
    initLottieAnimation();
    
    // Verificar logros al iniciar
    checkAchievements();
    
    console.log('🎮 Capibara Virtual iniciado correctamente');
}

function initLottieAnimation() {
    try {
        if (typeof lottie !== 'undefined') {
            lottie.loadAnimation({
                container: document.getElementById('capyAnimation'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'capibara_dance.json'
            });
        }
    } catch (error) {
        console.log('Lottie animation not available:', error);
    }
}

// ===== FUNCIONES DE GUARDADO =====
function saveGame() {
    try {
        localStorage.setItem('capibaraVirtualSave', JSON.stringify(gameState));
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem('capibaraVirtualSave');
        if (saved) {
            const loadedState = JSON.parse(saved);
            gameState = { ...gameState, ...loadedState };
            
            // Asegurar que las nuevas propiedades existan
            if (!gameState.achievements) gameState.achievements = {};
            if (!gameState.equippedAccessories) gameState.equippedAccessories = [];
            if (!gameState.inventory) {
                gameState.inventory = { food: {}, accessories: {}, decorations: {}, toys: {}, special: {} };
            }
            
            // Actualizar tiempo offline
            const now = Date.now();
            const timeDiff = now - (gameState.lastUpdate || now);
            const hoursOffline = timeDiff / (1000 * 60 * 60);
            
            if (hoursOffline > 1) {
                // Degradar estadísticas por tiempo offline
                const degradation = Math.min(hoursOffline * 2, 30);
                gameState.hunger = Math.max(0, gameState.hunger - degradation);
                gameState.happiness = Math.max(0, gameState.happiness - degradation);
                gameState.energy = Math.max(0, gameState.energy - degradation);
                gameState.cleanliness = Math.max(0, gameState.cleanliness - degradation);
                
                showMessage(`⏰ Tu capibara te extrañó. Estuvo ${Math.floor(hoursOffline)} horas sola.`, 'warning');
            }
            
            gameState.lastUpdate = now;
        }
    } catch (error) {
        console.error('Error al cargar:', error);
    }
}

// ===== FUNCIONES DE ACTUALIZACIÓN =====
function updateDisplay() {
    // Actualizar estadísticas
    updateStat('hunger', gameState.hunger);
    updateStat('happiness', gameState.happiness);
    updateStat('health', gameState.health);
    updateStat('energy', gameState.energy);
    updateStat('cleanliness', gameState.cleanliness);
    
    // Actualizar información
    document.getElementById('petName').textContent = gameState.petName;
    document.getElementById('coinCount').textContent = gameState.coins;
    document.getElementById('petLevel').textContent = gameState.level;
    document.getElementById('expPoints').textContent = gameState.exp;
    document.getElementById('petAge').textContent = Math.floor((Date.now() - gameState.createdAt) / (1000 * 60 * 60 * 24));
    document.getElementById('lastFed').textContent = gameState.lastFed ? 
        new Date(gameState.lastFed).toLocaleString() : 'Nunca';
    
    // Actualizar barra de nivel
    const levelProgress = (gameState.exp / gameState.expToNext) * 100;
    document.getElementById('levelBar').style.width = levelProgress + '%';
    
    // Actualizar sprite de la mascota
    updatePetSprite();
    
    // Actualizar accesorios
    updateAccessories();
    
    // Actualizar estado de ánimo
    updateMood();
}

function updateStat(stat, value) {
    const bar = document.getElementById(stat + 'Bar');
    const valueElement = document.getElementById(stat + 'Value');
    
    if (bar && valueElement) {
        bar.style.width = value + '%';
        valueElement.textContent = Math.round(value) + '%';
        
        // Cambiar color según el valor
        if (value < 20) {
            bar.style.background = 'linear-gradient(90deg, #ff4757, #ff3838)';
        } else if (value < 50) {
            bar.style.background = 'linear-gradient(90deg, #ffa502, #ff6348)';
        } else {
            // Mantener color original
            bar.style.background = '';
        }
    }
}

function updatePetSprite() {
    const sprite = document.getElementById('petSprite');
    let spriteName = 'capibara';
    
    // Determinar color
    if (gameState.petColor !== 'normal') {
        spriteName += '_' + gameState.petColor;
    }
    
    // Determinar estado
    if (gameState.health < 30) {
        spriteName += '_enfermo';
    } else if (gameState.energy < 20) {
        spriteName += '_durmiendo';
    } else if (gameState.happiness < 30) {
        spriteName += '_triste';
    } else if (gameState.happiness > 80) {
        spriteName += '_feliz';
    } else {
        spriteName += '_normal';
    }
    
    sprite.src = spriteName + '.png';
    sprite.alt = gameState.petName;
}

function updateMood() {
    const moodElement = document.getElementById('petMood');
    let mood = '😊';
    
    if (gameState.health < 30) {
        mood = '🤒';
    } else if (gameState.energy < 20) {
        mood = '😴';
    } else if (gameState.happiness < 30) {
        mood = '😢';
    } else if (gameState.happiness > 80) {
        mood = '😍';
    } else if (gameState.hunger < 30) {
        mood = '😋';
    }
    
    moodElement.textContent = mood;
}

function updateAccessories() {
    const container = document.getElementById('petAccessories');
    container.innerHTML = '';
    
    gameState.equippedAccessories.forEach(accessoryId => {
        const accessory = shopData.accessories.find(item => item.id === accessoryId);
        if (accessory) {
            const element = document.createElement('div');
            element.className = 'accessory';
            element.textContent = accessory.icon;
            
            // Posicionar según el tipo de accesorio
            switch (accessory.position) {
                case 'head':
                    element.style.top = '10%';
                    element.style.left = '50%';
                    element.style.transform = 'translateX(-50%)';
                    break;
                case 'face':
                    element.style.top = '30%';
                    element.style.left = '50%';
                    element.style.transform = 'translateX(-50%)';
                    break;
                case 'neck':
                    element.style.top = '50%';
                    element.style.left = '50%';
                    element.style.transform = 'translateX(-50%)';
                    break;
            }
            
            container.appendChild(element);
        }
    });
}

// ===== FUNCIONES DE HABITACIONES =====
function changeRoom(roomName) {
    gameState.currentRoom = roomName;
    
    // Actualizar navegación
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-room="${roomName}"]`).classList.add('active');
    
    // Actualizar contenedor de mascota
    const container = document.getElementById('petContainer');
    container.className = `pet-container ${roomName}`;
    
    // Actualizar acciones
    updateActions(roomName);
    
    // Mostrar tienda si es necesario
    if (roomName === 'shop') {
        openShop();
    } else {
        closeShop();
    }
}

function updateActions(roomName) {
    const container = document.getElementById('actionsContainer');
    const config = roomConfig[roomName];
    
    if (!config || roomName === 'shop') {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = config.actions.map(action => 
        `<button class="action-btn ${action.class}" onclick="performAction('${action.id}')">${action.name}</button>`
    ).join('');
}

// ===== FUNCIONES DE ACCIONES =====
async function performAction(actionId) {
    switch (actionId) {
        case 'feed':
            await feedPet();
            break;
        case 'play':
            await playWithPet();
            break;
        case 'pet':
            await petPet();
            break;
        case 'sleep':
            await sleepPet();
            break;
        case 'clean':
            await cleanPet();
            break;
        case 'heal':
            await healPet();
            break;
        case 'cook':
            await cookFood();
            break;
        case 'water':
            await giveWater();
            break;
        case 'snack':
            await giveSnack();
            break;
        case 'rest':
            await restPet();
            break;
        case 'jump_game':
            openPlatformGame();
            break;
        case 'tic_tac_toe':
            await playTicTacToe();
            break;
        case 'rock_paper':
            await playRockPaperScissors();
            break;
        case 'play_toys':
            await playWithToys();
            break;
        case 'accessories':
            await manageAccessories();
            break;
    }
}

async function feedPet() {
    if (gameState.hunger >= 100) {
        showMessage('🍽️ Tu capibara no tiene hambre ahora.', 'warning');
        return;
    }
    
    // Mostrar opciones de comida
    const foodItems = Object.entries(gameState.inventory.food).filter(([id, count]) => count > 0);
    
    if (foodItems.length === 0) {
        showMessage('🛒 No tienes comida. ¡Ve a la tienda!', 'warning');
        return;
    }
    
    const options = foodItems.map(([id, count]) => {
        const item = shopData.food.find(item => item.id === id);
        return { text: `${item.icon} ${item.name} (x${count})`, value: id };
    });
    
    const result = await ModalSystem.show(
        '🍽️ ¿Qué quieres darle de comer?',
        '<p>Elige la comida para tu capibara:</p>',
        [...options, { text: '❌ Cancelar', value: 'cancel' }]
    );
    
    if (result && result.value !== 'cancel') {
        ModalSystem.useItem('food', result.value);
        gameState.lastFed = Date.now();
        checkAchievement('first_feed');
    }
}

async function playWithPet() {
    if (gameState.energy < 20) {
        showMessage('😴 Tu capibara está muy cansada para jugar.', 'warning');
        return;
    }
    
    gameState.happiness = Math.min(100, gameState.happiness + 15);
    gameState.energy = Math.max(0, gameState.energy - 10);
    gameState.lastPlayed = Date.now();
    
    showMessage('🎾 ¡Tu capibara se divirtió mucho jugando!', 'success');
    animatePet('playing');
    gainExp(3);
    checkAchievement('first_play');
    updateDisplay();
    saveGame();
}

async function petPet() {
    gameState.happiness = Math.min(100, gameState.happiness + 10);
    showMessage('🤗 ¡A tu capibara le encanta que la acaricies!', 'success');
    animatePet('happy');
    gainExp(2);
    updateDisplay();
    saveGame();
}

async function sleepPet() {
    if (gameState.energy >= 100) {
        showMessage('⚡ Tu capibara no está cansada.', 'warning');
        return;
    }
    
    gameState.energy = Math.min(100, gameState.energy + 40);
    gameState.health = Math.min(100, gameState.health + 10);
    gameState.lastSlept = Date.now();
    
    showMessage('😴 Tu capibara durmió una siesta reparadora.', 'success');
    animatePet('sleeping');
    gainExp(2);
    checkAchievement('first_sleep');
    updateDisplay();
    saveGame();
}

async function cleanPet() {
    if (gameState.cleanliness >= 100) {
        showMessage('✨ Tu capibara ya está muy limpia.', 'warning');
        return;
    }
    
    gameState.cleanliness = Math.min(100, gameState.cleanliness + 30);
    gameState.happiness = Math.min(100, gameState.happiness + 5);
    gameState.lastCleaned = Date.now();
    
    showMessage('🛁 ¡Tu capibara está reluciente!', 'success');
    animatePet('happy');
    gainExp(3);
    checkAchievement('first_clean');
    updateDisplay();
    saveGame();
}

async function healPet() {
    if (gameState.health >= 100) {
        showMessage('❤️ Tu capibara está perfectamente sana.', 'warning');
        return;
    }
    
    if (gameState.coins < 20) {
        showMessage('💰 Necesitas 20 monedas para curar a tu capibara.', 'error');
        return;
    }
    
    const result = await ModalSystem.show(
        '💊 Curar Capibara',
        '<p>¿Quieres gastar 20 monedas para curar a tu capibara?</p>',
        [
            { text: '✅ Sí, curar', value: 'yes' },
            { text: '❌ Cancelar', value: 'no' }
        ]
    );
    
    if (result && result.value === 'yes') {
        gameState.coins -= 20;
        gameState.health = Math.min(100, gameState.health + 50);
        showMessage('💊 Tu capibara se siente mucho mejor.', 'success');
        animatePet('happy');
        gainExp(5);
        updateDisplay();
        saveGame();
    }
}

async function cookFood() {
    if (gameState.coins < 15) {
        showMessage('💰 Necesitas 15 monedas para cocinar.', 'error');
        return;
    }
    
    const result = await ModalSystem.show(
        '👨‍🍳 Cocinar Comida',
        '<p>¿Quieres gastar 15 monedas para cocinar una comida especial?</p>',
        [
            { text: '✅ Sí, cocinar', value: 'yes' },
            { text: '❌ Cancelar', value: 'no' }
        ]
    );
    
    if (result && result.value === 'yes') {
        gameState.coins -= 15;
        gameState.hunger = Math.min(100, gameState.hunger + 40);
        gameState.happiness = Math.min(100, gameState.happiness + 10);
        showMessage('🍳 ¡Cocinaste una deliciosa comida!', 'success');
        animatePet('eating');
        gainExp(4);
        updateDisplay();
        saveGame();
    }
}

async function giveWater() {
    gameState.health = Math.min(100, gameState.health + 10);
    gameState.cleanliness = Math.min(100, gameState.cleanliness + 5);
    showMessage('💧 Tu capibara bebió agua fresca.', 'success');
    animatePet('happy');
    gainExp(1);
    updateDisplay();
    saveGame();
}

async function giveSnack() {
    if (gameState.coins < 5) {
        showMessage('💰 Necesitas 5 monedas para un snack.', 'error');
        return;
    }
    
    gameState.coins -= 5;
    gameState.hunger = Math.min(100, gameState.hunger + 15);
    gameState.happiness = Math.min(100, gameState.happiness + 5);
    showMessage('🍪 ¡Tu capibara disfrutó el snack!', 'success');
    animatePet('eating');
    gainExp(2);
    updateDisplay();
    saveGame();
}

async function restPet() {
    gameState.energy = Math.min(100, gameState.energy + 20);
    gameState.happiness = Math.min(100, gameState.happiness + 5);
    showMessage('🛌 Tu capibara descansó un poco.', 'success');
    animatePet('sleeping');
    gainExp(1);
    updateDisplay();
    saveGame();
}

async function playWithToys() {
    const toyItems = Object.entries(gameState.inventory.toys).filter(([id, count]) => count > 0);
    
    if (toyItems.length === 0) {
        showMessage('🧸 No tienes juguetes. ¡Ve a la tienda!', 'warning');
        return;
    }
    
    const options = toyItems.map(([id, count]) => {
        const item = shopData.toys.find(item => item.id === id);
        return { text: `${item.icon} ${item.name} (x${count})`, value: id };
    });
    
    const result = await ModalSystem.show(
        '🧸 ¿Con qué juguete quieres jugar?',
        '<p>Elige un juguete para tu capibara:</p>',
        [...options, { text: '❌ Cancelar', value: 'cancel' }]
    );
    
    if (result && result.value !== 'cancel') {
        ModalSystem.useItem('toys', result.value);
    }
}

async function manageAccessories() {
    await ModalSystem.showInventory('accessories');
}

// ===== FUNCIONES DE MINIJUEGOS =====
async function playTicTacToe() {
    const result = await ModalSystem.show(
        '⭕ Tres en Raya',
        `
        <div class="tic-tac-toe-board" id="ticTacToeBoard">
            ${Array(9).fill(0).map((_, i) => `<div class="tic-cell" onclick="ticTacToeMove(${i})"></div>`).join('')}
        </div>
        <p id="ticTacToeStatus">Tu turno (X)</p>
        `,
        [{ text: '❌ Cerrar', value: 'close' }]
    );
}

async function playRockPaperScissors() {
    const result = await ModalSystem.show(
        '✂️ Piedra, Papel o Tijera',
        '<p>Elige tu opción:</p>',
        [
            { text: '🪨 Piedra', value: 'rock' },
            { text: '📄 Papel', value: 'paper' },
            { text: '✂️ Tijera', value: 'scissors' },
            { text: '❌ Cancelar', value: 'cancel' }
        ]
    );
    
    if (result && result.value !== 'cancel') {
        const playerChoice = result.value;
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        const icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        let resultText = '';
        let coins = 0;
        
        if (playerChoice === computerChoice) {
            resultText = '🤝 ¡Empate!';
            coins = 5;
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            resultText = '🎉 ¡Ganaste!';
            coins = 15;
        } else {
            resultText = '😅 Perdiste';
            coins = 2;
        }
        
        gameState.coins += coins;
        gameState.happiness = Math.min(100, gameState.happiness + 10);
        
        await ModalSystem.show(
            '✂️ Resultado',
            `
            <p>Tú: ${icons[playerChoice]}</p>
            <p>Capibara: ${icons[computerChoice]}</p>
            <p>${resultText}</p>
            <p>+${coins} monedas</p>
            `,
            [{ text: '✅ OK' }]
        );
        
        gainExp(3);
        updateDisplay();
        saveGame();
    }
}

// ===== FUNCIONES DE TIENDA =====
function openShop() {
    document.getElementById('shopModal').classList.add('active');
    changeShopTab('food');
}

function closeShop() {
    document.getElementById('shopModal').classList.remove('active');
}

function changeShopTab(category) {
    // Actualizar tabs
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${category}"]`).classList.add('active');
    
    // Actualizar items
    const container = document.getElementById('shopItems');
    const items = shopData[category];
    
    container.innerHTML = items.map(item => {
        const owned = gameState.inventory[category][item.id] || 0;
        const canAfford = gameState.coins >= item.price;
        const classes = ['shop-item'];
        
        if (owned > 0) classes.push('owned');
        if (canAfford) classes.push('affordable');
        if (!canAfford) classes.push('expensive');
        
        return `
            <div class="${classes.join(' ')}" onclick="buyItem('${category}', '${item.id}')">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.price} 🪙</div>
                <div class="shop-item-effect">${item.effect}</div>
                ${owned > 0 ? `<div class="shop-item-owned">Tienes: ${owned}</div>` : ''}
            </div>
        `;
    }).join('');
}

async function buyItem(category, itemId) {
    const item = shopData[category].find(item => item.id === itemId);
    
    if (gameState.coins < item.price) {
        showMessage('💰 No tienes suficientes monedas.', 'error');
        return;
    }
    
    const result = await ModalSystem.show(
        '🛒 Confirmar Compra',
        `
        <div class="purchase-preview">
            <div class="item-icon-large">${item.icon}</div>
            <h4>${item.name}</h4>
            <p>${item.effect}</p>
            <p class="price">Precio: ${item.price} 🪙</p>
        </div>
        `,
        [
            { text: '✅ Comprar', value: 'buy' },
            { text: '❌ Cancelar', value: 'cancel' }
        ]
    );
    
    if (result && result.value === 'buy') {
        gameState.coins -= item.price;
        
        if (!gameState.inventory[category][itemId]) {
            gameState.inventory[category][itemId] = 0;
        }
        gameState.inventory[category][itemId]++;
        
        showMessage(`🛒 ¡Compraste ${item.name}!`, 'success');
        gainExp(2);
        updateDisplay();
        saveGame();
        changeShopTab(category); // Actualizar la tienda
        checkAchievements();
    }
}

// ===== FUNCIONES DE EXPERIENCIA Y NIVEL =====
function gainExp(amount) {
    gameState.exp += amount;
    
    if (gameState.exp >= gameState.expToNext) {
        levelUp();
    }
}

function levelUp() {
    gameState.level++;
    gameState.exp = 0;
    gameState.expToNext = gameState.level * 100;
    gameState.coins += gameState.level * 10;
    
    showMessage(`🌟 ¡Nivel ${gameState.level}! +${gameState.level * 10} monedas`, 'success');
    animatePet('happy');
    
    checkAchievement('level_5');
    checkAchievement('level_10');
}

// ===== FUNCIONES DE LOGROS =====
function checkAchievements() {
    // Verificar logro de monedas
    if (gameState.coins >= 1000) {
        checkAchievement('rich_player');
    }
    
    // Verificar logro de coleccionista
    const totalItems = Object.values(gameState.inventory).reduce((total, category) => {
        return total + Object.keys(category).length;
    }, 0);
    
    if (totalItems >= 10) {
        checkAchievement('collector');
    }
    
    // Verificar logros de nivel
    if (gameState.level >= 5) {
        checkAchievement('level_5');
    }
    if (gameState.level >= 10) {
        checkAchievement('level_10');
    }
}

function checkAchievement(achievementId) {
    if (!gameState.achievements[achievementId]) {
        gameState.achievements[achievementId] = true;
        const achievement = achievementsData[achievementId];
        
        if (achievement.reward > 0) {
            gameState.coins += achievement.reward;
        }
        
        showMessage(`🏆 ¡Logro desbloqueado! ${achievement.name}`, 'success');
        saveGame();
    }
}

async function showAchievements() {
    const achievementsList = Object.entries(achievementsData).map(([id, achievement]) => {
        const unlocked = gameState.achievements[id];
        return `
            <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${achievement.reward > 0 ? `<div class="achievement-reward">Recompensa: ${achievement.reward} 🪙</div>` : ''}
                </div>
                <div class="achievement-status">${unlocked ? '✅' : '🔒'}</div>
            </div>
        `;
    }).join('');
    
    await ModalSystem.show(
        '🏆 Logros',
        `<div class="achievements-list">${achievementsList}</div>`,
        [{ text: '❌ Cerrar' }]
    );
}

// ===== FUNCIONES DE CONFIGURACIÓN =====
async function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('petNameInput').value = gameState.petName;
    
    // Actualizar selección de color
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-color="${gameState.petColor}"]`).classList.add('selected');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function changePetColor(color) {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
}

function saveSettings() {
    const newName = document.getElementById('petNameInput').value.trim();
    const selectedColor = document.querySelector('.color-btn.selected').dataset.color;
    
    if (newName && newName.length <= 15) {
        gameState.petName = newName;
    }
    
    gameState.petColor = selectedColor;
    
    updateDisplay();
    saveGame();
    closeSettings();
    showMessage('⚙️ Configuración guardada.', 'success');
}

// ===== FUNCIONES DE ANIMACIÓN =====
function animatePet(animation) {
    const sprite = document.getElementById('petSprite');
    sprite.classList.remove('eating', 'playing', 'sleeping', 'happy', 'sick');
    
    setTimeout(() => {
        sprite.classList.add(animation);
    }, 50);
    
    setTimeout(() => {
        sprite.classList.remove(animation);
    }, 2000);
}

function showMessage(text, type = 'info') {
    const messageElement = document.getElementById('statusMessage');
    messageElement.textContent = text;
    messageElement.className = `status-message ${type}`;
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        messageElement.textContent = '😊 ¡Tu mascota está feliz y saludable!';
        messageElement.className = 'status-message';
    }, 3000);
}

// ===== FUNCIONES DE JUEGO PRINCIPAL =====
function startGameLoop() {
    setInterval(() => {
        // Degradar estadísticas lentamente
        const degradationRate = 0.1; // Muy lento para que sea más difícil que muera
        
        gameState.hunger = Math.max(0, gameState.hunger - degradationRate);
        gameState.happiness = Math.max(0, gameState.happiness - degradationRate * 0.5);
        gameState.energy = Math.max(0, gameState.energy - degradationRate * 0.3);
        gameState.cleanliness = Math.max(0, gameState.cleanliness - degradationRate * 0.2);
        
        // Verificar muerte (solo si todas las estadísticas están muy bajas por mucho tiempo)
        const criticalStats = [gameState.hunger, gameState.health, gameState.happiness].filter(stat => stat < 10);
        if (criticalStats.length >= 3) {
            // La mascota está en estado crítico, pero no muere inmediatamente
            gameState.health = Math.max(0, gameState.health - degradationRate * 2);
            
            if (gameState.health <= 0) {
                showMessage('💔 Tu capibara está muy enferma. ¡Necesita cuidados urgentes!', 'error');
            }
        } else {
            // Recuperar salud lentamente si las otras estadísticas están bien
            if (gameState.hunger > 50 && gameState.happiness > 50) {
                gameState.health = Math.min(100, gameState.health + 0.1);
            }
        }
        
        gameState.lastUpdate = Date.now();
        updateDisplay();
        saveGame();
    }, 30000); // Cada 30 segundos
}

function resetPet() {
    if (confirm('¿Estás seguro de que quieres reiniciar tu mascota? Se perderá todo el progreso.')) {
        localStorage.removeItem('capibaraVirtualSave');
        location.reload();
    }
}

// ===== JUEGO DE PLATAFORMAS MEJORADO =====
let platformGame = {
    canvas: null,
    ctx: null,
    player: null,
    platforms: [],
    score: 0,
    gameRunning: false,
    keys: {},
    camera: { y: 0 },
    
    // Configuración optimizada para móviles
    config: {
        GRAVITY: 0.5,
        JUMP_STRENGTH: -15,
        PLAYER_SPEED: 6,
        PLATFORM_SPEED: 1
    }
};

function openPlatformGame() {
    document.getElementById('platformGameOverlay').classList.add('active');
    document.getElementById('gameStartScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    if (!platformGame.canvas) {
        platformGame.canvas = document.getElementById('gameCanvas');
        platformGame.ctx = platformGame.canvas.getContext('2d');
        setupPlatformGameControls();
    }
}

function closeGame() {
    document.getElementById('platformGameOverlay').classList.remove('active');
    platformGame.gameRunning = false;
}

function startGame() {
    document.getElementById('gameStartScreen').style.display = 'none';
    initPlatformGame();
    platformGame.gameRunning = true;
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    startGame();
}

function setupPlatformGameControls() {
    const canvas = platformGame.canvas;
    
    // Controles táctiles mejorados
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const canvasWidth = rect.width;
        
        if (x < canvasWidth / 3) {
            // Lado izquierdo - mover izquierda
            platformGame.keys['ArrowLeft'] = true;
        } else if (x > (canvasWidth * 2) / 3) {
            // Lado derecho - mover derecha
            platformGame.keys['ArrowRight'] = true;
        } else {
            // Centro - saltar
            platformGame.keys['Space'] = true;
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        // Limpiar todas las teclas al soltar
        platformGame.keys = {};
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // Controles de teclado para PC
    document.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
            platformGame.keys[e.code] = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
            platformGame.keys[e.code] = false;
        }
    });
}

function initPlatformGame() {
    platformGame.score = 0;
    platformGame.camera.y = 0;
    
    // Inicializar jugador
    platformGame.player = {
        x: 150,
        y: 400,
        width: 30,
        height: 30,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        color: '#8B4513'
    };
    
    // Generar plataformas iniciales
    platformGame.platforms = [];
    for (let i = 0; i < 20; i++) {
        platformGame.platforms.push({
            x: Math.random() * 200 + 50,
            y: 450 - i * 80,
            width: 80 + Math.random() * 40,
            height: 15,
            color: '#228B22'
        });
    }
    
    document.getElementById('gameScore').textContent = platformGame.score;
}

function gameLoop() {
    if (!platformGame.gameRunning) return;
    
    updatePlatformGame();
    renderPlatformGame();
    requestAnimationFrame(gameLoop);
}

function updatePlatformGame() {
    const player = platformGame.player;
    const config = platformGame.config;
    
    // Movimiento horizontal
    if (platformGame.keys['ArrowLeft']) {
        player.velocityX = -config.PLAYER_SPEED;
    } else if (platformGame.keys['ArrowRight']) {
        player.velocityX = config.PLAYER_SPEED;
    } else {
        player.velocityX *= 0.8; // Fricción
    }
    
    // Salto
    if (platformGame.keys['Space'] && player.onGround) {
        player.velocityY = config.JUMP_STRENGTH;
        player.onGround = false;
    }
    
    // Gravedad
    player.velocityY += config.GRAVITY;
    
    // Actualizar posición
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Límites horizontales
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > 300) player.x = 300 - player.width;
    
    // Colisiones con plataformas
    player.onGround = false;
    for (let platform of platformGame.platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
        }
    }
    
    // Actualizar cámara
    if (player.y < platformGame.camera.y + 200) {
        platformGame.camera.y = player.y - 200;
    }
    
    // Actualizar puntuación
    const newScore = Math.max(0, Math.floor((450 - player.y) / 10));
    if (newScore > platformGame.score) {
        platformGame.score = newScore;
        document.getElementById('gameScore').textContent = platformGame.score;
    }
    
    // Generar nuevas plataformas
    while (platformGame.platforms[platformGame.platforms.length - 1].y > platformGame.camera.y - 200) {
        const lastPlatform = platformGame.platforms[platformGame.platforms.length - 1];
        platformGame.platforms.push({
            x: Math.random() * 200 + 50,
            y: lastPlatform.y - 80 - Math.random() * 40,
            width: 80 + Math.random() * 40,
            height: 15,
            color: '#228B22'
        });
    }
    
    // Game Over
    if (player.y > platformGame.camera.y + 600) {
        endPlatformGame();
    }
}

function renderPlatformGame() {
    const ctx = platformGame.ctx;
    const camera = platformGame.camera;
    
    // Limpiar canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 300, 500);
    
    // Dibujar plataformas
    for (let platform of platformGame.platforms) {
        if (platform.y > camera.y - 50 && platform.y < camera.y + 550) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y - camera.y, platform.width, platform.height);
        }
    }
    
    // Dibujar jugador
    const player = platformGame.player;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y - camera.y, player.width, player.height);
    
    // Dibujar ojos del jugador
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 8, player.y - camera.y + 8, 4, 4);
    ctx.fillRect(player.x + 18, player.y - camera.y + 8, 4, 4);
}

function endPlatformGame() {
    platformGame.gameRunning = false;
    
    // Calcular recompensas
    const coinsEarned = Math.floor(platformGame.score / 10) + 5;
    gameState.coins += coinsEarned;
    
    // Mostrar pantalla de game over
    document.getElementById('finalScore').textContent = platformGame.score;
    document.getElementById('coinsEarned').textContent = coinsEarned;
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    gainExp(Math.floor(platformGame.score / 20) + 1);
    updateDisplay();
    saveGame();
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initGame);
