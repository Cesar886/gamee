// ===== MODELOS DE DATOS =====

class GameModel {
    constructor(id, name, description, minigameFunction, energyCost = 10, rewardCoins = 5) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.minigameFunction = minigameFunction;
        this.energyCost = energyCost;
        this.rewardCoins = rewardCoins;
        this.timesPlayed = 0;
        this.highScore = 0;
    }

    canPlay(petState) {
        return petState.energy >= this.energyCost && petState.health > 0 && !petState.isSleeping;
    }

    play(petState) {
        if (!this.canPlay(petState)) return false;
        
        this.timesPlayed++;
        petState.energy = Math.max(0, petState.energy - this.energyCost);
        
        if (typeof this.minigameFunction === 'function') {
            this.minigameFunction();
        }
        
        return true;
    }
}

class Achievement {
    constructor(id, name, description, icon, condition, reward = 0, hidden = false) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.condition = condition;
        this.reward = reward;
        this.hidden = hidden;
        this.unlocked = false;
        this.unlockedAt = null;
    }

    check(petState, gameData) {
        if (this.unlocked) return false;
        
        if (typeof this.condition === 'function' && this.condition(petState, gameData)) {
            this.unlock(petState);
            return true;
        }
        
        return false;
    }

    unlock(petState) {
        this.unlocked = true;
        this.unlockedAt = Date.now();
        petState.coins += this.reward;
        
        showNotificationModal(
            '🏆 ¡Logro Desbloqueado!',
            `${this.icon} ${this.name}\n${this.description}\n+${this.reward} monedas`
        );
    }
}

class InventoryItem {
    constructor(id, name, icon, type, category, price, description, effect = null, value = 0) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type; // 'consumable', 'accessory', 'decoration', 'toy'
        this.category = category; // 'food', 'accessories', 'decorations', 'toys', 'special'
        this.price = price;
        this.description = description;
        this.effect = effect; // 'hunger', 'happiness', 'health', 'energy', 'cleanliness', 'all'
        this.value = value;
        this.quantity = 0;
        this.equipped = false;
    }

    canUse(petState) {
        if (this.type === 'consumable') {
            return this.quantity > 0 && petState.health > 0;
        } else if (this.type === 'accessory') {
            return this.quantity > 0;
        } else if (this.type === 'decoration' || this.type === 'toy') {
            return this.quantity > 0;
        }
        return false;
    }

    use(petState) {
        if (!this.canUse(petState)) return false;

        if (this.type === 'consumable') {
            this.quantity--;
            this.applyEffect(petState);
            return true;
        } else if (this.type === 'accessory') {
            this.toggleEquip(petState);
            return true;
        } else if (this.type === 'decoration') {
            this.useDecoration(petState);
            return true;
        } else if (this.type === 'toy') {
            this.playWithToy(petState);
            return true;
        }

        return false;
    }

    applyEffect(petState) {
        if (this.effect === 'all') {
            petState.hunger = Math.min(100, petState.hunger + this.value);
            petState.happiness = Math.min(100, petState.happiness + this.value);
            petState.health = Math.min(100, petState.health + this.value);
            petState.energy = Math.min(100, petState.energy + this.value);
            petState.cleanliness = Math.min(100, petState.cleanliness + this.value);
        } else if (this.effect && petState.hasOwnProperty(this.effect)) {
            petState[this.effect] = Math.min(100, petState[this.effect] + this.value);
        }
    }

    toggleEquip(petState) {
        if (this.equipped) {
            // Desequipar
            this.equipped = false;
            const index = petState.accessories.indexOf(this.id);
            if (index > -1) {
                petState.accessories.splice(index, 1);
            }
        } else {
            // Equipar
            this.equipped = true;
            if (!petState.accessories.includes(this.id)) {
                petState.accessories.push(this.id);
            }
            petState.happiness = Math.min(100, petState.happiness + 10);
        }
    }

    useDecoration(petState) {
        petState.happiness = Math.min(100, petState.happiness + 20);
        petState.energy = Math.min(100, petState.energy + 10);
    }

    playWithToy(petState) {
        const coinsEarned = Math.floor(Math.random() * 10) + 5;
        petState.happiness = Math.min(100, petState.happiness + 25);
        petState.energy = Math.max(0, petState.energy - 15);
        petState.coins += coinsEarned;
        
        showNotificationModal(
            '🧸 ¡Diversión!',
            `${this.icon} ¡Tu mascota se divierte con ${this.name}!\n+${coinsEarned} monedas`
        );
    }
}

class Inventory {
    constructor() {
        this.items = new Map();
    }

    addItem(itemId, quantity = 1) {
        if (this.items.has(itemId)) {
            this.items.get(itemId).quantity += quantity;
        } else {
            const itemData = shopItems.all.find(item => item.id === itemId);
            if (itemData) {
                const item = new InventoryItem(
                    itemData.id,
                    itemData.name,
                    itemData.icon,
                    itemData.type,
                    itemData.category,
                    itemData.price,
                    itemData.description,
                    itemData.effect,
                    itemData.value
                );
                item.quantity = quantity;
                this.items.set(itemId, item);
            }
        }
    }

    removeItem(itemId, quantity = 1) {
        if (this.items.has(itemId)) {
            const item = this.items.get(itemId);
            item.quantity = Math.max(0, item.quantity - quantity);
            if (item.quantity === 0) {
                this.items.delete(itemId);
            }
        }
    }

    getItem(itemId) {
        return this.items.get(itemId) || null;
    }

    getItemsByCategory(category) {
        return Array.from(this.items.values()).filter(item => item.category === category);
    }

    hasItem(itemId) {
        return this.items.has(itemId) && this.items.get(itemId).quantity > 0;
    }

    getQuantity(itemId) {
        return this.items.has(itemId) ? this.items.get(itemId).quantity : 0;
    }

    getAllItems() {
        return Array.from(this.items.values());
    }
}

// ===== ESTADO INICIAL MEJORADO =====

const defaultPetState = {
    name: "Capibara",
    hunger: 100,
    happiness: 100,
    health: 100,
    energy: 100,
    cleanliness: 100,
    age: 0,
    level: 1,
    experience: 0,
    coins: 100,
    color: "normal",
    lastFed: null,
    lastPlayed: null,
    lastHealed: null,
    lastSlept: null,
    lastCleaned: null,
    isSleeping: false,
    createdAt: Date.now(),
    lastUpdate: Date.now(),
    accessories: [],
    dailyGiftClaimed: false,
    lastDailyGift: null
};

let petState = { ...defaultPetState };
let gameInterval;
let currentRoom = "living";
let inventory = new Inventory();
let achievements = new Map();
let games = new Map();

// ===== SISTEMA DE MODALES =====

let confirmCallback = null;
let cancelCallback = null;

function showConfirmModal(title, message, onConfirm, onCancel = null) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
    
    confirmCallback = onConfirm;
    cancelCallback = onCancel;
}

function confirmAction(confirmed) {
    document.getElementById('confirmModal').classList.remove('active');
    
    if (confirmed && confirmCallback) {
        confirmCallback();
    } else if (!confirmed && cancelCallback) {
        cancelCallback();
    }
    
    confirmCallback = null;
    cancelCallback = null;
}

function showNotificationModal(title, message) {
    document.getElementById('notificationTitle').textContent = title;
    document.getElementById('notificationMessage').textContent = message;
    document.getElementById('notificationModal').classList.add('active');
}

function closeNotification() {
    document.getElementById('notificationModal').classList.remove('active');
}

// ===== CONFIGURACIÓN DE JUEGOS =====

