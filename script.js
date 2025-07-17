const TESTING_MODE = true; // CAMBIAR A FALSE PARA PRODUCCIÓN
const STARTING_COINS = 10000; // Monedas iniciales en modo de testeo

// Estado inicial mejorado de la mascota
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
    coins: TESTING_MODE ? STARTING_COINS : 100,
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
    inventory: [],
    foodInventory: [],
    decorations: [],
    toys: [],
    dailyGiftClaimed: false,
    lastDailyGift: null
};

let petState = { ...defaultPetState };
let gameInterval;
let currentRoom = "living";

const PET_STORAGE_KEY = "capibaraVirtual_v4_2024";

function clearOldStorage() {
    const oldKeys = ["tamagotchiPet", "tamagotchiPet_v2", "capibaraVirtual_v3", "capibaraVirtual_v3_2024"];
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
}

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
            { id: "inventory", text: "🎒 Inventario", class: "heal-btn" },
            { id: "manageAccessories", text: "👒 Accesorios", class: "play-btn" }
        ]
    }
};

const shopItems = {
    food: [
        { id: "apple", name: "Manzana", icon: "🍎", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },
        { id: "banana", name: "Plátano", icon: "🍌", price: 8, effect: "hunger", value: 30, description: "+30 Hambre", type: "food" },
        { id: "orange", name: "Naranja", icon: "🍊", price: 7, effect: "hunger", value: 25, description: "+25 Hambre", type: "food" },
        { id: "strawberry", name: "Fresa", icon: "🍓", price: 10, effect: "hunger", value: 35, description: "+35 Hambre", type: "food" },
        { id: "watermelon", name: "Sandía", icon: "🍉", price: 15, effect: "hunger", value: 50, description: "+50 Hambre", type: "food" },
        { id: "grapes", name: "Uvas", icon: "🍇", price: 12, effect: "hunger", value: 28, description: "+28 Hambre", type: "food" },
        { id: "pineapple", name: "Piña", icon: "🍍", price: 18, effect: "hunger", value: 45, description: "+45 Hambre", type: "food" },
        { id: "mango", name: "Mango", icon: "🥭", price: 14, effect: "hunger", value: 38, description: "+38 Hambre", type: "food" },
        { id: "peach", name: "Durazno", icon: "🍑", price: 9, effect: "hunger", value: 26, description: "+26 Hambre", type: "food" },
        { id: "cherry", name: "Cereza", icon: "🍒", price: 11, effect: "hunger", value: 24, description: "+24 Hambre", type: "food" },
        { id: "carrot", name: "Zanahoria", icon: "🥕", price: 6, effect: "hunger", value: 22, description: "+22 Hambre", type: "food" },
        { id: "lettuce", name: "Lechuga", icon: "🥬", price: 4, effect: "hunger", value: 18, description: "+18 Hambre", type: "food" },
        { id: "tomato", name: "Tomate", icon: "🍅", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },
        { id: "cucumber", name: "Pepino", icon: "🥒", price: 4, effect: "hunger", value: 16, description: "+16 Hambre", type: "food" },
        { id: "corn", name: "Maíz", icon: "🌽", price: 8, effect: "hunger", value: 30, description: "+30 Hambre", type: "food" },
        { id: "cake", name: "Pastel", icon: "🎂", price: 25, effect: "happiness", value: 40, description: "+40 Felicidad", type: "food" },
        { id: "cookie", name: "Galleta", icon: "🍪", price: 12, effect: "happiness", value: 20, description: "+20 Felicidad", type: "food" },
        { id: "donut", name: "Dona", icon: "🍩", price: 18, effect: "happiness", value: 30, description: "+30 Felicidad", type: "food" },
        { id: "ice_cream", name: "Helado", icon: "🍦", price: 20, effect: "happiness", value: 35, description: "+35 Felicidad", type: "food" },
        { id: "candy", name: "Dulce", icon: "🍬", price: 8, effect: "happiness", value: 15, description: "+15 Felicidad", type: "food" },
        { id: "medicine", name: "Medicina", icon: "💊", price: 35, effect: "health", value: 50, description: "+50 Salud", type: "food" },
        { id: "vitamin", name: "Vitamina", icon: "💉", price: 25, effect: "health", value: 30, description: "+30 Salud", type: "food" },
        { id: "energy_drink", name: "Bebida Energética", icon: "⚡", price: 22, effect: "energy", value: 45, description: "+45 Energía", type: "food" },
        { id: "coffee", name: "Café", icon: "☕", price: 15, effect: "energy", value: 25, description: "+25 Energía", type: "food" },
        { id: "soap", name: "Jabón", icon: "🧼", price: 18, effect: "cleanliness", value: 40, description: "+40 Limpieza", type: "food" }
    ],
    accessories: [
        { id: "hat", name: "Sombrero", icon: "🎩", price: 50, type: "accessory", description: "Sombrero elegante" },
        { id: "cap", name: "Gorra", icon: "🧢", price: 28, type: "accessory", description: "Gorra deportiva" },
        { id: "crown", name: "Corona", icon: "👑", price: 150, type: "accessory", description: "Corona real" },
        { id: "beret", name: "Boina", icon: "🎨", price: 35, type: "accessory", description: "Boina artística" },
        { id: "helmet", name: "Casco", icon: "⛑️", price: 45, type: "accessory", description: "Casco protector" },
        { id: "glasses", name: "Gafas", icon: "🤓", price: 30, type: "accessory", description: "Gafas geniales" },
        { id: "sunglasses", name: "Lentes de Sol", icon: "🕶️", price: 65, type: "accessory", description: "Lentes cool" },
        { id: "3d_glasses", name: "Gafas 3D", icon: "🥽", price: 40, type: "accessory", description: "Gafas futuristas" },
        { id: "necklace", name: "Collar", icon: "📿", price: 60, type: "accessory", description: "Collar brillante" },
        { id: "earrings", name: "Aretes", icon: "👂", price: 45, type: "accessory", description: "Aretes elegantes" },
        { id: "watch", name: "Reloj", icon: "⌚", price: 80, type: "accessory", description: "Reloj de lujo" },
        { id: "bow", name: "Moño", icon: "🎀", price: 25, type: "accessory", description: "Moño adorable" },
        { id: "scarf", name: "Bufanda", icon: "🧣", price: 35, type: "accessory", description: "Bufanda cálida" },
        { id: "tie", name: "Corbata", icon: "👔", price: 40, type: "accessory", description: "Corbata formal" },
        { id: "backpack", name: "Mochila", icon: "🎒", price: 55, type: "accessory", description: "Mochila aventurera" }
    ],
    decorations: [
        { id: "plant", name: "Planta", icon: "🌱", price: 40, type: "decoration", description: "Planta decorativa" },
        { id: "flower", name: "Flor", icon: "🌸", price: 30, type: "decoration", description: "Flor hermosa" },
        { id: "cactus", name: "Cactus", icon: "🌵", price: 35, type: "decoration", description: "Cactus resistente" },
        { id: "sofa", name: "Sofá", icon: "🛋️", price: 120, type: "decoration", description: "Sofá cómodo" },
        { id: "chair", name: "Silla", icon: "🪑", price: 60, type: "decoration", description: "Silla elegante" },
        { id: "table", name: "Mesa", icon: "🪑", price: 80, type: "decoration", description: "Mesa de madera" },
        { id: "painting", name: "Cuadro", icon: "🖼️", price: 70, type: "decoration", description: "Cuadro artístico" },
        { id: "lamp", name: "Lámpara", icon: "💡", price: 45, type: "decoration", description: "Lámpara moderna" },
        { id: "mirror", name: "Espejo", icon: "🪞", price: 60, type: "decoration", description: "Espejo brillante" }
    ],
    toys: [
        { id: "ball", name: "Pelota", icon: "⚽", price: 20, type: "toy", description: "Pelota divertida" },
        { id: "basketball", name: "Baloncesto", icon: "🏀", price: 25, type: "toy", description: "Pelota de básquet" },
        { id: "tennis_ball", name: "Pelota de Tenis", icon: "🎾", price: 18, type: "toy", description: "Pelota de tenis" },
        { id: "teddy", name: "Osito", icon: "🧸", price: 35, type: "toy", description: "Osito de peluche" },
        { id: "dog_plush", name: "Perrito de Peluche", icon: "🐕", price: 40, type: "toy", description: "Perrito suave" },
        { id: "cat_plush", name: "Gatito de Peluche", icon: "🐱", price: 38, type: "toy", description: "Gatito adorable" },
        { id: "puzzle", name: "Rompecabezas", icon: "🧩", price: 25, type: "toy", description: "Rompecabezas desafiante" },
        { id: "dice", name: "Dados", icon: "🎲", price: 15, type: "toy", description: "Dados de juego" },
        { id: "cards", name: "Cartas", icon: "🃏", price: 18, type: "toy", description: "Baraja de cartas" }
    ],
    special: [
        { id: "magic_potion", name: "Poción Mágica", icon: "🧪", price: 100, effect: "all", value: 25, description: "+25 a todas las estadísticas" },
        { id: "golden_apple", name: "Manzana Dorada", icon: "🍎✨", price: 80, effect: "happiness", value: 60, description: "+60 Felicidad" },
        { id: "super_medicine", name: "Súper Medicina", icon: "💊⭐", price: 150, effect: "health", value: 100, description: "Salud completa" },
        { id: "energy_crystal", name: "Cristal de Energía", icon: "💎⚡", price: 200, effect: "energy", value: 100, description: "Energía completa" }
    ]
};

function initGame() {
    clearOldStorage();
    loadPetState();
    updateDisplay();
    updateRoomDisplay();
    startGameLoop();
    checkDailyGift();
    
    gameInterval = setInterval(() => {
        updatePetStats();
        updateDisplay();
        savePetState();
    }, 30000);
}

function loadPetState() {
    const savedState = localStorage.getItem(PET_STORAGE_KEY);
    if (savedState) {
        petState = { ...defaultPetState, ...JSON.parse(savedState) };
        
        const timeDiff = Date.now() - petState.lastUpdate;
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesPassed > 0) {
            applyTimeDegradation(minutesPassed);
        }
    }
}

function savePetState() {
    petState.lastUpdate = Date.now();
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(petState));
}

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

function updateDisplay() {
    updateStatBar("hunger", petState.hunger);
    updateStatBar("happiness", petState.happiness);
    updateStatBar("health", petState.health);
    updateStatBar("energy", petState.energy);
    updateStatBar("cleanliness", petState.cleanliness);
    
    updatePetAppearance();
    
    document.getElementById("petAge").textContent = petState.age;
    document.getElementById("petLevel").textContent = petState.level;
    document.getElementById("expPoints").textContent = petState.experience;
    document.getElementById("coinCount").textContent = petState.coins;
    document.getElementById("lastFed").textContent = petState.lastFed ? 
        formatTime(petState.lastFed) : "Nunca";
    
    const expNeeded = petState.level * 100;
    const expProgress = (petState.experience / expNeeded) * 100;
    document.getElementById("levelBar").style.width = expProgress + "%";
    
    document.getElementById("petName").textContent = petState.name;
    
    updateAccessories();
    
    updateStatusMessage();
}