function initializeGames() {
    games.set('platformGame', new GameModel(
        'platformGame',
        'Capibara Jump',
        'Salta lo más alto posible',
        initPhaserGame,
        15,
        0 // Las monedas se ganan durante el juego
    ));

    games.set('ticTacToe', new GameModel(
        'ticTacToe',
        'Tres en Raya',
        'Juega contra tu capibara',
        playTicTacToe,
        10,
        15
    ));

    games.set('rockPaperScissors', new GameModel(
        'rockPaperScissors',
        'Piedra Papel Tijera',
        'Clásico juego de estrategia',
        playRockPaperScissors,
        8,
        12
    ));
}

// ===== CONFIGURACIÓN DE LOGROS =====

function initializeAchievements() {
    achievements.set('first_feed', new Achievement(
        'first_feed',
        'Primera Comida',
        'Alimenta a tu mascota por primera vez',
        '🍎',
        (petState) => petState.lastFed !== null,
        10
    ));

    achievements.set('level_5', new Achievement(
        'level_5',
        'Creciendo Fuerte',
        'Alcanza el nivel 5',
        '⭐',
        (petState) => petState.level >= 5,
        50
    ));

    achievements.set('coin_collector', new Achievement(
        'coin_collector',
        'Coleccionista',
        'Acumula 500 monedas',
        '💰',
        (petState) => petState.coins >= 500,
        100
    ));

    achievements.set('happy_pet', new Achievement(
        'happy_pet',
        'Mascota Feliz',
        'Mantén la felicidad al 100% por 1 hora',
        '😍',
        (petState) => petState.happiness === 100,
        25
    ));

    achievements.set('por_hermosa', new Achievement(
        'por_hermosa',
        'Por Hermosa',
        'Tu mascota es simplemente hermosa',
        '💖',
        () => true, // Se desbloquea automáticamente
        20
    ));

    achievements.set('game_master', new Achievement(
        'game_master',
        'Maestro de Juegos',
        'Juega 10 veces cualquier minijuego',
        '🎮',
        (petState, gameData) => {
            const totalGames = Array.from(games.values()).reduce((sum, game) => sum + game.timesPlayed, 0);
            return totalGames >= 10;
        },
        75
    ));

    achievements.set('shopaholic', new Achievement(
        'shopaholic',
        'Comprador Compulsivo',
        'Compra 20 items en la tienda',
        '🛒',
        (petState) => inventory.getAllItems().length >= 20,
        60
    ));
}

// ===== CONFIGURACIÓN MASIVA DE LA TIENDA =====

const shopItems = {
    food: [
        // Frutas
        { id: "apple", name: "Manzana", icon: "🍎", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "consumable", category: "food" },
        { id: "banana", name: "Plátano", icon: "🍌", price: 8, effect: "hunger", value: 30, description: "+30 Hambre", type: "consumable", category: "food" },
        { id: "orange", name: "Naranja", icon: "🍊", price: 7, effect: "hunger", value: 25, description: "+25 Hambre", type: "consumable", category: "food" },
        { id: "strawberry", name: "Fresa", icon: "🍓", price: 10, effect: "hunger", value: 35, description: "+35 Hambre", type: "consumable", category: "food" },
        { id: "watermelon", name: "Sandía", icon: "🍉", price: 15, effect: "hunger", value: 50, description: "+50 Hambre", type: "consumable", category: "food" },
        { id: "grapes", name: "Uvas", icon: "🍇", price: 12, effect: "hunger", value: 28, description: "+28 Hambre", type: "consumable", category: "food" },
        { id: "pineapple", name: "Piña", icon: "🍍", price: 18, effect: "hunger", value: 45, description: "+45 Hambre", type: "consumable", category: "food" },
        { id: "mango", name: "Mango", icon: "🥭", price: 14, effect: "hunger", value: 38, description: "+38 Hambre", type: "consumable", category: "food" },
        { id: "peach", name: "Durazno", icon: "🍑", price: 9, effect: "hunger", value: 26, description: "+26 Hambre", type: "consumable", category: "food" },
        { id: "cherry", name: "Cereza", icon: "🍒", price: 11, effect: "hunger", value: 24, description: "+24 Hambre", type: "consumable", category: "food" },

        // Verduras
        { id: "carrot", name: "Zanahoria", icon: "🥕", price: 6, effect: "hunger", value: 22, description: "+22 Hambre", type: "consumable", category: "food" },
        { id: "lettuce", name: "Lechuga", icon: "🥬", price: 4, effect: "hunger", value: 18, description: "+18 Hambre", type: "consumable", category: "food" },
        { id: "tomato", name: "Tomate", icon: "🍅", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "consumable", category: "food" },
        { id: "cucumber", name: "Pepino", icon: "🥒", price: 4, effect: "hunger", value: 16, description: "+16 Hambre", type: "consumable", category: "food" },
        { id: "corn", name: "Maíz", icon: "🌽", price: 8, effect: "hunger", value: 30, description: "+30 Hambre", type: "consumable", category: "food" },

        // Dulces
        { id: "cake", name: "Pastel", icon: "🎂", price: 25, effect: "happiness", value: 40, description: "+40 Felicidad", type: "consumable", category: "food" },
        { id: "cookie", name: "Galleta", icon: "🍪", price: 12, effect: "happiness", value: 20, description: "+20 Felicidad", type: "consumable", category: "food" },
        { id: "donut", name: "Dona", icon: "🍩", price: 18, effect: "happiness", value: 30, description: "+30 Felicidad", type: "consumable", category: "food" },
        { id: "ice_cream", name: "Helado", icon: "🍦", price: 20, effect: "happiness", value: 35, description: "+35 Felicidad", type: "consumable", category: "food" },
        { id: "candy", name: "Dulce", icon: "🍬", price: 8, effect: "happiness", value: 15, description: "+15 Felicidad", type: "consumable", category: "food" },

        // Medicina y salud
        { id: "medicine", name: "Medicina", icon: "💊", price: 35, effect: "health", value: 50, description: "+50 Salud", type: "consumable", category: "food" },
        { id: "vitamin", name: "Vitamina", icon: "💉", price: 25, effect: "health", value: 30, description: "+30 Salud", type: "consumable", category: "food" },
        { id: "energy_drink", name: "Bebida Energética", icon: "⚡", price: 22, effect: "energy", value: 45, description: "+45 Energía", type: "consumable", category: "food" },
        { id: "coffee", name: "Café", icon: "☕", price: 15, effect: "energy", value: 25, description: "+25 Energía", type: "consumable", category: "food" },
        { id: "soap", name: "Jabón", icon: "🧼", price: 18, effect: "cleanliness", value: 40, description: "+40 Limpieza", type: "consumable", category: "food" }
    ],
    accessories: [
        // Sombreros
        { id: "hat", name: "Sombrero", icon: "🎩", price: 50, type: "accessory", category: "accessories", description: "Sombrero elegante" },
        { id: "cap", name: "Gorra", icon: "🧢", price: 28, type: "accessory", category: "accessories", description: "Gorra deportiva" },
        { id: "crown", name: "Corona", icon: "👑", price: 150, type: "accessory", category: "accessories", description: "Corona real" },
        { id: "beret", name: "Boina", icon: "🎨", price: 35, type: "accessory", category: "accessories", description: "Boina artística" },
        { id: "helmet", name: "Casco", icon: "⛑️", price: 45, type: "accessory", category: "accessories", description: "Casco protector" },

        // Gafas
        { id: "glasses", name: "Gafas", icon: "🤓", price: 30, type: "accessory", category: "accessories", description: "Gafas geniales" },
        { id: "sunglasses", name: "Lentes de Sol", icon: "🕶️", price: 65, type: "accessory", category: "accessories", description: "Lentes cool" },
        { id: "3d_glasses", name: "Gafas 3D", icon: "🥽", price: 40, type: "accessory", category: "accessories", description: "Gafas futuristas" },

        // Joyas
        { id: "necklace", name: "Collar", icon: "📿", price: 60, type: "accessory", category: "accessories", description: "Collar brillante" },
        { id: "earrings", name: "Aretes", icon: "👂", price: 45, type: "accessory", category: "accessories", description: "Aretes elegantes" },
        { id: "watch", name: "Reloj", icon: "⌚", price: 80, type: "accessory", category: "accessories", description: "Reloj de lujo" },

        // Ropa
        { id: "bow", name: "Moño", icon: "🎀", price: 25, type: "accessory", category: "accessories", description: "Moño adorable" },
        { id: "scarf", name: "Bufanda", icon: "🧣", price: 35, type: "accessory", category: "accessories", description: "Bufanda cálida" },
        { id: "tie", name: "Corbata", icon: "👔", price: 40, type: "accessory", category: "accessories", description: "Corbata formal" },
        { id: "backpack", name: "Mochila", icon: "🎒", price: 55, type: "accessory", category: "accessories", description: "Mochila aventurera" }
    ],
    decorations: [
        // Plantas
        { id: "plant", name: "Planta", icon: "🌱", price: 40, type: "decoration", category: "decorations", description: "Planta decorativa" },
        { id: "flower", name: "Flor", icon: "🌸", price: 30, type: "decoration", category: "decorations", description: "Flor hermosa" },
        { id: "cactus", name: "Cactus", icon: "🌵", price: 35, type: "decoration", category: "decorations", description: "Cactus resistente" },

        // Muebles
        { id: "sofa", name: "Sofá", icon: "🛋️", price: 120, type: "decoration", category: "decorations", description: "Sofá cómodo" },
        { id: "chair", name: "Silla", icon: "🪑", price: 60, type: "decoration", category: "decorations", description: "Silla elegante" },
        { id: "table", name: "Mesa", icon: "🪑", price: 80, type: "decoration", category: "decorations", description: "Mesa de madera" },

        // Decoración general
        { id: "painting", name: "Cuadro", icon: "🖼️", price: 70, type: "decoration", category: "decorations", description: "Cuadro artístico" },
        { id: "lamp", name: "Lámpara", icon: "💡", price: 45, type: "decoration", category: "decorations", description: "Lámpara moderna" },
        { id: "mirror", name: "Espejo", icon: "🪞", price: 60, type: "decoration", category: "decorations", description: "Espejo brillante" }
    ],
    toys: [
        // Pelotas
        { id: "ball", name: "Pelota", icon: "⚽", price: 20, type: "toy", category: "toys", description: "Pelota divertida" },
        { id: "basketball", name: "Baloncesto", icon: "🏀", price: 25, type: "toy", category: "toys", description: "Pelota de básquet" },
        { id: "tennis_ball", name: "Pelota de Tenis", icon: "🎾", price: 18, type: "toy", category: "toys", description: "Pelota de tenis" },

        // Peluches
        { id: "teddy", name: "Osito", icon: "🧸", price: 35, type: "toy", category: "toys", description: "Osito de peluche" },
        { id: "dog_plush", name: "Perrito de Peluche", icon: "🐕", price: 40, type: "toy", category: "toys", description: "Perrito suave" },
        { id: "cat_plush", name: "Gatito de Peluche", icon: "🐱", price: 38, type: "toy", category: "toys", description: "Gatito adorable" },

        // Juegos de mesa
        { id: "puzzle", name: "Rompecabezas", icon: "🧩", price: 25, type: "toy", category: "toys", description: "Rompecabezas desafiante" },
        { id: "dice", name: "Dados", icon: "🎲", price: 15, type: "toy", category: "toys", description: "Dados de juego" },
        { id: "cards", name: "Cartas", icon: "🃏", price: 18, type: "toy", category: "toys", description: "Baraja de cartas" }
    ],
    special: [
        { id: "magic_potion", name: "Poción Mágica", icon: "🧪", price: 100, effect: "all", value: 25, description: "+25 a todas las estadísticas", type: "consumable", category: "special" },
        { id: "golden_apple", name: "Manzana Dorada", icon: "🍎✨", price: 80, effect: "happiness", value: 60, description: "+60 Felicidad", type: "consumable", category: "special" },
        { id: "super_medicine", name: "Súper Medicina", icon: "💊⭐", price: 150, effect: "health", value: 100, description: "Salud completa", type: "consumable", category: "special" },
        { id: "energy_crystal", name: "Cristal de Energía", icon: "💎⚡", price: 200, effect: "energy", value: 100, description: "Energía completa", type: "consumable", category: "special" }
    ]
};