function updateStatBar(statName, value) {
    const bar = document.getElementById(statName + "Bar");
    const valueSpan = document.getElementById(statName + "Value");
    
    bar.style.width = value + "%";
    valueSpan.textContent = Math.round(value) + "%";
    
    if (value < 20) {
        bar.style.filter = "brightness(0.6) saturate(1.5)";
    } else if (value < 50) {
        bar.style.filter = "brightness(0.8)";
    } else {
        bar.style.filter = "brightness(1)";
    }
}

function updatePetAppearance() {
    const sprite = document.getElementById("petSprite");
    const mood = document.getElementById("petMood");
    const petDisplay = sprite.parentElement;
    
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

function updateAccessories() {
    const accessoriesContainer = document.getElementById("petAccessories");
    accessoriesContainer.innerHTML = "";
    
    petState.accessories.forEach(accessoryId => {
        const accessory = shopItems.accessories.find(item => item.id === accessoryId);
        if (accessory) {
            const accessoryElement = document.createElement("div");
            accessoryElement.className = `accessory accessory-${accessory.id}`;
            accessoryElement.textContent = accessory.icon;
            accessoryElement.style.position = "absolute";
            accessoryElement.style.fontSize = "1.5em";
            accessoryElement.style.zIndex = "10";
            
            if (accessory.id.includes("hat") || accessory.id.includes("crown") || accessory.id.includes("cap") || accessory.id.includes("beret") || accessory.id.includes("helmet")) {
                accessoryElement.style.top = "10px";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (accessory.id.includes("glasses") || accessory.id.includes("sunglasses")) {
                accessoryElement.style.top = "45%";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (accessory.id.includes("necklace") || accessory.id.includes("tie") || accessory.id.includes("bow")) {
                accessoryElement.style.top = "60%";
                accessoryElement.style.left = "50%";
                accessoryElement.style.transform = "translateX(-50%)";
            } else if (accessory.id.includes("backpack")) {
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

function changeRoom(roomId) {
    currentRoom = roomId;
    updateRoomDisplay();
}

function updateRoomDisplay() {
    document.querySelectorAll(".room-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.room === currentRoom) {
            btn.classList.add("active");
        }
    });
    
    const petContainer = document.getElementById("petContainer");
    petContainer.className = `pet-container ${currentRoom}`;
    
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

function handleAction(actionId) {
    switch (actionId) {
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
            viewFoodInventory();
            break;
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
        case "platformGame":
            playPlatformGame();
            break;
        case "ticTacToe":
            playTicTacToe();
            break;
        case "rockPaperScissors":
            playRockPaperScissors();
            break;
        case "playWithToys":
            playWithToys();
            break;
        case "openShop":
            openShop();
            break;
        case "dailyGift":
            claimDailyGift();
            break;
        case "inventory":
            showInventory();
            break;
        case "manageAccessories":
            manageAccessories();
            break;
    }
}

function manageAccessories() {
    if (petState.inventory.length === 0) {
        showMessage("👒 No tienes accesorios. ¡Compra algunos en la tienda!", "warning");
        return;
    }
    
    const accessories = petState.inventory.filter(itemId => {
        return shopItems.accessories.find(acc => acc.id === itemId);
    });
    
    if (accessories.length === 0) {
        showMessage("👒 No tienes accesorios. ¡Compra algunos en la tienda!", "warning");
        return;
    }
    
    let accessoryText = "👒 Gestionar Accesorios:\n\n";
    accessoryText += "ACCESORIOS DISPONIBLES:\n";
    
    accessories.forEach((accessoryId, index) => {
        const accessory = shopItems.accessories.find(item => item.id === accessoryId);
        if (accessory) {
            const isWearing = petState.accessories.includes(accessoryId);
            const status = isWearing ? " (PUESTO)" : " (GUARDADO)";
            accessoryText += `${index + 1}. ${accessory.icon} ${accessory.name}${status}\n`;
        }
    });
    
    accessoryText += "\n¿Qué quieres hacer?\n";
    accessoryText += "Escribe el número del accesorio para ponerlo/quitarlo\n";
    accessoryText += "O escribe 'quitar' para quitar todos los accesorios";
    
    const choice = prompt(accessoryText);
    
    if (choice === "quitar") {
        petState.accessories = [];
        showMessage("👒 Se han quitado todos los accesorios.", "success");
        updateDisplay();
        savePetState();
        return;
    }
    
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex < accessories.length) {
        const selectedAccessoryId = accessories[choiceIndex];
        const selectedAccessory = shopItems.accessories.find(item => item.id === selectedAccessoryId);
        
        if (selectedAccessory) {
            const isWearing = petState.accessories.includes(selectedAccessoryId);
            
            if (isWearing) {
                petState.accessories = petState.accessories.filter(id => id !== selectedAccessoryId);
                showMessage(`👒 Te has quitado ${selectedAccessory.name}.`, "success");
            } else {
                petState.accessories.push(selectedAccessoryId);
                petState.happiness = Math.min(100, petState.happiness + 10);
                showMessage(`👒 Te has puesto ${selectedAccessory.name}! +10 Felicidad`, "success");
                addPetAnimation("happy");
                gainExperience(5);
            }
            
            updateDisplay();
            savePetState();
        }
    } else {
        showMessage("❌ Opción inválida.", "warning");
    }
}

function feedFromInventory() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes alimentar a una mascota que ha muerto.", "error");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡No la despiertes!", "warning");
        return;
    }
    
    if (petState.foodInventory.length === 0) {
        showMessage("📦 No tienes comida en tu inventario. ¡Compra algo en la tienda!", "warning");
        return;
    }
    
    let foodOptions = "🍽️ Elige qué darle de comer:\n\n";
    petState.foodInventory.forEach((foodId, index) => {
        const food = shopItems.food.find(item => item.id === foodId);
        if (food) {
            foodOptions += `${index + 1}. ${food.icon} ${food.name} (${food.description})\n`;
        }
    });
    
    const choice = prompt(foodOptions + "\nEscribe el número de tu elección:");
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex < petState.foodInventory.length) {
        const selectedFoodId = petState.foodInventory[choiceIndex];
        const selectedFood = shopItems.food.find(item => item.id === selectedFoodId);
        
        if (selectedFood) {
            if (selectedFood.effect === "all") {
                petState.hunger = Math.min(100, petState.hunger + selectedFood.value);
                petState.happiness = Math.min(100, petState.happiness + selectedFood.value);
                petState.health = Math.min(100, petState.health + selectedFood.value);
                petState.energy = Math.min(100, petState.energy + selectedFood.value);
                petState.cleanliness = Math.min(100, petState.cleanliness + selectedFood.value);
            } else {
                petState[selectedFood.effect] = Math.min(100, petState[selectedFood.effect] + selectedFood.value);
            }
            
            petState.foodInventory.splice(choiceIndex, 1);
            petState.lastFed = Date.now();
            
            addPetAnimation("eating");
            gainExperience(8);
            showMessage(`${selectedFood.icon} ¡Tu mascota disfrutó ${selectedFood.name}!`, "success");
            updateDisplay();
            savePetState();
        }
    } else {
        showMessage("❌ Opción inválida.", "warning");
    }
}

function viewFoodInventory() {
    if (petState.foodInventory.length === 0) {
        showMessage("📦 Tu inventario de comida está vacío. ¡Compra comida en la tienda!", "warning");
        return;
    }
    
    let inventoryText = "📦 Inventario de Comida:\n\n";
    const foodCounts = {};
    
    petState.foodInventory.forEach(foodId => {
        foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;
    });
    
    Object.keys(foodCounts).forEach(foodId => {
        const food = shopItems.food.find(item => item.id === foodId);
        if (food) {
            inventoryText += `${food.icon} ${food.name} x${foodCounts[foodId]}\n`;
        }
    });
    
    alert(inventoryText);
}

function useDecorations() {
    if (petState.decorations.length === 0) {
        showMessage("🎨 No tienes decoraciones. ¡Compra algunas en la tienda!", "warning");
        return;
    }
    
    let decorationText = "🎨 Decoraciones disponibles:\n\n";
    petState.decorations.forEach((decorationId, index) => {
        const decoration = shopItems.decorations.find(item => item.id === decorationId);
        if (decoration) {
            decorationText += `${index + 1}. ${decoration.icon} ${decoration.name}\n`;
        }
    });
    
    const choice = prompt(decorationText + "\n¿Cuál quieres usar? (Escribe el número):");
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex < petState.decorations.length) {
        const selectedDecorationId = petState.decorations[choiceIndex];
        const selectedDecoration = shopItems.decorations.find(item => item.id === selectedDecorationId);
        
        if (selectedDecoration) {
            petState.happiness = Math.min(100, petState.happiness + 20);
            petState.energy = Math.min(100, petState.energy + 10);
            
            addPetAnimation("happy");
            gainExperience(12);
            showMessage(`${selectedDecoration.icon} ¡Tu mascota disfruta de ${selectedDecoration.name}! +20 Felicidad`, "success");
            updateDisplay();
            savePetState();
        }
    } else {
        showMessage("❌ Opción inválida.", "warning");
    }
}

function playWithToys() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes jugar con una mascota que ha muerto.", "error");
        return;
    }
    
    if (petState.isSleeping) {
        showMessage("😴 Tu mascota está durmiendo. ¡Déjala descansar!", "warning");
        return;
    }
    
    if (petState.toys.length === 0) {
        showMessage("🧸 No tienes juguetes. ¡Compra algunos en la tienda!", "warning");
        return;
    }
    
    if (petState.energy < 15) {
        showMessage("😴 Tu mascota está muy cansada para jugar.", "warning");
        return;
    }
    
    let toyOptions = "🧸 Elige un juguete para jugar:\n\n";
    petState.toys.forEach((toyId, index) => {
        const toy = shopItems.toys.find(item => item.id === toyId);
        if (toy) {
            toyOptions += `${index + 1}. ${toy.icon} ${toy.name}\n`;
        }
    });

    const choice = prompt(toyOptions + "\nEscribe el número de tu elección:");
    const choiceIndex = parseInt(choice) - 1;

    if (choiceIndex >= 0 && choiceIndex < petState.toys.length) {
        const selectedToyId = petState.toys[choiceIndex];
        const selectedToy = shopItems.toys.find(item => item.id === selectedToyId);

        if (selectedToy) {
            const coinsEarned = Math.floor(Math.random() * 10) + 5;
            
            petState.happiness = Math.min(100, petState.happiness + 25);
            petState.energy = Math.max(0, petState.energy - 15);
            petState.coins += coinsEarned;
            
            addPetAnimation("playing");
            gainExperience(15);
            showMessage(`${selectedToy.icon} ¡Tu mascota se divierte con ${selectedToy.name}! +${coinsEarned} monedas`, "success");
            updateDisplay();
            savePetState();
        }
    } else {
        showMessage("❌ Opción inválida.", "warning");
    }
}