// Crear lista unificada de todos los items
shopItems.all = [
    ...shopItems.food,
    ...shopItems.accessories,
    ...shopItems.decorations,
    ...shopItems.toys,
    ...shopItems.special
];

// ===== LIMPIAR LOCALSTORAGE =====

const PET_STORAGE_KEY = "capibaraVirtual_v6_2024";

function clearOldStorage() {
    const oldKeys = ["tamagotchiPet", "tamagotchiPet_v2", "capibaraVirtual_v3", "capibaraVirtual_v3_2024"];
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
}

// ===== SPRITES Y ESTADOS DE LA MASCOTA =====

const petSprites = {
    normal: {
        normal: "capibara_normal.png",
        happy: "capibara_feliz.png",
        sad: "capibara_triste.png",
        sick: "capibara_enfermo.png",
        sleeping: "capibara_durmiendo.png",
        dead: "capibara_enfermo.png"
    },
    golden: {
        normal: "capibara_dorado.png",
        happy: "capibara_dorado_feliz.png",
        sad: "capibara_dorado_triste.png",
        sick: "capibara_dorado_enfermo.png",
        sleeping: "capibara_dorado_durmiendo.png",
        dead: "capibara_dorado_enfermo.png"
    },
    pink: {
        normal: "capibara_rosa.png",
        happy: "capibara_rosa_feliz.png",
        sad: "capibara_rosa_triste.png",
        sick: "capibara_rosa_enfermo.png",
        sleeping: "capibara_rosa_durmiendo.png",
        dead: "capibara_rosa_enfermo.png"
    }
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

// ===== CONFIGURACIÓN DE HABITACIONES =====

const roomConfig = {
    living: {
        name: "Sala",
        actions: [
            { id: "goToKitchen", text: "🍎 Ir a Cocina", class: "feed-btn" },
            { id: "goToGames", text: "🎮 Ir a Juegos", class: "play-btn" },
            { id: "pet", text: "🤗 Acariciar", class: "heal-btn" },
            { id: "clean", text: "🧼 Limpiar", class: "clean-btn" }
        ]
    },
    kitchen: {
        name: "Cocina",
        actions: [
            { id: "feedFromInventory", text: "🍽️ Alimentar", class: "feed-btn" },
            { id: "cook", text: "👨‍🍳 Cocinar", class: "play-btn" },
            { id: "drink", text: "🥤 Beber", class: "heal-btn" },
            { id: "viewFoodInventory", text: "📦 Ver Comida", class: "clean-btn" }
        ]
    },
    bedroom: {
        name: "Dormitorio",
        actions: [
            { id: "sleep", text: "😴 Dormir", class: "sleep-btn" },
            { id: "rest", text: "🏁 Descansar", class: "heal-btn" },
            { id: "dream", text: "💭 Soñar", class: "play-btn" },
            { id: "useDecorations", text: "🎨 Decorar", class: "feed-btn" }
        ]
    },
    game: {
        name: "Juegos",
        actions: [
            { id: "platformGame", text: "🎮 Capibara Jump", class: "game-btn" },
            { id: "ticTacToe", text: "⭕ Tres en Raya", class: "play-btn" },
            { id: "rockPaperScissors", text: "✂️ Piedra Papel Tijera", class: "heal-btn" },
            { id: "playWithToys", text: "🧸 Jugar con Juguetes", class: "game-btn" }
        ]
    },
    shop: {
        name: "Tienda",
        actions: [
            { id: "openShop", text: "🛒 Abrir Tienda", class: "shop-btn" },
            { id: "dailyGift", text: "🎁 Regalo Diario", class: "feed-btn" },
            { id: "showInventoryModal", text: "🎒 Inventario", class: "heal-btn" },
            { id: "manageAccessories", text: "👒 Accesorios", class: "play-btn" }
        ]
    }
};

// ===== INICIALIZAR EL JUEGO =====

function initGame() {
    clearOldStorage();
    initializeGames();
    initializeAchievements();
    loadPetState();
    updateDisplay();
    updateRoomDisplay();
    startGameLoop();
    checkDailyGift();
    
    // Actualizar cada 30 segundos
    gameInterval = setInterval(() => {
        updatePetStats();
        updateDisplay();
        checkAchievements();
        savePetState();
    }, 30000);
}

// ===== CARGAR Y GUARDAR ESTADO =====

function loadPetState() {
    const savedState = localStorage.getItem(PET_STORAGE_KEY);
    if (savedState) {
        const parsed = JSON.parse(savedState);
        petState = { ...defaultPetState, ...parsed };
        
        // Cargar inventario
        if (parsed.inventoryData) {
            inventory = new Inventory();
            parsed.inventoryData.forEach(itemData => {
                inventory.addItem(itemData.id, itemData.quantity);
                if (itemData.equipped) {
                    inventory.getItem(itemData.id).equipped = true;
                }
            });
        }
        
        // Cargar logros
        if (parsed.achievementsData) {
            parsed.achievementsData.forEach(achData => {
                if (achievements.has(achData.id)) {
                    const achievement = achievements.get(achData.id);
                    achievement.unlocked = achData.unlocked;
                    achievement.unlockedAt = achData.unlockedAt;
                }
            });
        }
        
        // Calcular el tiempo transcurrido desde la última actualización
        const timeDiff = Date.now() - petState.lastUpdate;
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));
        
        // Aplicar degradación basada en el tiempo transcurrido
        if (minutesPassed > 0) {
            applyTimeDegradation(minutesPassed);
        }
    }
}