function playTicTacToe() {
    if (petState.energy < 10) {
        showMessage("😴 Tu mascota está muy cansada para jugar tres en raya.", "warning");
        return;
    }
    
    let board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let currentPlayer = "X";
    let gameActive = true;
    
    function displayBoard() {
        return `
⭕ TRES EN RAYA ⭕

 ${board[0]} | ${board[1]} | ${board[2]} 
-----------
 ${board[3]} | ${board[4]} | ${board[5]} 
-----------
 ${board[6]} | ${board[7]} | ${board[8]} 

Tu símbolo: X
Capibara: O
        `;
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
    
    while (gameActive) {
        const move = prompt(displayBoard() + "\nElige tu posición (1-9) o 'salir' para terminar:");
        
        if (move === "salir" || move === null) {
            showMessage("⭕ Juego cancelado.", "warning");
            return;
        }
        
        const position = parseInt(move) - 1;
        
        if (position >= 0 && position <= 8 && makeMove(position, "X")) {
            const winner = checkWinner();
            
            if (winner === "X") {
                petState.coins += 15;
                petState.happiness = Math.min(100, petState.happiness + 20);
                petState.energy = Math.max(0, petState.energy - 10);
                addPetAnimation("happy");
                gainExperience(20);
                showMessage("⭕ ¡GANASTE! Excelente estrategia. +15 monedas", "success");
                gameActive = false;
            } else if (board.every(cell => cell === "X" || cell === "O")) {
                petState.coins += 8;
                petState.happiness = Math.min(100, petState.happiness + 10);
                petState.energy = Math.max(0, petState.energy - 10);
                addPetAnimation("playing");
                gainExperience(10);
                showMessage("⭕ ¡EMPATE! Buen juego. +8 monedas", "success");
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
                    alert(displayBoard() + "\n¡Tu capibara ganó! Pero fue divertido. +5 monedas");
                    showMessage("⭕ Tu capibara ganó, pero fue divertido. +5 monedas", "success");
                    gameActive = false;
                } else if (board.every(cell => cell === "X" || cell === "O")) {
                    petState.coins += 8;
                    petState.happiness = Math.min(100, petState.happiness + 10);
                    petState.energy = Math.max(0, petState.energy - 10);
                    addPetAnimation("playing");
                    gainExperience(10);
                    showMessage("⭕ ¡EMPATE! Buen juego. +8 monedas", "success");
                    gameActive = false;
                }
            }
        } else {
            alert("❌ Movimiento inválido. Elige una posición libre del 1 al 9.");
        }
    }
    
    updateDisplay();
    savePetState();
}