function savePetState() {
    petState.lastUpdate = Date.now();
    
    // Preparar datos del inventario
    const inventoryData = inventory.getAllItems().map(item => ({
        id: item.id,
        quantity: item.quantity,
        equipped: item.equipped
    }));
    
    // Preparar datos de logros
    const achievementsData = Array.from(achievements.values()).map(achievement => ({
        id: achievement.id,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt
    }));
    
    const saveData = {
        ...petState,
        inventoryData,
        achievementsData
    };
    
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(saveData));
}

// ===== DEGRADACIÓN POR TIEMPO =====

function applyTimeDegradation(minutesPassed) {
    if (!petState.isSleeping) {
        petState.hunger = Math.max(0, petState.hunger - (minutesPassed * 0.035));
        petState.happiness = Math.max(0, petState.happiness - (minutesPassed * 0.025));
        petState.energy = Math.max(0, petState.energy - (minutesPassed * 0.02));
        petState.cleanliness = Math.max(0, petState.cleanliness - (minutesPassed * 0.015));
    }
    
    if (petState.hunger < 10 && petState.happiness < 10 && petState.cleanliness < 10) {
        petState.health = Math.max(0, petState.health - (minutesPassed * 0.01));
    }
    
    const daysPassed = Math.floor((Date.now() - petState.createdAt) / (1000 * 60 * 60 * 24));
    petState.age = daysPassed;
}

// ===== ACTUALIZAR ESTADÍSTICAS =====

function updatePetStats() {
    if (petState.isSleeping) {
        petState.energy = Math.min(100, petState.energy + 3);
        petState.hunger = Math.max(0, petState.hunger - 0.1);
        petState.happiness = Math.max(0, petState.happiness - 0.05);
        
        if (petState.energy >= 100) {
            petState.isSleeping = false;
            showMessage("¡Tu mascota se ha despertado y está llena de energía!", "success");
        }
    } else {
        petState.hunger = Math.max(0, petState.hunger - 0.035);
        petState.happiness = Math.max(0, petState.happiness - 0.025);
        petState.energy = Math.max(0, petState.energy - 0.02);
        petState.cleanliness = Math.max(0, petState.cleanliness - 0.015);
        
        if (petState.hunger < 5 && petState.happiness < 5 && petState.energy < 5 && petState.cleanliness < 5) {
            petState.health = Math.max(0, petState.health - 0.01);
        }
    }
    
    if (petState.hunger > 70 && petState.happiness > 70 && petState.energy > 50 && petState.cleanliness > 70 && petState.health < 100) {
        petState.health = Math.min(100, petState.health + 0.1);
    }
    
    updateExperience();
}

// ===== SISTEMA DE EXPERIENCIA =====

function updateExperience() {
    const expNeeded = petState.level * 100;
    if (petState.experience >= expNeeded) {
        petState.level++;
        petState.experience = 0;
        petState.coins += petState.level * 10;
        showMessage(`¡Nivel ${petState.level}! Has ganado ${petState.level * 10} monedas!`, "success");
        addPetAnimation("happy");
    }
}

function gainExperience(amount) {
    petState.experience += amount;
    updateExperience();
}

// ===== ACTUALIZAR VISUALIZACIÓN =====

function updateDisplay() {
    // Actualizar estadísticas visuales
    updateVisualStats();
    
    // Actualizar sprite y estado de la mascota
    updatePetAppearance();
    
    // Actualizar información
    document.getElementById("petAge").textContent = petState.age;
    document.getElementById("petLevel").textContent = petState.level;
    document.getElementById("expPoints").textContent = petState.experience;
    document.getElementById("coinCount").textContent = petState.coins;
    document.getElementById("lastFed").textContent = petState.lastFed ? 
        formatTime(petState.lastFed) : "Nunca";
    
    // Actualizar barra de experiencia
    const expNeeded = petState.level * 100;
    const expProgress = (petState.experience / expNeeded) * 100;
    document.getElementById("levelBar").style.width = expProgress + "%";
    
    // Actualizar nombre de la mascota
    document.getElementById("petName").textContent = petState.name;
    
    // Actualizar accesorios
    updateAccessories();
    
    // Actualizar mensaje de estado
    updateStatusMessage();
}

// ===== ESTADÍSTICAS VISUALES (SIN BARRAS) =====

function updateVisualStats() {
    updateStatHearts('hungerStat', petState.hunger);
    updateStatHearts('happinessStat', petState.happiness);
    updateStatHearts('healthStat', petState.health);
    updateStatHearts('energyStat', petState.energy);
    updateStatHearts('cleanlinessStat', petState.cleanliness);
}

function updateStatHearts(statId, value) {
    const statElement = document.getElementById(statId);
    const hearts = statElement.querySelectorAll('.heart');
    const activeHearts = Math.ceil(value / 20); // 5 corazones = 100%
    
    hearts.forEach((heart, index) => {
        if (index < activeHearts) {
            heart.classList.add('active');
            heart.classList.remove('inactive');
        } else {
            heart.classList.remove('active');
            heart.classList.add('inactive');
        }
    });
    
    // Cambiar color según el valor
    if (value < 20) {
        statElement.classList.add('critical');
        statElement.classList.remove('warning', 'good');
    } else if (value < 50) {
        statElement.classList.add('warning');
        statElement.classList.remove('critical', 'good');
    } else {
        statElement.classList.add('good');
        statElement.classList.remove('critical', 'warning');
    }
}

// ===== RESTO DE FUNCIONES (CONTINUARÁ EN LA SIGUIENTE PARTE) =====

// Continúo con el resto de las funciones...


// ===== ACTUALIZAR APARIENCIA DE LA MASCOTA =====

function updatePetAppearance() {
    const sprite = document.getElementById("petSprite");
    const mood = document.getElementById("petMood");
    const petDisplay = sprite.parentElement;
    
    // Remover clases anteriores
    petDisplay.classList.remove("pet-sleeping", "pet-sick", "pet-happy", "pet-sad");
    
    const colorSprites = petSprites[petState.color] || petSprites.normal;
    
    if (petState.health <= 0) {
        sprite.src = colorSprites.dead;
        mood.textContent = petMoods.dead;
        petDisplay.classList.add("pet-sick");
    } else if (petState.isSleeping) {
        sprite.src = colorSprites.sleeping;
        mood.textContent = petMoods.sleeping;
        petDisplay.classList.add("pet-sleeping");
    } else if (petState.health < 30) {
        sprite.src = colorSprites.sick;
        mood.textContent = petMoods.sick;
        petDisplay.classList.add("pet-sick");
    } else if (petState.happiness < 30) {
        sprite.src = colorSprites.sad;
        mood.textContent = petMoods.sad;
        petDisplay.classList.add("pet-sad");
    } else if (petState.happiness > 80 && petState.hunger > 80) {
        sprite.src = colorSprites.happy;
        mood.textContent = petMoods.excellent;
        petDisplay.classList.add("pet-happy");
    } else if (petState.happiness > 60) {
        sprite.src = colorSprites.normal;
        mood.textContent = petMoods.happy;
    } else {
        sprite.src = colorSprites.normal;
        mood.textContent = petMoods.neutral;
    }
}

// ===== ACTUALIZAR ACCESORIOS =====

function updateAccessories() {
    const accessoriesContainer = document.getElementById("petAccessories");
    accessoriesContainer.innerHTML = "";
    
    petState.accessories.forEach(accessoryId => {
        const item = inventory.getItem(accessoryId);
        if (item && item.equipped) {
            const accessoryElement = document.createElement("div");
            accessoryElement.className = `accessory accessory-${item.id}`;
            accessoryElement.textContent = item.icon;
            accessoryElement.style.position = "absolute";
            accessoryElement.style.fontSize = "1.5em";
            accessoryElement.style.zIndex = "10";
            
            // Posicionar según el tipo de accesorio
            if (item.id.includes("hat") || item.id.includes("crown") || item.id.includes("cap") || item.id.includes("beret") || item.id.includes("helmet")) {
                accessoryElement.style.top = "10px";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (item.id.includes("glasses") || item.id.includes("sunglasses")) {
                accessoryElement.style.top = "45%";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (item.id.includes("necklace") || item.id.includes("tie") || item.id.includes("bow")) {
                accessoryElement.style.top = "60%";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (item.id.includes("backpack")) {
                accessoryElement.style.top = "40%";
                accessoryElement.style.right = "10px";
            } else {
                accessoryElement.style.top = "30%";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            }
            
            accessoriesContainer.appendChild(accessoryElement);
        }
    });
}

// ===== ACTUALIZAR MENSAJE DE ESTADO =====

function updateStatusMessage() {
    let message = "";
    let type = "";
    
    if (petState.health <= 0) {
        message = "💀 ¡Oh no! Tu mascota ha muerto. Presiona 'Reiniciar Mascota' para empezar de nuevo.";
        type = "error";
    } else if (petState.isSleeping) {
        message = "😴 Tu mascota está durmiendo plácidamente...";
        type = "";
    } else if (petState.health < 20) {
        message = "🤒 ¡Tu mascota está muy enferma! Necesita cuidados médicos urgentes.";
        type = "error";
    } else if (petState.hunger < 20) {
        message = "🍎 ¡Tu mascota tiene mucha hambre! Dale algo de comer.";
        type = "warning";
    } else if (petState.happiness < 20) {
        message = "😢 Tu mascota está muy triste. ¡Juega con ella!";
        type = "warning";
    } else if (petState.energy < 20) {
        message = "😴 Tu mascota está muy cansada. Debería dormir un poco.";
        type = "warning";
    } else if (petState.cleanliness < 20) {
        message = "🧼 Tu mascota está muy sucia. ¡Necesita un baño!";
        type = "warning";
    } else if (petState.happiness > 80 && petState.hunger > 80) {
        message = "😍 ¡Tu mascota está súper feliz y saludable!";
        type = "success";
    } else if (petState.happiness > 60 && petState.hunger > 60) {
        message = "😊 Tu mascota está contenta y bien cuidada.";
        type = "success";
    } else {
        message = "😐 Tu mascota está bien, pero podría estar mejor.";
        type = "";
    }
    
    const statusElement = document.getElementById("statusMessage");
    statusElement.textContent = message;
    statusElement.className = "status-message " + type;
}

// ===== SISTEMA DE HABITACIONES =====

function changeRoom(roomId) {
    currentRoom = roomId;
    updateRoomDisplay();
}

function updateRoomDisplay() {
    // Actualizar navegación
    document.querySelectorAll(".room-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.room === currentRoom) {
            btn.classList.add("active");
        }
    });
    
    // Actualizar fondo del contenedor de mascota
    const petContainer = document.getElementById("petContainer");
    petContainer.className = `pet-container ${currentRoom}`;
    
    // Actualizar acciones disponibles
    const actionsContainer = document.getElementById("actionsContainer");
    const roomActions = roomConfig[currentRoom].actions;
    
    actionsContainer.innerHTML = "";
    roomActions.forEach(action => {
        const button = document.createElement("button");
        button.className = `action-btn ${action.class}`;
        button.textContent = action.text;
        button.onclick = () => handleAction(action.id);
        actionsContainer.appendChild(button);
    });
}

// ===== MANEJAR ACCIONES =====

function handleAction(actionId) {
    switch (actionId) {
        // Acciones de la Sala
        case "goToKitchen":
            changeRoom("kitchen");
            showMessage("🍽️ ¡Bienvenido a la cocina! Aquí puedes alimentar a tu mascota.", "success");
            break;
        case "goToGames":
            changeRoom("game");
            showMessage("🎮 ¡Hora de jugar! Elige tu juego favorito.", "success");
            break;
        case "pet":
            petPet();
            break;
        case "clean":
            cleanPet();
            break;
        
        // Acciones de la Cocina
        case "feedFromInventory":
            feedFromInventory();
            break;
        case "cook":
            cookForPet();
            break;
        case "drink":
            giveDrink();
            break;
        case "viewFoodInventory":
            showInventoryModal('food');
            break;
        
        // Acciones del Dormitorio
        case "sleep":
            putToSleep();
            break;
        case "rest":
            restPet();
            break;
        case "dream":
            dreamWithPet();
            break;
        case "useDecorations":
            useDecorations();
            break;
        
        // Acciones de Juegos
        case "platformGame":
            const platformGame = games.get('platformGame');
            if (platformGame && platformGame.canPlay(petState)) {
                platformGame.play(petState);
            } else {
                showNotificationModal("🎮 No puedes jugar", "Tu mascota necesita más energía o está durmiendo.");
            }
            break;
        case "ticTacToe":
            const ticTacToe = games.get('ticTacToe');
            if (ticTacToe && ticTacToe.canPlay(petState)) {
                ticTacToe.play(petState);
            } else {
                showNotificationModal("⭕ No puedes jugar", "Tu mascota necesita más energía o está durmiendo.");
            }
            break;
        case "rockPaperScissors":
            const rps = games.get('rockPaperScissors');
            if (rps && rps.canPlay(petState)) {
                rps.play(petState);
            } else {
                showNotificationModal("✂️ No puedes jugar", "Tu mascota necesita más energía o está durmiendo.");
            }
            break;
        case "playWithToys":
            playWithToys();
            break;
        
        // Acciones de la Tienda
        case "openShop":
            openShop();
            break;
        case "dailyGift":
            claimDailyGift();
            break;
        case "showInventoryModal":
            showInventoryModal();
            break;
        case "manageAccessories":
            showInventoryModal('accessories');
            break;
    }
}

// ===== ACCIONES ESPECÍFICAS =====

function petPet() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "No puedes acariciar a una mascota que ha muerto.");
        return;
    }
    
    petState.happiness = Math.min(100, petState.happiness + 15);
    petState.health = Math.min(100, petState.health + 5);
    
    addPetAnimation("happy");
    gainExperience(3);
    showMessage("🤗 ¡Tu mascota se siente querida!", "success");
    updateDisplay();
    savePetState();
}