function playRockPaperScissors() {
    if (petState.energy < 8) {
        showMessage("😴 Tu mascota está muy cansada para jugar piedra, papel o tijera.", "warning");
        return;
    }
    
    const choices = [
        { name: "Piedra", icon: "🪨", beats: "Tijera" },
        { name: "Papel", icon: "📄", beats: "Piedra" },
        { name: "Tijera", icon: "✂️", beats: "Papel" }
    ];
    
    const choiceText = `
✂️ PIEDRA, PAPEL O TIJERA ✂️

Elige tu opción:
1. 🪨 Piedra
2. 📄 Papel  
3. ✂️ Tijera

Escribe el número de tu elección (1-3):
    `;
    
    const userChoice = prompt(choiceText);
    const userIndex = parseInt(userChoice) - 1;
    
    if (userIndex < 0 || userIndex > 2 || isNaN(userIndex)) {
        showMessage("❌ Opción inválida. Elige 1, 2 o 3.", "warning");
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
    
    const resultMessage = `
✂️ RESULTADO ✂️

Tú: ${playerChoice.icon} ${playerChoice.name}
Capibara: ${capibaraChoice.icon} ${capibaraChoice.name}

${result}
+${coinsEarned} monedas
    `;
    
    alert(resultMessage);
    showMessage(`✂️ ${result} +${coinsEarned} monedas`, "success");
    updateDisplay();
    savePetState();
}

function petPet() {
    if (petState.health <= 0) {
        showMessage("💀 No puedes acariciar a una mascota que ha muerto.", "error");
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
        showMessage("💀 No puedes limpiar a una mascota que ha muerto.", "error");
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
        showMessage("💀 Tu mascota ya está en el sueño eterno...", "error");
        return;
    }
    
    if (petState.isSleeping) {
        petState.isSleeping = false;
        showMessage("☀️ ¡Tu mascota se ha despertado!", "success");
    } else {
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
        showMessage("💀 Tu mascota ya está en el descanso eterno...", "error");
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
        showMessage("💀 Los sueños eternos ya han comenzado...", "error");
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
    showMessage(`💭 ${randomDream.text}. ${randomDream.icon}\nGanó +${randomDream.value} de ${randomDream.effect} extra al despertar.`, "success");
    updateDisplay();
    savePetState();
}

function cookForPet() {
    if (petState.coins < 15) {
        showMessage("💰 Necesitas 15 monedas para cocinar.", "warning");
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
        showMessage("💀 No puedes dar de beber a una mascota que ha muerto.", "error");
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

function playPlatformGame() {
    initPlatformGame();
    showMessage("🎮 ¡A jugar al Capibara Jump!", "success");
}

function addPetAnimation(animationType) {
    const petImage = document.getElementById("petSprite");
    petImage.classList.remove("eating", "playing", "sleeping", "happy", "sick");
    petImage.classList.add(animationType);
    
    setTimeout(() => {
        petImage.classList.remove(animationType);
    }, 1000);
}

function openShop() {
    document.getElementById("shopModal").classList.add("active");
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
        const isOwned = (item.type === "accessory" || item.type === "decoration" || item.type === "toy") && petState.inventory.includes(item.id);
        
        if (isOwned) {
            itemElement.classList.add("owned");
        } else if (canAfford) {
            itemElement.classList.add("affordable");
        } else {
            itemElement.classList.add("expensive");
        }
        
        itemElement.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">${isOwned ? "Comprado" : item.price + " 🪙"}</div>
            <div class="shop-item-effect">${item.description}</div>
        `;
        
        if (!isOwned && canAfford) {
            itemElement.onclick = () => buyItem(item);
        }
        
        shopItemsContainer.appendChild(itemElement);
    });
}

function buyItem(item) {
    if (petState.coins < item.price) {
        showMessage("💰 No tienes suficientes monedas.", "warning");
        return;
    }
    
    petState.coins -= item.price;
    
    if (item.effect) {
        if (item.type === "food") {
            petState.foodInventory.push(item.id);
            showMessage(`🍽️ Has comprado ${item.name}! Ahora está en tu inventario de comida.`, "success");
        } else {
            if (item.effect === "all") {
                petState.hunger = Math.min(100, petState.hunger + item.value);
                petState.happiness = Math.min(100, petState.happiness + item.value);
                petState.health = Math.min(100, petState.health + item.value);
                petState.energy = Math.min(100, petState.energy + item.value);
                petState.cleanliness = Math.min(100, petState.cleanliness + item.value);
                showMessage(`✨ Has usado ${item.name}! +${item.value} a todas las estadísticas`, "success");
            } else {
                petState[item.effect] = Math.min(100, petState[item.effect] + item.value);
                showMessage(`✨ Has usado ${item.name}! +${item.value} ${item.effect}`, "success");
            }
        }
        addPetAnimation("happy");
        gainExperience(5);
    } else if (item.type === "accessory") {
        petState.inventory.push(item.id);
        showMessage(`👒 Has comprado ${item.name}! Ve a 'Accesorios' para ponértelo.`, "success");
        addPetAnimation("happy");
        gainExperience(10);
    } else if (item.type === "decoration") {
        petState.inventory.push(item.id);
        petState.decorations.push(item.id);
        showMessage(`🎨 Has comprado ${item.name}!`, "success");
        gainExperience(8);
    } else if (item.type === "toy") {
        petState.inventory.push(item.id);
        petState.toys.push(item.id);
        showMessage(`🎾 Has comprado ${item.name}!`, "success");
        gainExperience(6);
    }
    
    updateDisplay();
    savePetState();
    changeShopTab(document.querySelector(".shop-tab.active").dataset.tab);
}

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
        showMessage("🎁 Ya has reclamado tu regalo diario. ¡Vuelve mañana!", "warning");
        return;
    }
    
    const giftCoins = Math.floor(Math.random() * 20) + 10;
    petState.coins += giftCoins;
    petState.dailyGiftClaimed = true;
    petState.lastDailyGift = today;
    
    addPetAnimation("happy");
    gainExperience(15);
    showMessage(`🎁 ¡Regalo diario! Has recibido ${giftCoins} monedas!`, "success");
    updateDisplay();
    savePetState();
}

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
    if (confirm("¿Estás seguro de que quieres reiniciar tu mascota? Se perderá todo el progreso.")) {
        localStorage.removeItem(PET_STORAGE_KEY);
        petState = { ...defaultPetState };
        petState.createdAt = Date.now();
        petState.lastUpdate = Date.now();
        
        showMessage("🌱 ¡Una nueva mascota ha nacido! Cuídala bien.", "success");
        updateDisplay();
        updateRoomDisplay();
        savePetState();
    }
}

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

function showInventory() {
    let inventoryText = "🎒 INVENTARIO COMPLETO:\n\n";
    
    if (petState.foodInventory.length > 0) {
        inventoryText += "🍽️ COMIDA:\n";
        const foodCounts = {};
        petState.foodInventory.forEach(foodId => {
            foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;
        });
        Object.keys(foodCounts).forEach(foodId => {
            const food = shopItems.food.find(i => i.id === foodId);
            if (food) {
                inventoryText += `${food.icon} ${food.name} x${foodCounts[foodId]}\n`;
            }
        });
        inventoryText += "\n";
    }
    
    const accessories = petState.inventory.filter(itemId => {
        return shopItems.accessories.find(acc => acc.id === itemId);
    });
    if (accessories.length > 0) {
        inventoryText += "👒 ACCESORIOS:\n";
        accessories.forEach(accessoryId => {
            const accessory = shopItems.accessories.find(i => i.id === accessoryId);
            if (accessory) {
                const isWearing = petState.accessories.includes(accessoryId);
                const status = isWearing ? " (PUESTO)" : "";
                inventoryText += `${accessory.icon} ${accessory.name}${status}\n`;
            }
        });
        inventoryText += "\n";
    }
    
    if (petState.decorations.length > 0) {
        inventoryText += "🎨 DECORACIONES:\n";
        petState.decorations.forEach(decorationId => {
            const decoration = shopItems.decorations.find(i => i.id === decorationId);
            if (decoration) {
                inventoryText += `${decoration.icon} ${decoration.name}\n`;
            }
        });
        inventoryText += "\n";
    }
    
    if (petState.toys.length > 0) {
        inventoryText += "🧸 JUGUETES:\n";
        petState.toys.forEach(toyId => {
            const toy = shopItems.toys.find(i => i.id === toyId);
            if (toy) {
                inventoryText += `${toy.icon} ${toy.name}\n`;
            }
        });
    }
    
    if (petState.inventory.length === 0 && petState.foodInventory.length === 0) {
        inventoryText += "Vacío - ¡Compra algo en la tienda!";
    }
    
    alert(inventoryText);
}

document.addEventListener("DOMContentLoaded", initGame);

window.addEventListener("beforeunload", savePetState);

const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
const gameOverlay = document.getElementById("platformGameOverlay");
const gameStartScreen = document.getElementById("gameStartScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameScoreDisplay = document.getElementById("gameScore");
const finalScoreDisplay = document.getElementById("finalScore");
const coinsEarnedDisplay = document.getElementById("coinsEarned");

let capybara;
let platforms = [];
let coins = [];
let score;
let gameRunning;
let gameFrame;
let cameraY = 0;
let maxHeight = 0;
let coinsCollected = 0;

const CAPYBARA_SIZE = 40;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const JUMP_STRENGTH = -12; // Aumentado para más sensibilidad
const GRAVITY = 0.4; // Aumentado para un salto más rápido
const PLATFORM_SPEED = 0.8;
const CAMERA_FOLLOW_SPEED = 0.1;
const COIN_SIZE = 20;

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
    this.maxJumps = 2;

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        if (capibaraImage && capibaraImage.complete) {
            if (this.velocityY !== 0) {
                ctx.drawImage(capibaraJumpImage, -this.width/2, -this.height/2, this.width, this.height);
            } else {
                ctx.drawImage(capibaraImage, -this.width/2, -this.height/2, this.width, this.height);
            }
        } else {
            ctx.fillStyle = "#D2691E";
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            ctx.fillStyle = "#000";
            ctx.fillRect(-this.width/4, -this.height/4, 4, 4);
            ctx.fillRect(this.width/4 - 4, -this.height/4, 4, 4);
        }
        
        ctx.restore();
    };

    this.update = function() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.velocityX *= 0.95;
        
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > gameCanvas.width) {
            this.x = gameCanvas.width - this.width;
            this.velocityX = 0;
        }

        if (this.y > cameraY + gameCanvas.height + 100) {
            endGame();
        }
        
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
        this.velocityX = Math.max(this.velocityX - 1.5, -7); // Aumentado para más sensibilidad
    };
    
    this.moveRight = function() {
        this.velocityX = Math.min(this.velocityX + 1.5, 7); // Aumentado para más sensibilidad
    };
}

function Platform(x, y, type = "normal") {
    this.x = x;
    this.y = y;
    this.width = PLATFORM_WIDTH;
    this.height = PLATFORM_HEIGHT;
    this.type = type;

    this.draw = function() {
        ctx.save();
        
        switch(this.type) {
            case "spring":
                ctx.fillStyle = "#FF6B6B";
                break;
            case "moving":
                ctx.fillStyle = "#4ECDC4";
                break;
            default:
                ctx.fillStyle = "#556B2F";
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = "#8FBC8F";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    };

    this.update = function() {
        if (this.type === "moving") {
            this.x += Math.sin(Date.now() * 0.002 + this.y * 0.01) * 2;
            
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > gameCanvas.width) this.x = gameCanvas.width - this.width;
        }
    };
}

function Coin(x, y) {
    this.x = x;
    this.y = y;
    this.width = COIN_SIZE;
    this.height = COIN_SIZE;
    this.collected = false;
    this.rotation = 0;

    this.draw = function() {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#FFA500";
        ctx.beginPath();
        ctx.arc(0, 0, this.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    };

    this.update = function() {
        this.rotation += 0.1;
    };
}

function initPlatformGame() {
    capybara = new Capybara();
    platforms = [];
    coins = [];
    score = 0;
    coinsCollected = 0;
    cameraY = 0;
    maxHeight = capybara.y;
    gameScoreDisplay.textContent = score;
    gameRunning = false;
    gameStartScreen.style.display = "flex";
    gameOverScreen.style.display = "none";
    gameOverlay.classList.add("active");

    generateInitialPlatforms();
}

function generateInitialPlatforms() {
    platforms.push(new Platform(gameCanvas.width / 2 - PLATFORM_WIDTH / 2, gameCanvas.height - 30));
    
    for (let i = 1; i < 25; i++) {
        const x = Math.random() * (gameCanvas.width - PLATFORM_WIDTH);
        const y = gameCanvas.height - 100 - (i * 60);
        
        let type = "normal";
        const rand = Math.random();
        if (rand < 0.05) type = "spring";
        else if (rand < 0.1) type = "moving";
        
        platforms.push(new Platform(x, y, type));
        
        if (Math.random() < 0.5) {
            coins.push(new Coin(x + PLATFORM_WIDTH/2 - COIN_SIZE/2, y - 30));
        }
    }
}

function generateMorePlatforms() {
    const topPlatform = platforms.reduce((top, platform) => 
        platform.y < top.y ? platform : top, platforms[0]);
    
    for (let i = 1; i <= 8; i++) {
        const x = Math.random() * (gameCanvas.width - PLATFORM_WIDTH);
        const y = topPlatform.y - (i * 60);
        
        let type = "normal";
        const rand = Math.random();
        if (rand < 0.05) type = "spring";
        else if (rand < 0.1) type = "moving";
        
        platforms.push(new Platform(x, y, type));
        
        if (Math.random() < 0.5) {
            coins.push(new Coin(x + PLATFORM_WIDTH/2 - COIN_SIZE/2, y - 30));
        }
    }
}

function drawBackground() {
    const progress = Math.max(0, Math.min(1, -maxHeight / 2000));
    
    const gradient = ctx.createLinearGradient(0, 0, 0, gameCanvas.height);
    
    if (progress < 0.3) {
        gradient.addColorStop(0, `hsl(200, 80%, ${80 - progress * 20}%)`);
        gradient.addColorStop(1, `hsl(220, 60%, ${90 - progress * 10}%)`);
    } else if (progress < 0.6) {
        const sunsetProgress = (progress - 0.3) / 0.3;
        gradient.addColorStop(0, `hsl(${30 - sunsetProgress * 10}, 70%, ${70 + sunsetProgress * 10}%)`);
        gradient.addColorStop(0.5, `hsl(${15 - sunsetProgress * 5}, 80%, ${60 + sunsetProgress * 20}%)`);
        gradient.addColorStop(1, `hsl(${240 + sunsetProgress * 20}, 60%, ${40 + sunsetProgress * 20}%)`);
    } else {
        const spaceProgress = (progress - 0.6) / 0.4;
        gradient.addColorStop(0, `hsl(240, ${40 - spaceProgress * 30}%, ${20 - spaceProgress * 15}%)`);
        gradient.addColorStop(1, `hsl(260, ${30 - spaceProgress * 20}%, ${10 - spaceProgress * 8}%)`);
        
        if (spaceProgress > 0.3) {
            drawStars(spaceProgress);
        }
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, cameraY, gameCanvas.width, gameCanvas.height);
}

function drawStars(intensity) {
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
    
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

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    updateCamera();
    drawBackground();
    
    ctx.save();
    ctx.translate(0, -cameraY);

    capybara.update();
    capybara.draw();

    for (let i = platforms.length - 1; i >= 0; i--) {
        const platform = platforms[i];
        platform.update();
        platform.draw();

        if (
            capybara.velocityY > 0 &&
            capybara.x < platform.x + platform.width &&
            capybara.x + capybara.width > platform.x &&
            capybara.y + capybara.height > platform.y &&
            capybara.y + capybara.height < platform.y + platform.height + 10
        ) {
            capybara.y = platform.y - capybara.height;
            capybara.jumpCount = 0;
            capybara.onGround = true;
            
            switch(platform.type) {
                case "spring":
                    capybara.velocityY = JUMP_STRENGTH * 1.5;
                    break;
                case "moving":
                    capybara.velocityY = JUMP_STRENGTH;
                    capybara.velocityX += Math.sin(Date.now() * 0.002 + platform.y * 0.01) * 1;
                    break;
                default:
                    capybara.velocityY = JUMP_STRENGTH;
            }
            
            capybara.onGround = false;
        }

        if (platform.y > cameraY + gameCanvas.height + 200) {
            platforms.splice(i, 1);
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.update();
        coin.draw();

        if (!coin.collected &&
            capybara.x < coin.x + coin.width &&
            capybara.x + capybara.width > coin.x &&
            capybara.y < coin.y + coin.height &&
            capybara.y + capybara.height > coin.y) {
            
            coin.collected = true;
            coinsCollected++;
            coins.splice(i, 1);
        }

        if (coin.y > cameraY + gameCanvas.height + 200) {
            coins.splice(i, 1);
        }
    }
    
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
    coinsEarnedDisplay.textContent = coinsCollected;
    
    petState.coins += coinsCollected;
    petState.happiness = Math.min(100, petState.happiness + Math.floor(score / 10));
    petState.energy = Math.max(0, petState.energy - 20);
    
    gainExperience(Math.floor(score / 5) + coinsCollected * 2);
    
    gameOverScreen.style.display = "flex";
    updateDisplay();
    savePetState();
}

function restartGame() {
    initPlatformGame();
    startGame();
}

function closeGame() {
    gameOverlay.classList.remove("active");
    gameRunning = false;
    cancelAnimationFrame(gameFrame);
}

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
    
    const canvasWidth = gameCanvas.width;
    const leftZone = canvasWidth * 0.3;
    const rightZone = canvasWidth * 0.7;
    
    if (touchX < leftZone) {
        isMovingLeft = true;
        capybara.moveLeft();
    } else if (touchX > rightZone) {
        isMovingRight = true;
        capybara.moveRight();
    } else {
        capybara.jump();
    }
});

gameCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
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
    
    isMovingLeft = false;
    isMovingRight = false;
    capybara.velocityX *= 0.8;
});

window.startGame = startGame;
window.endGame = endGame;
window.restartGame = restartGame;
window.closeGame = closeGame;
window.changeRoom = changeRoom;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.changePetColor = changePetColor;
window.saveSettings = saveSettings;
window.resetPet = resetPet;
window.openShop = openShop;
window.closeShop = closeShop;
window.changeShopTab = changeShopTab;

// Lottie Animation
const capyAnimationContainer = document.getElementById('capyAnimation');
if (capyAnimationContainer) {
    lottie.loadAnimation({
        container: capyAnimationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'capibara_dance.json'
    });
}