function cleanPet() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "No puedes limpiar a una mascota que ha muerto.");
        return;
    }
    
    if (petState.cleanliness >= 95) {
        showMessage("✨ Tu mascota ya está muy limpia.", "success");
        return;
    }
    
    petState.cleanliness = Math.min(100, petState.cleanliness + 40);
    petState.happiness = Math.min(100, petState.happiness + 10);
    petState.lastCleaned = Date.now();
    
    addPetAnimation("happy");
    gainExperience(6);
    showMessage("🧼 ¡Tu mascota está limpia y fresca!", "success");
    updateDisplay();
    savePetState();
}

function putToSleep() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "Tu mascota ya está en el sueño eterno...");
        return;
    }
    
    if (petState.isSleeping) {
        // Despertar
        petState.isSleeping = false;
        showMessage("☀️ ¡Tu mascota se ha despertado!", "success");
    } else {
        // Dormir
        if (petState.energy > 80) {
            showMessage("😊 Tu mascota no tiene sueño ahora. Juega con ella primero.", "warning");
            return;
        }
        
        petState.isSleeping = true;
        addPetAnimation("sleeping");
        showMessage("😴 Tu mascota se ha ido a dormir. ¡Que descanse bien!", "success");
    }
    
    petState.lastSlept = Date.now();
    updateDisplay();
    savePetState();
}

function restPet() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "Tu mascota ya está en el descanso eterno...");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota ya está durmiendo. ¡Déjala descansar!", "warning");
        return;
    }
    
    if (petState.energy > 80) {
        showMessage("😊 Tu mascota no necesita descansar ahora. Está llena de energía.", "warning");
        return;
    }
    
    showMessage("🏁 Tu mascota está descansando... ¡Se siente mejor!", "info");
    
    setTimeout(() => {
        petState.energy = Math.min(100, petState.energy + 20);
        petState.happiness = Math.min(100, petState.happiness + 5);
        
        addPetAnimation("happy");
        gainExperience(5);
        showMessage("🏁 ¡Descanso completado! Tu mascota se siente renovada.", "success");
        updateDisplay();
        savePetState();
    }, 2000);
}

function dreamWithPet() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "Los sueños eternos ya han comenzado...");
        return;
    }
    
    if (!petState.isSleeping) {
        showMessage("😴 Tu mascota necesita estar durmiendo para soñar.", "warning");
        return;
    }
    
    const dreams = [
        { text: "Soñó que era astronauta", icon: "🚀", effect: "energy", value: 5 },
        { text: "Soñó que volaba entre estrellas", icon: "✨", effect: "happiness", value: 10 },
        { text: "Soñó con un jardín infinito", icon: "🌸", effect: "health", value: 8 },
        { text: "Soñó que era un superhéroe", icon: "🦸", effect: "energy", value: 7 },
        { text: "Soñó con una fiesta de cumpleaños", icon: "🎉", effect: "happiness", value: 15 },
        { text: "Soñó que nadaba en un océano de chocolate", icon: "🍫", effect: "happiness", value: 12 }
    ];
    
    const randomDream = dreams[Math.floor(Math.random() * dreams.length)];
    
    petState[randomDream.effect] = Math.min(100, petState[randomDream.effect] + randomDream.value);
    
    addPetAnimation("sleeping");
    gainExperience(8);
    showNotificationModal("💭 Sueño Dulce", `${randomDream.text}. ${randomDream.icon}\nGanó +${randomDream.value} de ${randomDream.effect} extra al despertar.`);
    updateDisplay();
    savePetState();
}

function cookForPet() {
    if (petState.coins < 15) {
        showNotificationModal("💰 Sin monedas", "Necesitas 15 monedas para cocinar.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡No la despiertes!", "warning");
        return;
    }
    
    const dishes = [
        { name: "Sopa", icon: "🍲", hunger: 40, happiness: 15 },
        { name: "Pizza", icon: "🍕", hunger: 50, happiness: 20 },
        { name: "Arroz", icon: "🍚", hunger: 35, happiness: 10 },
        { name: "Pasta", icon: "🍝", hunger: 45, happiness: 18 }
    ];
    
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    
    showMessage("👨‍🍳 Cocinando... ¡Espera un momento!", "info");
    
    setTimeout(() => {
        petState.coins -= 15;
        petState.hunger = Math.min(100, petState.hunger + randomDish.hunger);
        petState.happiness = Math.min(100, petState.happiness + randomDish.happiness);
        petState.energy = Math.min(100, petState.energy + 10);
        
        addPetAnimation("eating");
        gainExperience(12);
        showMessage(`${randomDish.icon} ¡${randomDish.name} lista! Tu capibara está encantado.`, "success");
        updateDisplay();
        savePetState();
    }, 3000);
}

function giveDrink() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "No puedes dar de beber a una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡No la despiertes!", "warning");
        return;
    }
    
    const drinks = ["💧", "🥤", "🥛"];
    const drinkNames = ["agua", "jugo", "leche"];
    const randomIndex = Math.floor(Math.random() * drinks.length);
    const randomDrink = drinks[randomIndex];
    const drinkName = drinkNames[randomIndex];
    
    if (petState.energy >= 95) {
        showMessage("😊 Tu mascota ya no tiene sed.", "success");
        return;
    }
    
    petState.energy = Math.min(100, petState.energy + 20);
    petState.health = Math.min(100, petState.health + 10);
    
    addPetAnimation("happy");
    gainExperience(4);
    showMessage(`${randomDrink} ¡Glup glup! Tu mascota bebió ${drinkName} fresca.`, "success");
    updateDisplay();
    savePetState();
}

function feedFromInventory() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "No puedes alimentar a una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡No la despiertes!", "warning");
        return;
    }
    
    const foodItems = inventory.getItemsByCategory('food');
    if (foodItems.length === 0) {
        showNotificationModal("📦 Sin comida", "No tienes comida en tu inventario. ¡Compra algo en la tienda!");
        return;
    }
    
    showInventoryModal('food');
}

function useDecorations() {
    const decorationItems = inventory.getItemsByCategory('decorations');
    if (decorationItems.length === 0) {
        showNotificationModal("🎨 Sin decoraciones", "No tienes decoraciones. ¡Compra algunas en la tienda!");
        return;
    }
    
    showInventoryModal('decorations');
}

function playWithToys() {
    if (petState.health <= 0) {
        showNotificationModal("💀 No puedes hacer eso", "No puedes jugar con una mascota que ha muerto.");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡Déjala descansar!", "warning");
        return;
    }
    
    const toyItems = inventory.getItemsByCategory('toys');
    if (toyItems.length === 0) {
        showNotificationModal("🧸 Sin juguetes", "No tienes juguetes. ¡Compra algunos en la tienda!");
        return;
    }
    
    if (petState.energy < 15) {
        showMessage("😴 Tu mascota está muy cansada para jugar.", "warning");
        return;
    }
    
    showInventoryModal('toys');
}

// ===== MINIJUEGOS MEJORADOS =====

function playTicTacToe() {
    if (petState.energy < 10) {
        showNotificationModal("😴 Sin energía", "Tu mascota está muy cansada para jugar tres en raya.");
        return;
    }
    
    // Crear tablero interactivo usando modal
    let board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let currentPlayer = "X";
    let gameActive = true;
    
    function displayBoard() {
        return `⭕ TRES EN RAYA ⭕

 ${board[0]} | ${board[1]} | ${board[2]} 
-----------
 ${board[3]} | ${board[4]} | ${board[5]} 
-----------
 ${board[6]} | ${board[7]} | ${board[8]} 

Tu símbolo: X
Capibara: O

Elige tu posición (1-9):`;
    }
    
    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === board[b] && board[b] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    function makeMove(position, player) {
        if (board[position] !== "X" && board[position] !== "O") {
            board[position] = player;
            return true;
        }
        return false;
    }
    
    function aiMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] !== "X" && board[i] !== "O") {
                availableMoves.push(i);
            }
        }
        
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            board[randomMove] = "O";
        }
    }
    
    function playRound() {
        showConfirmModal("⭕ Tres en Raya", displayBoard(), (input) => {
            const position = parseInt(input) - 1;
            
            if (position >= 0 && position <= 8 && makeMove(position, "X")) {
                const winner = checkWinner();
                
                if (winner === "X") {
                    petState.coins += 15;
                    petState.happiness = Math.min(100, petState.happiness + 20);
                    petState.energy = Math.max(0, petState.energy - 10);
                    addPetAnimation("happy");
                    gainExperience(20);
                    showNotificationModal("⭕ ¡GANASTE!", "Excelente estrategia. +15 monedas");
                    gameActive = false;
                } else if (board.every(cell => cell === "X" || cell === "O")) {
                    petState.coins += 8;
                    petState.happiness = Math.min(100, petState.happiness + 10);
                    petState.energy = Math.max(0, petState.energy - 10);
                    addPetAnimation("playing");
                    gainExperience(10);
                    showNotificationModal("⭕ ¡EMPATE!", "Buen juego. +8 monedas");
                    gameActive = false;
                } else {
                    aiMove();
                    const aiWinner = checkWinner();
                    
                    if (aiWinner === "O") {
                        petState.coins += 5;
                        petState.happiness = Math.min(100, petState.happiness + 5);
                        petState.energy = Math.max(0, petState.energy - 10);
                        addPetAnimation("playing");
                        gainExperience(8);
                        showNotificationModal("⭕ Tu capibara ganó", "Pero fue divertido. +5 monedas");
                        gameActive = false;
                    } else if (board.every(cell => cell === "X" || cell === "O")) {
                        petState.coins += 8;
                        petState.happiness = Math.min(100, petState.happiness + 10);
                        petState.energy = Math.max(0, petState.energy - 10);
                        addPetAnimation("playing");
                        gainExperience(10);
                        showNotificationModal("⭕ ¡EMPATE!", "Buen juego. +8 monedas");
                        gameActive = false;
                    } else if (gameActive) {
                        setTimeout(playRound, 500);
                    }
                }
                
                updateDisplay();
                savePetState();
            } else {
                showNotificationModal("❌ Movimiento inválido", "Elige una posición libre del 1 al 9.");
                if (gameActive) {
                    setTimeout(playRound, 1000);
                }
            }
        });
    }
    
    playRound();
}

function playRockPaperScissors() {
    if (petState.energy < 8) {
        showNotificationModal("😴 Sin energía", "Tu mascota está muy cansada para jugar piedra, papel o tijera.");
        return;
    }
    
    const choices = [
        { name: "Piedra", icon: "🪨", beats: "Tijera" },
        { name: "Papel", icon: "📄", beats: "Piedra" },
        { name: "Tijera", icon: "✂️", beats: "Papel" }
    ];
    
    const choiceText = `✂️ PIEDRA, PAPEL O TIJERA ✂️

Elige tu opción:
1. 🪨 Piedra
2. 📄 Papel  
3. ✂️ Tijera

Escribe el número de tu elección (1-3):`;
    
    showConfirmModal("✂️ Piedra Papel Tijera", choiceText, (input) => {
        const userIndex = parseInt(input) - 1;
        
        if (userIndex < 0 || userIndex > 2 || isNaN(userIndex)) {
            showNotificationModal("❌ Opción inválida", "Elige 1, 2 o 3.");
            return;
        }
        
        const playerChoice = choices[userIndex];
        const capibaraChoice = choices[Math.floor(Math.random() * 3)];
        
        petState.happiness = Math.min(100, petState.happiness + 12);
        petState.energy = Math.max(0, petState.energy - 8);
        
        let result = "";
        let coinsEarned = 3;
        
        if (playerChoice.name === capibaraChoice.name) {
            result = "¡EMPATE!";
            coinsEarned = 6;
        } else if (playerChoice.beats === capibaraChoice.name) {
            result = "¡GANASTE!";
            coinsEarned = 12;
        } else {
            result = "¡Tu capibara ganó!";
            coinsEarned = 4;
        }
        
        petState.coins += coinsEarned;
        addPetAnimation("playing");
        gainExperience(10);
        
        const resultMessage = `✂️ RESULTADO ✂️

Tú: ${playerChoice.icon} ${playerChoice.name}
Capibara: ${capibaraChoice.icon} ${capibaraChoice.name}

${result}
+${coinsEarned} monedas`;
        
        showNotificationModal("✂️ Resultado", resultMessage);
        updateDisplay();
        savePetState();
    });
}

// ===== SISTEMA DE ANIMACIONES =====

function addPetAnimation(animationType) {
    const petImage = document.getElementById("petSprite");
    petImage.classList.remove("eating", "playing", "sleeping", "happy", "sick");
    petImage.classList.add(animationType);
    
    setTimeout(() => {
        petImage.classList.remove(animationType);
    }, 1000);
}

// ===== SISTEMA DE TIENDA MEJORADO =====

function openShop() {
    document.getElementById("shopModal").classList.add("active");
    document.getElementById("shopCoinCount").textContent = petState.coins;
    changeShopTab("food");
}

function closeShop() {
    document.getElementById("shopModal").classList.remove("active");
}

function changeShopTab(tab) {
    document.querySelectorAll(".shop-tab").forEach(tabBtn => {
        tabBtn.classList.remove("active");
        if (tabBtn.dataset.tab === tab) {
            tabBtn.classList.add("active");
        }
    });
    
    const shopItemsContainer = document.getElementById("shopItems");
    shopItemsContainer.innerHTML = "";
    
    const items = shopItems[tab] || [];
    items.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "shop-item";
        
        const canAfford = petState.coins >= item.price;
        const hasItem = inventory.hasItem(item.id);
        
        if (hasItem && (item.type === "accessory" || item.type === "decoration" || item.type === "toy")) {
            itemElement.classList.add("owned");
        } else if (canAfford) {
            itemElement.classList.add("affordable");
        } else {
            itemElement.classList.add("expensive");
        }
        
        itemElement.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">${hasItem && item.type !== "consumable" ? "Comprado" : item.price + " 🪙"}</div>
            <div class="shop-item-effect">${item.description}</div>
        `;
        
        if (canAfford && (!hasItem || item.type === "consumable")) {
            itemElement.onclick = () => buyItem(item);
        }
        
        shopItemsContainer.appendChild(itemElement);
    });
}

function buyItem(item) {
    if (petState.coins < item.price) {
        showNotificationModal("💰 Sin monedas", "No tienes suficientes monedas.");
        return;
    }
    
    petState.coins -= item.price;
    inventory.addItem(item.id, 1);
    
    if (item.type === "consumable") {
        showNotificationModal("🛒 Compra exitosa", `Has comprado ${item.name}! Ahora está en tu inventario.`);
    } else {
        showNotificationModal("🛒 Compra exitosa", `Has comprado ${item.name}! Ve al inventario para usarlo.`);
    }
    
    addPetAnimation("happy");
    gainExperience(5);
    updateDisplay();
    savePetState();
    changeShopTab(document.querySelector(".shop-tab.active").dataset.tab);
}

// ===== SISTEMA DE INVENTARIO MEJORADO =====

function showInventoryModal(category = 'food') {
    document.getElementById("inventoryModal").classList.add("active");
    changeInventoryTab(category);
}

function closeInventory() {
    document.getElementById("inventoryModal").classList.remove("active");
}

function changeInventoryTab(category) {
    document.querySelectorAll(".inventory-tab").forEach(tabBtn => {
        tabBtn.classList.remove("active");
        if (tabBtn.dataset.tab === category) {
            tabBtn.classList.add("active");
        }
    });
    
    const inventoryItemsContainer = document.getElementById("inventoryItems");
    inventoryItemsContainer.innerHTML = "";
    
    const items = inventory.getItemsByCategory(category);
    
    if (items.length === 0) {
        inventoryItemsContainer.innerHTML = `
            <div class="empty-inventory">
                <p>No tienes items en esta categoría</p>
                <p>¡Ve a la tienda para comprar!</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "inventory-item";
        
        if (item.equipped) {
            itemElement.classList.add("equipped");
        }
        
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">x${item.quantity}</div>
            ${item.equipped ? '<div class="equipped-badge">Equipado</div>' : ''}
        `;
        
        itemElement.onclick = () => useInventoryItem(item);
        inventoryItemsContainer.appendChild(itemElement);
    });
}

function useInventoryItem(item) {
    if (!item.canUse(petState)) {
        showNotificationModal("❌ No se puede usar", "No puedes usar este item ahora.");
        return;
    }
    
    const success = item.use(petState);
    
    if (success) {
        if (item.type === "consumable") {
            showNotificationModal("✅ Item usado", `Has usado ${item.name}!`);
            addPetAnimation("happy");
            gainExperience(5);
        } else if (item.type === "accessory") {
            const action = item.equipped ? "equipado" : "desequipado";
            showNotificationModal("👒 Accesorio", `Has ${action} ${item.name}!`);
            if (item.equipped) {
                addPetAnimation("happy");
                gainExperience(3);
            }
        }
        
        updateDisplay();
        savePetState();
        changeInventoryTab(document.querySelector(".inventory-tab.active").dataset.tab);
    }
}

// ===== SISTEMA DE LOGROS =====

function checkAchievements() {
    achievements.forEach(achievement => {
        achievement.check(petState, { games, inventory });
    });
}

function checkAchievement(achievementId) {
    const achievement = achievements.get(achievementId);
    if (achievement) {
        achievement.check(petState, { games, inventory });
    }
}

function showAchievements() {
    document.getElementById("achievementsModal").classList.add("active");
    
    const achievementsList = document.getElementById("achievementsList");
    achievementsList.innerHTML = "";
    
    achievements.forEach(achievement => {
        const achievementElement = document.createElement("div");
        achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-reward">Recompensa: ${achievement.reward} monedas</div>
            </div>
            <div class="achievement-status">${achievement.unlocked ? '✅' : '🔒'}</div>
        `;
        
        achievementsList.appendChild(achievementElement);
    });
}

function closeAchievements() {
    document.getElementById("achievementsModal").classList.remove("active");
}

// ===== SISTEMA DE REGALO DIARIO =====

function checkDailyGift() {
    const today = new Date().toDateString();
    const lastGift = petState.lastDailyGift;
    
    if (lastGift !== today) {
        petState.dailyGiftClaimed = false;
    }
}

function claimDailyGift() {
    const today = new Date().toDateString();
    
    if (petState.dailyGiftClaimed && petState.lastDailyGift === today) {
        showNotificationModal("🎁 Ya reclamado", "Ya has reclamado tu regalo diario. ¡Vuelve mañana!");
        return;
    }
    
    const giftCoins = Math.floor(Math.random() * 20) + 10;
    petState.coins += giftCoins;
    petState.dailyGiftClaimed = true;
    petState.lastDailyGift = today;
    
    addPetAnimation("happy");
    gainExperience(15);
    showNotificationModal("🎁 ¡Regalo diario!", `Has recibido ${giftCoins} monedas!`);
    updateDisplay();
    savePetState();
}

// ===== SISTEMA DE CONFIGURACIÓN =====

function openSettings() {
    document.getElementById("settingsModal").classList.add("active");
    document.getElementById("petNameInput").value = petState.name;
    
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.classList.remove("selected");
        if (btn.dataset.color === petState.color) {
            btn.classList.add("selected");
        }
    });
}

function closeSettings() {
    document.getElementById("settingsModal").classList.remove("active");
}

function changePetColor(color) {
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
    document.querySelector(`[data-color="${color}"]`).classList.add("selected");
}

function saveSettings() {
    const newName = document.getElementById("petNameInput").value.trim();
    const selectedColor = document.querySelector(".color-btn.selected").dataset.color;
    
    if (newName && newName.length <= 15) {
        petState.name = newName;
    }
    
    petState.color = selectedColor;
    
    updateDisplay();
    savePetState();
    closeSettings();
    showMessage("⚙️ Configuración guardada!", "success");
}

function resetPet() {
    showConfirmModal(
        "🔄 Reiniciar Mascota",
        "¿Estás seguro de que quieres reiniciar tu mascota? Se perderá todo el progreso.",
        () => {
            localStorage.removeItem(PET_STORAGE_KEY);
            petState = { ...defaultPetState };
            petState.createdAt = Date.now();
            petState.lastUpdate = Date.now();
            inventory = new Inventory();
            initializeAchievements();
            
            showMessage("🌱 ¡Una nueva mascota ha nacido! Cuídala bien.", "success");
            updateDisplay();
            updateRoomDisplay();
            savePetState();
        }
    );
}

// ===== FUNCIONES AUXILIARES =====

function showMessage(message, type = "") {
    const statusElement = document.getElementById("statusMessage");
    statusElement.textContent = message;
    statusElement.className = "status-message " + type;
    
    setTimeout(() => {
        updateStatusMessage();
    }, 3000);
}

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Hace ${days} día${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    return "Hace un momento";
}

function startGameLoop() {
    setInterval(() => {
        updateDisplay();
    }, 1000);
}

// ===== FUNCIONES GLOBALES =====

window.changeRoom = changeRoom;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.changePetColor = changePetColor;
window.saveSettings = saveSettings;
window.resetPet = resetPet;
window.openShop = openShop;
window.closeShop = closeShop;
window.changeShopTab = changeShopTab;
window.showInventoryModal = showInventoryModal;
window.closeInventory = closeInventory;
window.changeInventoryTab = changeInventoryTab;
window.showAchievements = showAchievements;
window.closeAchievements = closeAchievements;
window.confirmAction = confirmAction;
window.closeNotification = closeNotification;
window.checkAchievement = checkAchievement;
window.gainExperience = gainExperience;
window.updateDisplay = updateDisplay;
window.savePetState = savePetState;

// ===== INICIALIZAR AL CARGAR LA PÁGINA =====

document.addEventListener("DOMContentLoaded", initGame);
window.addEventListener("beforeunload", savePetState);
