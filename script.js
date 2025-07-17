
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
    inventory: [],
    foodInventory: [], // Nuevo: inventario de comida
    decorations: [], // Nuevo: decoraciones compradas
    toys: [], // Nuevo: juguetes comprados
    dailyGiftClaimed: false,
    lastDailyGift: null
};

let petState = { ...defaultPetState };
let gameInterval;
let currentRoom = "living";

// Limpiar localStorage al iniciar (usar nueva clave)
const PET_STORAGE_KEY = "capibaraVirtual_v3_2024"; // Nueva clave única

// Limpiar versiones anteriores
function clearOldStorage() {
    const oldKeys = ["tamagotchiPet", "tamagotchiPet_v2", "capibaraVirtual_v3"];
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
}

// Sprites y estados de la mascota
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

// Configuración de habitaciones
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
            { id: "achievements", text: "🏆 Logros", class: "play-btn" }
        ]
    }
};

// Configuración masiva de la tienda
const shopItems = {
    food: [
        // Frutas
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
        { id: "kiwi", name: "Kiwi", icon: "🥝", price: 9, effect: "hunger", value: 27, description: "+27 Hambre", type: "food" },
        { id: "avocado", name: "Aguacate", icon: "🥑", price: 16, effect: "hunger", value: 40, description: "+40 Hambre", type: "food" },
        { id: "coconut", name: "Coco", icon: "🥥", price: 20, effect: "hunger", value: 55, description: "+55 Hambre", type: "food" },
        { id: "lemon", name: "Limón", icon: "🍋", price: 6, effect: "hunger", value: 15, description: "+15 Hambre", type: "food" },
        { id: "lime", name: "Lima", icon: "🍈", price: 6, effect: "hunger", value: 15, description: "+15 Hambre", type: "food" },
        { id: "pear", name: "Pera", icon: "🍐", price: 8, effect: "hunger", value: 25, description: "+25 Hambre", type: "food" },
        { id: "plum", name: "Ciruela", icon: "🍑", price: 7, effect: "hunger", value: 22, description: "+22 Hambre", type: "food" },
        { id: "pomegranate", name: "Granada", icon: "🌰", price: 13, effect: "hunger", value: 32, description: "+32 Hambre", type: "food" },
        { id: "fig", name: "Higo", icon: "🍈", price: 10, effect: "hunger", value: 28, description: "+28 Hambre", type: "food" },
        { id: "date", name: "Dátil", icon: "🌰", price: 9, effect: "hunger", value: 26, description: "+26 Hambre", type: "food" },

        // Verduras
        { id: "carrot", name: "Zanahoria", icon: "🥕", price: 6, effect: "hunger", value: 22, description: "+22 Hambre", type: "food" },
        { id: "lettuce", name: "Lechuga", icon: "🥬", price: 4, effect: "hunger", value: 18, description: "+18 Hambre", type: "food" },
        { id: "tomato", name: "Tomate", icon: "🍅", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },
        { id: "cucumber", name: "Pepino", icon: "🥒", price: 4, effect: "hunger", value: 16, description: "+16 Hambre", type: "food" },
        { id: "corn", name: "Maíz", icon: "🌽", price: 8, effect: "hunger", value: 30, description: "+30 Hambre", type: "food" },
        { id: "broccoli", name: "Brócoli", icon: "🥦", price: 7, effect: "hunger", value: 25, description: "+25 Hambre", type: "food" },
        { id: "potato", name: "Papa", icon: "🥔", price: 6, effect: "hunger", value: 28, description: "+28 Hambre", type: "food" },
        { id: "onion", name: "Cebolla", icon: "🧅", price: 3, effect: "hunger", value: 15, description: "+15 Hambre", type: "food" },
        { id: "bell_pepper", name: "Pimiento", icon: "🫑", price: 7, effect: "hunger", value: 23, description: "+23 Hambre", type: "food" },
        { id: "spinach", name: "Espinaca", icon: "🥬", price: 5, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },
        { id: "mushroom", name: "Champiñón", icon: "🍄", price: 9, effect: "hunger", value: 28, description: "+28 Hambre", type: "food" },
        { id: "eggplant", name: "Berenjena", icon: "🍆", price: 8, effect: "hunger", value: 26, description: "+26 Hambre", type: "food" },
        { id: "zucchini", name: "Calabacín", icon: "🥒", price: 6, effect: "hunger", value: 21, description: "+21 Hambre", type: "food" },
        { id: "cabbage", name: "Col", icon: "🥬", price: 5, effect: "hunger", value: 19, description: "+19 Hambre", type: "food" },
        { id: "radish", name: "Rábano", icon: "🥕", price: 4, effect: "hunger", value: 17, description: "+17 Hambre", type: "food" },
        { id: "artichoke", name: "Alcachofa", icon: "🥬", price: 10, effect: "hunger", value: 30, description: "+30 Hambre", type: "food" },
        { id: "asparagus", name: "Espárrago", icon: "🥦", price: 11, effect: "hunger", value: 31, description: "+31 Hambre", type: "food" },
        { id: "ginger", name: "Jengibre", icon: "🫚", price: 7, effect: "hunger", value: 24, description: "+24 Hambre", type: "food" },
        { id: "garlic", name: "Ajo", icon: "🧄", price: 5, effect: "hunger", value: 18, description: "+18 Hambre", type: "food" },
        { id: "chili", name: "Chile", icon: "🌶️", price: 6, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },

        // Comida rápida
        { id: "pizza", name: "Pizza", icon: "🍕", price: 30, effect: "hunger", value: 60, description: "+60 Hambre", type: "food" },
        { id: "burger", name: "Hamburguesa", icon: "🍔", price: 28, effect: "hunger", value: 55, description: "+55 Hambre", type: "food" },
        { id: "hotdog", name: "Hot Dog", icon: "🌭", price: 20, effect: "hunger", value: 40, description: "+40 Hambre", type: "food" },
        { id: "sandwich", name: "Sándwich", icon: "🥪", price: 15, effect: "hunger", value: 35, description: "+35 Hambre", type: "food" },
        { id: "taco", name: "Taco", icon: "🌮", price: 18, effect: "hunger", value: 38, description: "+38 Hambre", type: "food" },
        { id: "burrito", name: "Burrito", icon: "🌯", price: 22, effect: "hunger", value: 45, description: "+45 Hambre", type: "food" },
        { id: "fries", name: "Papas Fritas", icon: "🍟", price: 12, effect: "hunger", value: 25, description: "+25 Hambre", type: "food" },
        { id: "chicken_nuggets", name: "Nuggets de Pollo", icon: "🍗", price: 25, effect: "hunger", value: 50, description: "+50 Hambre", type: "food" },
        { id: "sushi", name: "Sushi", icon: "🍣", price: 35, effect: "hunger", value: 65, description: "+65 Hambre", type: "food" },
        { id: "ramen", name: "Ramen", icon: "🍜", price: 28, effect: "hunger", value: 58, description: "+58 Hambre", type: "food" },
        { id: "donut_burger", name: "Hamburguesa de Dona", icon: "🍔🍩", price: 40, effect: "hunger", value: 70, description: "+70 Hambre (y felicidad)", type: "food" },
        { id: "pizza_slice", name: "Rebanada de Pizza", icon: "🍕", price: 15, effect: "hunger", value: 30, description: "+30 Hambre", type: "food" },
        { id: "kebab", name: "Kebab", icon: "🥙", price: 23, effect: "hunger", value: 48, description: "+48 Hambre", type: "food" },
        { id: "falafel", name: "Falafel", icon: "🧆", price: 17, effect: "hunger", value: 36, description: "+36 Hambre", type: "food" },
        { id: "curry", name: "Curry", icon: "🍛", price: 32, effect: "hunger", value: 62, description: "+62 Hambre", type: "food" },
        { id: "paella", name: "Paella", icon: "🥘", price: 45, effect: "hunger", value: 75, description: "+75 Hambre", type: "food" },
        { id: "taco_salad", name: "Ensalada de Taco", icon: "🥗🌮", price: 20, effect: "hunger", value: 42, description: "+42 Hambre", type: "food" },
        { id: "pancake", name: "Panqueque", icon: "🥞", price: 10, effect: "hunger", value: 20, description: "+20 Hambre", type: "food" },
        { id: "waffle", name: "Waffle", icon: "🧇", price: 11, effect: "hunger", value: 22, description: "+22 Hambre", type: "food" },
        { id: "croissant", name: "Croissant", icon: "🥐", price: 8, effect: "hunger", value: 18, description: "+18 Hambre", type: "food" },

        // Dulces
        { id: "cake", name: "Pastel", icon: "🎂", price: 25, effect: "happiness", value: 40, description: "+40 Felicidad", type: "food" },
        { id: "cookie", name: "Galleta", icon: "🍪", price: 12, effect: "happiness", value: 20, description: "+20 Felicidad", type: "food" },
        { id: "donut", name: "Dona", icon: "🍩", price: 18, effect: "happiness", value: 30, description: "+30 Felicidad", type: "food" },
        { id: "ice_cream", name: "Helado", icon: "🍦", price: 20, effect: "happiness", value: 35, description: "+35 Felicidad", type: "food" },
        { id: "candy", name: "Dulce", icon: "🍬", price: 8, effect: "happiness", value: 15, description: "+15 Felicidad", type: "food" },
        { id: "chocolate", name: "Chocolate", icon: "🍫", price: 16, effect: "happiness", value: 25, description: "+25 Felicidad", type: "food" },
        { id: "lollipop", name: "Paleta", icon: "🍭", price: 10, effect: "happiness", value: 18, description: "+18 Felicidad", type: "food" },
        { id: "cupcake", name: "Cupcake", icon: "🧁", price: 14, effect: "happiness", value: 22, description: "+22 Felicidad", type: "food" },
        { id: "gummy_bear", name: "Oso de Goma", icon: "🐻", price: 7, effect: "happiness", value: 12, description: "+12 Felicidad", type: "food" },
        { id: "marshmallow", name: "Malvavisco", icon: "🍡", price: 9, effect: "happiness", value: 16, description: "+16 Felicidad", type: "food" },
        { id: "brownie", name: "Brownie", icon: "🍫", price: 19, effect: "happiness", value: 32, description: "+32 Felicidad", type: "food" },
        { id: "cheesecake", name: "Cheesecake", icon: "🍰", price: 28, effect: "happiness", value: 45, description: "+45 Felicidad", type: "food" },
        { id: "macaron", name: "Macaron", icon: "🍪", price: 15, effect: "happiness", value: 28, description: "+28 Felicidad", type: "food" },
        { id: "churro", name: "Churro", icon: "🥖", price: 10, effect: "happiness", value: 19, description: "+19 Felicidad", type: "food" },
        { id: "crepe", name: "Crepe", icon: "🥞", price: 13, effect: "happiness", value: 23, description: "+23 Felicidad", type: "food" },
        { id: "muffin", name: "Muffin", icon: "🧁", price: 11, effect: "happiness", value: 20, description: "+20 Felicidad", type: "food" },
        { id: "scone", name: "Scone", icon: "🍞", price: 9, effect: "happiness", value: 17, description: "+17 Felicidad", type: "food" },
        { id: "waffle_cone", name: "Cono de Waffle", icon: "🍦", price: 16, effect: "happiness", value: 29, description: "+29 Felicidad", type: "food" },
        { id: "gingerbread", name: "Pan de Jengibre", icon: "🍪", price: 14, effect: "happiness", value: 24, description: "+24 Felicidad", type: "food" },
        { id: "pudding", name: "Pudín", icon: "🍮", price: 17, effect: "happiness", value: 30, description: "+30 Felicidad", type: "food" },

        // Medicina y salud
        { id: "medicine", name: "Medicina", icon: "💊", price: 35, effect: "health", value: 50, description: "+50 Salud", type: "food" },
        { id: "vitamin", name: "Vitamina", icon: "💉", price: 25, effect: "health", value: 30, description: "+30 Salud", type: "food" },
        { id: "energy_drink", name: "Bebida Energética", icon: "⚡", price: 22, effect: "energy", value: 45, description: "+45 Energía", type: "food" },
        { id: "coffee", name: "Café", icon: "☕", price: 15, effect: "energy", value: 25, description: "+25 Energía", type: "food" },
        { id: "tea", name: "Té", icon: "🍵", price: 12, effect: "energy", value: 20, description: "+20 Energía", type: "food" },
        { id: "soap", name: "Jabón", icon: "🧼", price: 18, effect: "cleanliness", value: 40, description: "+40 Limpieza", type: "food" },
        { id: "shampoo", name: "Champú", icon: "🧴", price: 25, effect: "cleanliness", value: 60, description: "+60 Limpieza", type: "food" },
        { id: "bandage", name: "Venda", icon: "🩹", price: 10, effect: "health", value: 15, description: "+15 Salud", type: "food" },
        { id: "pain_reliever", name: "Analgésico", icon: "💊", price: 20, effect: "health", value: 25, description: "+25 Salud", type: "food" },
        { id: "antiseptic", name: "Antiséptico", icon: "🧴", price: 15, effect: "cleanliness", value: 30, description: "+30 Limpieza", type: "food" },
        { id: "toothbrush", name: "Cepillo de Dientes", icon: "🦷", price: 10, effect: "cleanliness", value: 20, description: "+20 Limpieza", type: "food" },
        { id: "mouthwash", name: "Enjuague Bucal", icon: "💧", price: 12, effect: "cleanliness", value: 25, description: "+25 Limpieza", type: "food" },
        { id: "sleep_aid", name: "Ayuda para Dormir", icon: "😴", price: 20, effect: "energy", value: 35, description: "+35 Energía (sueño)", type: "food" },
        { id: "calming_tea", name: "Té Relajante", icon: "🍵", price: 15, effect: "happiness", value: 25, description: "+25 Felicidad", type: "food" },
        { id: "protein_shake", name: "Batido de Proteínas", icon: "💪", price: 28, effect: "health", value: 40, description: "+40 Salud", type: "food" },
        { id: "fruit_juice", name: "Jugo de Frutas", icon: "🍹", price: 10, effect: "energy", value: 18, description: "+18 Energía", type: "food" },
        { id: "milk", name: "Leche", icon: "🥛", price: 8, effect: "hunger", value: 15, description: "+15 Hambre", type: "food" },
        { id: "water_bottle", name: "Botella de Agua", icon: "💧", price: 5, effect: "energy", value: 10, description: "+10 Energía", type: "food" },
        { id: "sunscreen", name: "Protector Solar", icon: "🧴☀️", price: 18, effect: "health", value: 20, description: "+20 Salud (protección)", type: "food" },
        { id: "insect_repellent", name: "Repelente de Insectos", icon: "🦟", price: 15, effect: "cleanliness", value: 25, description: "+25 Limpieza (protección)", type: "food" }
    ],
    accessories: [
        // Sombreros
        { id: "hat", name: "Sombrero", icon: "🎩", price: 50, type: "accessory", description: "Sombrero elegante" },
        { id: "cap", name: "Gorra", icon: "🧢", price: 28, type: "accessory", description: "Gorra deportiva" },
        { id: "crown", name: "Corona", icon: "👑", price: 150, type: "accessory", description: "Corona real" },
        { id: "beret", name: "Boina", icon: "🎨", price: 35, type: "accessory", description: "Boina artística" },
        { id: "helmet", name: "Casco", icon: "⛑️", price: 45, type: "accessory", description: "Casco protector" },
        { id: "cowboy_hat", name: "Sombrero Vaquero", icon: "🤠", price: 60, type: "accessory", description: "Sombrero del oeste" },
        { id: "wizard_hat", name: "Sombrero de Mago", icon: "🧙", price: 80, type: "accessory", description: "Sombrero mágico" },
        { id: "chef_hat", name: "Gorro de Chef", icon: "👨‍🍳", price: 40, type: "accessory", description: "Gorro de cocina" },
        { id: "party_hat", name: "Gorro de Fiesta", icon: "🎉", price: 20, type: "accessory", description: "Gorro festivo" },
        { id: "beanie", name: "Gorro de Lana", icon: "🧶", price: 30, type: "accessory", description: "Gorro cálido" },
        { id: "fedora", name: "Fedora", icon: "🎩", price: 55, type: "accessory", description: "Sombrero clásico" },
        { id: "top_hat", name: "Sombrero de Copa", icon: "🎩", price: 70, type: "accessory", description: "Sombrero de gala" },
        { id: "viking_helmet", name: "Casco Vikingo", icon: "🪖", price: 90, type: "accessory", description: "Casco con cuernos" },
        { id: "flower_crown", name: "Corona de Flores", icon: "🌸👑", price: 45, type: "accessory", description: "Corona natural" },
        { id: "santa_hat", name: "Gorro de Santa", icon: "🎅", price: 30, type: "accessory", description: "Gorro navideño" },

        // Gafas
        { id: "glasses", name: "Gafas", icon: "🤓", price: 30, type: "accessory", description: "Gafas geniales" },
        { id: "sunglasses", name: "Lentes de Sol", icon: "🕶️", price: 65, type: "accessory", description: "Lentes cool" },
        { id: "3d_glasses", name: "Gafas 3D", icon: "🥽", price: 40, type: "accessory", description: "Gafas futuristas" },
        { id: "monocle", name: "Monóculo", icon: "🧐", price: 75, type: "accessory", description: "Monóculo elegante" },
        { id: "goggles", name: "Gafas de Buceo", icon: "🤿", price: 38, type: "accessory", description: "Gafas para nadar" },

        // Joyas
        { id: "necklace", name: "Collar", icon: "📿", price: 60, type: "accessory", description: "Collar brillante" },
        { id: "earrings", name: "Aretes", icon: "👂", price: 45, type: "accessory", description: "Aretes elegantes" },
        { id: "watch", name: "Reloj", icon: "⌚", price: 80, type: "accessory", description: "Reloj de lujo" },
        { id: "ring", name: "Anillo", icon: "💍", price: 120, type: "accessory", description: "Anillo diamante" },
        { id: "bracelet", name: "Pulsera", icon: "📿", price: 55, type: "accessory", description: "Pulsera dorada" },
        { id: "brooch", name: "Broche", icon: "💎", price: 70, type: "accessory", description: "Broche de gema" },
        { id: "anklet", name: "Tobillera", icon: "📿", price: 30, type: "accessory", description: "Tobillera delicada" },

        // Ropa
        { id: "bow", name: "Moño", icon: "🎀", price: 25, type: "accessory", description: "Moño adorable" },
        { id: "scarf", name: "Bufanda", icon: "🧣", price: 35, type: "accessory", description: "Bufanda cálida" },
        { id: "tie", name: "Corbata", icon: "👔", price: 40, type: "accessory", description: "Corbata formal" },
        { id: "backpack", name: "Mochila", icon: "🎒", price: 55, type: "accessory", description: "Mochila aventurera" },
        { id: "cape", name: "Capa", icon: "🦸", price: 75, type: "accessory", description: "Capa de superhéroe" },
        { id: "vest", name: "Chaleco", icon: "🦺", price: 50, type: "accessory", description: "Chaleco elegante" },
        { id: "bowtie", name: "Pajarita", icon: "🤵", price: 30, type: "accessory", description: "Pajarita chic" },
        { id: "apron", name: "Delantal", icon: "👨‍🍳", price: 25, type: "accessory", description: "Delantal de cocina" },
        { id: "gloves", name: "Guantes", icon: "🧤", price: 20, type: "accessory", description: "Guantes suaves" },
        { id: "sash", name: "Faja", icon: "🎗️", price: 30, type: "accessory", description: "Faja ceremonial" },
        { id: "skirt", name: "Falda", icon: "👗", price: 40, type: "accessory", description: "Falda coqueta" },
        { id: "shorts", name: "Pantalones Cortos", icon: "🩳", price: 35, type: "accessory", description: "Shorts cómodos" },
        { id: "socks", name: "Calcetines", icon: "🧦", price: 15, type: "accessory", description: "Calcetines divertidos" },
        { id: "slippers", name: "Pantuflas", icon: "🥿", price: 25, type: "accessory", description: "Pantuflas suaves" },
        { id: "umbrella", name: "Paraguas", icon: "☂️", price: 30, type: "accessory", description: "Paraguas de lluvia" },
        { id: "fan", name: "Abanico", icon: "🪭", price: 20, type: "accessory", description: "Abanico de mano" },
        { id: "mask", name: "Máscara", icon: "🎭", price: 40, type: "accessory", description: "Máscara misteriosa" },
        { id: "wings", name: "Alas", icon: "🦋", price: 100, type: "accessory", description: "Alas de hada" },
        { id: "tail", name: "Cola", icon: "🦊", price: 60, type: "accessory", description: "Cola de animal" },
        { id: "fin", name: "Aleta", icon: "🐠", price: 50, type: "accessory", description: "Aleta de pez" }
    ],
    decorations: [
        // Plantas
        { id: "plant", name: "Planta", icon: "🌱", price: 40, type: "decoration", description: "Planta decorativa" },
        { id: "flower", name: "Flor", icon: "🌸", price: 30, type: "decoration", description: "Flor hermosa" },
        { id: "cactus", name: "Cactus", icon: "🌵", price: 35, type: "decoration", description: "Cactus resistente" },
        { id: "tree", name: "Árbol", icon: "🌳", price: 80, type: "decoration", description: "Árbol grande" },
        { id: "sunflower", name: "Girasol", icon: "🌻", price: 45, type: "decoration", description: "Girasol brillante" },
        { id: "rose", name: "Rosa", icon: "🌹", price: 50, type: "decoration", description: "Rosa romántica" },
        { id: "tulip", name: "Tulipán", icon: "🌷", price: 38, type: "decoration", description: "Tulipán colorido" },
        { id: "bonsai", name: "Bonsái", icon: "🌳", price: 70, type: "decoration", description: "Bonsái zen" },
        { id: "fern", name: "Helecho", icon: "🌿", price: 32, type: "decoration", description: "Helecho frondoso" },
        { id: "orchid", name: "Orquídea", icon: "🌺", price: 60, type: "decoration", description: "Orquídea exótica" },
        { id: "succulent", name: "Suculenta", icon: "🌵", price: 28, type: "decoration", description: "Suculenta pequeña" },
        { id: "palm_tree", name: "Palmera", icon: "🌴", price: 90, type: "decoration", description: "Palmera tropical" },
        { id: "bamboo", name: "Bambú", icon: "🎍", price: 55, type: "decoration", description: "Bambú de la suerte" },
        { id: "lily", name: "Lirio", icon: "🌼", price: 40, type: "decoration", description: "Lirio elegante" },
        { id: "daisy", name: "Margarita", icon: "🌼", price: 25, type: "decoration", description: "Margarita alegre" },

        // Muebles
        { id: "sofa", name: "Sofá", icon: "🛋️", price: 120, type: "decoration", description: "Sofá cómodo" },
        { id: "chair", name: "Silla", icon: "🪑", price: 60, type: "decoration", description: "Silla elegante" },
        { id: "table", name: "Mesa", icon: "🪑", price: 80, type: "decoration", description: "Mesa de madera" },
        { id: "bed", name: "Cama", icon: "🛏️", price: 150, type: "decoration", description: "Cama cómoda" },
        { id: "bookshelf", name: "Estantería", icon: "📚", price: 100, type: "decoration", description: "Estantería llena" },
        { id: "desk", name: "Escritorio", icon: "🗃️", price: 90, type: "decoration", description: "Escritorio moderno" },
        { id: "wardrobe", name: "Armario", icon: "🚪", price: 130, type: "decoration", description: "Armario espacioso" },
        { id: "dresser", name: "Cómoda", icon: "🗄️", price: 95, type: "decoration", description: "Cómoda con cajones" },
        { id: "nightstand", name: "Mesita de Noche", icon: "🛏️", price: 50, type: "decoration", description: "Mesita práctica" },
        { id: "dining_table", name: "Mesa de Comedor", icon: "🍽️", price: 180, type: "decoration", description: "Mesa para cenas" },
        { id: "coffee_table", name: "Mesa de Centro", icon: "☕", price: 70, type: "decoration", description: "Mesa de salón" },
        { id: "armchair", name: "Sillón", icon: "🛋️", price: 110, type: "decoration", description: "Sillón individual" },
        { id: "ottoman", name: "Otomana", icon: "🪑", price: 45, type: "decoration", description: "Otomana cómoda" },
        { id: "bench", name: "Banco", icon: "🪑", price: 65, type: "decoration", description: "Banco de jardín" },
        { id: "rocking_chair", name: "Mecedora", icon: "🪑", price: 85, type: "decoration", description: "Mecedora relajante" },

        // Electrónicos
        { id: "tv", name: "Televisión", icon: "📺", price: 200, type: "decoration", description: "TV moderna" },
        { id: "radio", name: "Radio", icon: "📻", price: 50, type: "decoration", description: "Radio vintage" },
        { id: "computer", name: "Computadora", icon: "💻", price: 300, type: "decoration", description: "PC gaming" },
        { id: "phone", name: "Teléfono", icon: "📱", price: 180, type: "decoration", description: "Smartphone" },
        { id: "camera", name: "Cámara", icon: "📷", price: 120, type: "decoration", description: "Cámara profesional" },
        { id: "speakers", name: "Altavoces", icon: "🔊", price: 90, type: "decoration", description: "Altavoces potentes" },
        { id: "console", name: "Consola de Videojuegos", icon: "🎮", price: 250, type: "decoration", description: "Consola de última generación" },
        { id: "projector", name: "Proyector", icon: "📽️", price: 170, type: "decoration", description: "Proyector de cine" },
        { id: "robot_vacuum", name: "Robot Aspirador", icon: "🤖", price: 150, type: "decoration", description: "Robot de limpieza" },
        { id: "smart_speaker", name: "Altavoz Inteligente", icon: "🗣️", price: 70, type: "decoration", description: "Asistente de voz" },

        // Instrumentos
        { id: "guitar", name: "Guitarra", icon: "🎸", price: 85, type: "decoration", description: "Guitarra musical" },
        { id: "piano", name: "Piano", icon: "🎹", price: 300, type: "decoration", description: "Piano elegante" },
        { id: "drums", name: "Batería", icon: "🥁", price: 250, type: "decoration", description: "Batería completa" },
        { id: "violin", name: "Violín", icon: "🎻", price: 150, type: "decoration", description: "Violín clásico" },
        { id: "trumpet", name: "Trompeta", icon: "🎺", price: 100, type: "decoration", description: "Trompeta dorada" },
        { id: "flute", name: "Flauta", icon: "🪈", price: 70, type: "decoration", description: "Flauta melódica" },
        { id: "saxophone", name: "Saxofón", icon: "🎷", price: 180, type: "decoration", description: "Saxofón de jazz" },
        { id: "microphone", name: "Micrófono", icon: "🎤", price: 60, type: "decoration", description: "Micrófono de estudio" },
        { id: "harmonica", name: "Armónica", icon: "🎶", price: 30, type: "decoration", description: "Armónica de bolsillo" },
        { id: "ukulele", name: "Ukelele", icon: "🎸", price: 75, type: "decoration", description: "Ukelele hawaiano" },

        // Decoración general
        { id: "painting", name: "Cuadro", icon: "🖼️", price: 70, type: "decoration", description: "Cuadro artístico" },
        { id: "lamp", name: "Lámpara", icon: "💡", price: 45, type: "decoration", description: "Lámpara moderna" },
        { id: "carpet", name: "Alfombra", icon: "🏠", price: 90, type: "decoration", description: "Alfombra cómoda" },
        { id: "mirror", name: "Espejo", icon: "🪞", price: 60, type: "decoration", description: "Espejo brillante" },
        { id: "clock", name: "Reloj de Pared", icon: "🕐", price: 55, type: "decoration", description: "Reloj clásico" },
        { id: "candle", name: "Vela", icon: "🕯️", price: 25, type: "decoration", description: "Vela aromática" },
        { id: "statue", name: "Estatua", icon: "🗿", price: 200, type: "decoration", description: "Estatua misteriosa" },
        { id: "fountain", name: "Fuente", icon: "⛲", price: 350, type: "decoration", description: "Fuente decorativa" },
        { id: "globe", name: "Globo Terráqueo", icon: "🌍", price: 80, type: "decoration", description: "Globo educativo" },
        { id: "vase", name: "Jarrón", icon: "🏺", price: 35, type: "decoration", description: "Jarrón de flores" },
        { id: "curtains", name: "Cortinas", icon: "🪟", price: 50, type: "decoration", description: "Cortinas elegantes" },
        { id: "fireplace", name: "Chimenea", icon: "🔥", price: 250, type: "decoration", description: "Chimenea acogedora" },
        { id: "rug", name: "Tapete", icon: "🧽", price: 40, type: "decoration", description: "Tapete suave" },
        { id: "cushion", name: "Cojín", icon: "🛏️", price: 20, type: "decoration", description: "Cojín decorativo" },
        { id: "books", name: "Libros", icon: "📚", price: 30, type: "decoration", description: "Pila de libros" },
        { id: "trophy", name: "Trofeo", icon: "🏆", price: 100, type: "decoration", description: "Trofeo de campeón" },
        { id: "crystal_ball", name: "Bola de Cristal", icon: "🔮", price: 150, type: "decoration", description: "Bola mágica" },
        { id: "telescope", name: "Telescopio", icon: "🔭", price: 180, type: "decoration", description: "Telescopio estelar" },
        { id: "hourglass", name: "Reloj de Arena", icon: "⏳", price: 40, type: "decoration", description: "Reloj de tiempo" },
        { id: "chessboard", name: "Tablero de Ajedrez", icon: "♟️", price: 70, type: "decoration", description: "Tablero de juego" }
    ],
    toys: [
        // Pelotas
        { id: "ball", name: "Pelota", icon: "⚽", price: 20, type: "toy", description: "Pelota divertida" },
        { id: "basketball", name: "Baloncesto", icon: "🏀", price: 25, type: "toy", description: "Pelota de básquet" },
        { id: "tennis_ball", name: "Pelota de Tenis", icon: "🎾", price: 18, type: "toy", description: "Pelota de tenis" },
        { id: "volleyball", name: "Voleibol", icon: "🏐", price: 22, type: "toy", description: "Pelota de vóley" },
        { id: "beach_ball", name: "Pelota de Playa", icon: "🏖️", price: 15, type: "toy", description: "Pelota inflable" },
        { id: "football", name: "Balón de Fútbol Americano", icon: "🏈", price: 28, type: "toy", description: "Balón ovalado" },
        { id: "golf_ball", name: "Pelota de Golf", icon: "⛳", price: 10, type: "toy", description: "Pelota pequeña" },
        { id: "bowling_ball", name: "Bola de Boliche", icon: "🎳", price: 30, type: "toy", description: "Bola pesada" },
        { id: "rugby_ball", name: "Balón de Rugby", icon: "🏉", price: 27, type: "toy", description: "Balón de rugby" },
        { id: "pool_ball", name: "Bola de Billar", icon: "🎱", price: 12, type: "toy", description: "Bola numerada" },

        // Peluches
        { id: "teddy", name: "Osito", icon: "🧸", price: 35, type: "toy", description: "Osito de peluche" },
        { id: "dog_plush", name: "Perrito de Peluche", icon: "🐕", price: 40, type: "toy", description: "Perrito suave" },
        { id: "cat_plush", name: "Gatito de Peluche", icon: "🐱", price: 38, type: "toy", description: "Gatito adorable" },
        { id: "rabbit_plush", name: "Conejito de Peluche", icon: "🐰", price: 42, type: "toy", description: "Conejito tierno" },
        { id: "unicorn_plush", name: "Unicornio de Peluche", icon: "🦄", price: 50, type: "toy", description: "Unicornio mágico" },
        { id: "dragon_plush", name: "Dragón de Peluche", icon: "🐉", price: 55, type: "toy", description: "Dragón místico" },
        { id: "penguin_plush", name: "Pingüino de Peluche", icon: "🐧", price: 37, type: "toy", description: "Pingüino adorable" },
        { id: "owl_plush", name: "Búho de Peluche", icon: "🦉", price: 39, type: "toy", description: "Búho sabio" },
        { id: "fox_plush", name: "Zorro de Peluche", icon: "🦊", price: 41, type: "toy", description: "Zorro astuto" },
        { id: "lion_plush", name: "León de Peluche", icon: "🦁", price: 48, type: "toy", description: "León valiente" },

        // Juegos de mesa
        { id: "puzzle", name: "Rompecabezas", icon: "🧩", price: 25, type: "toy", description: "Rompecabezas desafiante" },
        { id: "dice", name: "Dados", icon: "🎲", price: 15, type: "toy", description: "Dados de juego" },
        { id: "cards", name: "Cartas", icon: "🃏", price: 18, type: "toy", description: "Baraja de cartas" },
        { id: "chess", name: "Ajedrez", icon: "♟️", price: 60, type: "toy", description: "Juego de ajedrez" },
        { id: "checkers", name: "Damas", icon: "⚫", price: 35, type: "toy", description: "Juego de damas" },
        { id: "monopoly", name: "Monopoly", icon: "💰", price: 70, type: "toy", description: "Juego de bienes raíces" },
        { id: "scrabble", name: "Scrabble", icon: "🔠", price: 55, type: "toy", description: "Juego de palabras" },
        { id: "jenga", name: "Jenga", icon: "🧱", price: 30, type: "toy", description: "Juego de equilibrio" },
        { id: "dominoes", name: "Dominó", icon: "🀫", price: 20, type: "toy", description: "Juego de fichas" },
        { id: "backgammon", name: "Backgammon", icon: "🎲", price: 45, type: "toy", description: "Juego de estrategia" },

        // Juguetes activos
        { id: "yo_yo", name: "Yo-yo", icon: "🪀", price: 22, type: "toy", description: "Yo-yo clásico" },
        { id: "kite", name: "Cometa", icon: "🪁", price: 30, type: "toy", description: "Cometa voladora" },
        { id: "frisbee", name: "Frisbee", icon: "🥏", price: 25, type: "toy", description: "Frisbee deportivo" },
        { id: "jump_rope", name: "Cuerda de Saltar", icon: "🪢", price: 20, type: "toy", description: "Cuerda para ejercicio" },
        { id: "hula_hoop", name: "Hula Hoop", icon: "⭕", price: 28, type: "toy", description: "Aro para bailar" },
        { id: "skateboard", name: "Patineta", icon: "🛹", price: 60, type: "toy", description: "Patineta de calle" },
        { id: "roller_skates", name: "Patines", icon: "⛸️", price: 55, type: "toy", description: "Patines de ruedas" },
        { id: "scooter", name: "Patinete", icon: "🛴", price: 45, type: "toy", description: "Patinete divertido" },
        { id: "boomerang", name: "Boomerang", icon: "🪃", price: 35, type: "toy", description: "Boomerang de caza" },
        { id: "darts", name: "Dardos", icon: "🎯", price: 25, type: "toy", description: "Juego de dardos" },

        // Juguetes creativos
        { id: "blocks", name: "Bloques", icon: "🧱", price: 45, type: "toy", description: "Bloques de construcción" },
        { id: "lego", name: "LEGO", icon: "🔲", price: 80, type: "toy", description: "Set de LEGO" },
        { id: "clay", name: "Plastilina", icon: "🎨", price: 30, type: "toy", description: "Plastilina colorida" },
        { id: "crayons", name: "Crayones", icon: "🖍️", price: 25, type: "toy", description: "Crayones de colores" },
        { id: "paint_set", name: "Set de Pintura", icon: "🎨", price: 50, type: "toy", description: "Set de artista" },
        { id: "easel", name: "Caballete", icon: "🎨", price: 65, type: "toy", description: "Caballete de pintura" },
        { id: "play_doh", name: "Play-Doh", icon: "🧱", price: 20, type: "toy", description: "Masa para moldear" },
        { id: "slime", name: "Slime", icon: "🟢", price: 15, type: "toy", description: "Slime pegajoso" },
        { id: "origami", name: "Origami", icon: "📄", price: 18, type: "toy", description: "Papel para origami" },
        { id: "sewing_kit", name: "Kit de Costura", icon: "🧵", price: 35, type: "toy", description: "Kit de costura" },

        // Juguetes electrónicos
        { id: "robot", name: "Robot", icon: "🤖", price: 150, type: "toy", description: "Robot interactivo" },
        { id: "drone", name: "Dron", icon: "🚁", price: 200, type: "toy", description: "Dron volador" },
        { id: "gameboy", name: "Consola Portátil", icon: "🎮", price: 120, type: "toy", description: "Consola de juegos" },
        { id: "rc_car", name: "Auto a Control", icon: "🚗", price: 85, type: "toy", description: "Auto radiocontrol" },
        { id: "walkie_talkie", name: "Walkie-Talkie", icon: "📻", price: 70, type: "toy", description: "Comunicador de juguete" },
        { id: "toy_camera", name: "Cámara de Juguete", icon: "📷", price: 40, type: "toy", description: "Cámara para niños" },
        { id: "toy_phone", name: "Teléfono de Juguete", icon: "📱", price: 30, type: "toy", description: "Teléfono para jugar" },
        { id: "toy_laptop", name: "Laptop de Juguete", icon: "💻", price: 50, type: "toy", description: "Laptop para niños" },
        { id: "toy_tablet", name: "Tablet de Juguete", icon: "📱", price: 45, type: "toy", description: "Tablet para jugar" },
        { id: "toy_robot_dog", name: "Perro Robot", icon: "🐶🤖", price: 100, type: "toy", description: "Perro robot interactivo" }
    ],
    special: [
        { id: "magic_potion", name: "Poción Mágica", icon: "🧪", price: 100, effect: "all", value: 25, description: "+25 a todas las estadísticas" },
        { id: "golden_apple", name: "Manzana Dorada", icon: "🍎✨", price: 80, effect: "happiness", value: 60, description: "+60 Felicidad" },
        { id: "rainbow_cake", name: "Pastel Arcoíris", icon: "🌈🎂", price: 120, effect: "happiness", value: 80, description: "+80 Felicidad" },
        { id: "super_medicine", name: "Súper Medicina", icon: "💊⭐", price: 150, effect: "health", value: 100, description: "Salud completa" },
        { id: "energy_crystal", name: "Cristal de Energía", icon: "💎⚡", price: 200, effect: "energy", value: 100, description: "Energía completa" },
        { id: "cleansing_orb", name: "Orbe Purificador", icon: "🔮✨", price: 180, effect: "cleanliness", value: 100, description: "Limpieza completa" },
        { id: "happiness_elixir", name: "Elixir de Felicidad", icon: "🌟💖", price: 250, effect: "happiness", value: 100, description: "Felicidad máxima" },
        { id: "youth_potion", name: "Poción de Juventud", icon: "⏰✨", price: 500, effect: "special", value: 0, description: "Reduce la edad en 5 días" },
        { id: "lucky_charm", name: "Amuleto de Suerte", icon: "🍀✨", price: 300, effect: "special", value: 0, description: "Duplica monedas por 1 hora" },
        { id: "mega_boost", name: "Mega Impulso", icon: "🚀⭐", price: 400, effect: "all", value: 50, description: "+50 a todas las estadísticas" },
        { id: "xp_boost", name: "Poción de XP", icon: "✨📈", price: 100, effect: "special", value: 0, description: "Duplica XP por 30 min" },
        { id: "coin_magnet", name: "Imán de Monedas", icon: "🧲💰", price: 150, effect: "special", value: 0, description: "Atrae monedas en minijuegos" },
        { id: "pet_resurrection", name: "Elixir de Resurrección", icon: "⚰️✨", price: 1000, effect: "special", value: 0, description: "Revive a tu mascota" },
        { id: "golden_ticket", name: "Boleto Dorado", icon: "🎫✨", price: 750, effect: "special", value: 0, description: "Acceso a evento especial" },
        { id: "mystery_box", name: "Caja Misteriosa", icon: "🎁❓", price: 200, effect: "special", value: 0, description: "Contiene un item aleatorio" },
        { id: "infinite_food", name: "Comida Infinita", icon: "♾️🍎", price: 1500, effect: "special", value: 0, description: "Hambre nunca baja por 24h" },
        { id: "infinite_happiness", name: "Felicidad Infinita", icon: "♾️😊", price: 1500, effect: "special", value: 0, description: "Felicidad nunca baja por 24h" },
        { id: "infinite_energy", name: "Energía Infinita", icon: "♾️⚡", price: 1500, effect: "special", value: 0, description: "Energía nunca baja por 24h" },
        { id: "infinite_cleanliness", name: "Limpieza Infinita", icon: "♾️🧼", price: 1500, effect: "special", value: 0, description: "Limpieza nunca baja por 24h" },
        { id: "master_key", name: "Llave Maestra", icon: "🔑", price: 1000, effect: "special", value: 0, description: "Desbloquea todas las habitaciones" }
    ]
};

// Inicializar el juego
function initGame() {
    clearOldStorage(); // Limpiar localStorage anterior
    loadPetState();
    updateDisplay();
    updateRoomDisplay();
    startGameLoop();
    checkDailyGift();
    
    // Actualizar cada 30 segundos
    gameInterval = setInterval(() => {
        updatePetStats();
        updateDisplay();
        savePetState();
    }, 30000);
}

// Cargar estado desde localStorage
function loadPetState() {
    const savedState = localStorage.getItem(PET_STORAGE_KEY);
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
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(petState));
}

// Aplicar degradación por tiempo transcurrido
function applyTimeDegradation(minutesPassed) {
    if (!petState.isSleeping) {
        petState.hunger = Math.max(0, petState.hunger - (minutesPassed * 1.5));
        petState.happiness = Math.max(0, petState.happiness - (minutesPassed * 1));
        petState.energy = Math.max(0, petState.energy - (minutesPassed * 0.8));
        petState.cleanliness = Math.max(0, petState.cleanliness - (minutesPassed * 0.5));
    }
    
    // La salud se degrada más lentamente
    if (petState.hunger < 20 || petState.happiness < 20 || petState.cleanliness < 20) {
        petState.health = Math.max(0, petState.health - (minutesPassed * 0.3));
    }
    
    // Calcular edad en días
    const daysPassed = Math.floor((Date.now() - petState.createdAt) / (1000 * 60 * 60 * 24));
    petState.age = daysPassed;
}

// Actualizar estadísticas de la mascota
function updatePetStats() {
    if (petState.isSleeping) {
        // Durante el sueño, la energía se recupera y otras estadísticas se degradan más lentamente
        petState.energy = Math.min(100, petState.energy + 3);
        petState.hunger = Math.max(0, petState.hunger - 0.3);
        petState.happiness = Math.max(0, petState.happiness - 0.2);
        
        // Despertar automáticamente cuando la energía esté llena
        if (petState.energy >= 100) {
            petState.isSleeping = false;
            showMessage("¡Tu mascota se ha despertado y está llena de energía!", "success");
        }
    } else {
        // Degradación normal cuando está despierta
        petState.hunger = Math.max(0, petState.hunger - 1.5);
        petState.happiness = Math.max(0, petState.happiness - 1);
        petState.energy = Math.max(0, petState.energy - 0.8);
        petState.cleanliness = Math.max(0, petState.cleanliness - 0.5);
        
        // La salud se ve afectada por otras estadísticas bajas
        if (petState.hunger < 20 || petState.happiness < 20 || petState.energy < 10 || petState.cleanliness < 20) {
            petState.health = Math.max(0, petState.health - 0.3);
        }
    }
    
    // Recuperación gradual de salud si otras estadísticas están bien
    if (petState.hunger > 70 && petState.happiness > 70 && petState.energy > 50 && petState.cleanliness > 70 && petState.health < 100) {
        petState.health = Math.min(100, petState.health + 0.1);
    }
    
    // Sistema de experiencia y niveles
    updateExperience();
}

// Sistema de experiencia y niveles
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

// Actualizar la visualización
function updateDisplay() {
    // Actualizar barras de estadísticas
    updateStatBar("hunger", petState.hunger);
    updateStatBar("happiness", petState.happiness);
    updateStatBar("health", petState.health);
    updateStatBar("energy", petState.energy);
    updateStatBar("cleanliness", petState.cleanliness);
    
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

// Actualizar barra de estadística
function updateStatBar(statName, value) {
    const bar = document.getElementById(statName + "Bar");
    const valueSpan = document.getElementById(statName + "Value");
    
    bar.style.width = value + "%";
    valueSpan.textContent = Math.round(value) + "%";
    
    // Cambiar color según el valor
    if (value < 20) {
        bar.style.filter = "brightness(0.6) saturate(1.5)";
    } else if (value < 50) {
        bar.style.filter = "brightness(0.8)";
    } else {
        bar.style.filter = "brightness(1)";
    }
}

// Actualizar apariencia de la mascota
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

// Actualizar accesorios
function updateAccessories() {
    const accessoriesContainer = document.getElementById("petAccessories");
    accessoriesContainer.innerHTML = "";
    
    petState.accessories.forEach(accessoryId => {
        const accessory = shopItems.accessories.find(item => item.id === accessoryId);
        if (accessory) {
            const accessoryElement = document.createElement("div");
            accessoryElement.className = `accessory ${accessory.id}`;
            accessoryElement.textContent = accessory.icon;
            accessoriesContainer.appendChild(accessoryElement);
        }
    });
}

// Actualizar mensaje de estado
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

// Sistema de habitaciones
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

// Manejar acciones
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
            viewFoodInventory();
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
        
        // Acciones de la Tienda
        case "openShop":
            openShop();
            break;
        case "dailyGift":
            claimDailyGift();
            break;
        case "inventory":
            showInventory();
            break;
        case "achievements":
            showAchievements();
            break;
    }
}

// === NUEVAS FUNCIONES ESPECÍFICAS ===

// Alimentar desde inventario
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
    
    // Mostrar opciones de comida disponible
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
            // Aplicar efectos de la comida
            if (selectedFood.effect === "all") {
                petState.hunger = Math.min(100, petState.hunger + selectedFood.value);
                petState.happiness = Math.min(100, petState.happiness + selectedFood.value);
                petState.health = Math.min(100, petState.health + selectedFood.value);
                petState.energy = Math.min(100, petState.energy + selectedFood.value);
                petState.cleanliness = Math.min(100, petState.cleanliness + selectedFood.value);
            } else {
                petState[selectedFood.effect] = Math.min(100, petState[selectedFood.effect] + selectedFood.value);
            }
            
            // Remover comida del inventario
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

// Ver inventario de comida
function viewFoodInventory() {
    if (petState.foodInventory.length === 0) {
        showMessage("📦 Tu inventario de comida está vacío. ¡Compra comida en la tienda!", "warning");
        return;
    }
    
    let inventoryText = "📦 Inventario de Comida:\n\n";
    const foodCounts = {};
    
    // Contar cantidad de cada comida
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

// Usar decoraciones
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

// Jugar con juguetes
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
    
    // Seleccionar juguete aleatorio
    const randomToyId = petState.toys[Math.floor(Math.random() * petState.toys.length)];
    const selectedToy = shopItems.toys.find(item => item.id === randomToyId);
    
    if (selectedToy) {
        const coinsEarned = Math.floor(Math.random() * 10) + 5; // 5-15 monedas
        
        petState.happiness = Math.min(100, petState.happiness + 25);
        petState.energy = Math.max(0, petState.energy - 15);
        petState.coins += coinsEarned;
        
        addPetAnimation("playing");
        gainExperience(15);
        showMessage(`${selectedToy.icon} ¡Tu mascota se divierte con ${selectedToy.name}! +${coinsEarned} monedas`, "success");
        updateDisplay();
        savePetState();
    }
}

// === MINIJUEGOS MEJORADOS ===

// Tres en raya funcional
function playTicTacToe() {
    if (petState.energy < 10) {
        showMessage("😴 Tu mascota está muy cansada para jugar tres en raya.", "warning");
        return;
    }
    
    // Crear tablero interactivo
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
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
            [0, 4, 8], [2, 4, 6] // diagonales
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
    
    // Juego principal
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
                // Turno de la IA
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

// Piedra papel tijera funcional
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

// Acciones específicas existentes
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
    
    // Descanso corto - no bloquea otras acciones por mucho tiempo
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
    
    // Menú de cocina
    const dishes = [
        { name: "Sopa", icon: "🍲", hunger: 40, happiness: 15 },
        { name: "Pizza", icon: "🍕", hunger: 50, happiness: 20 },
        { name: "Arroz", icon: "🍚", hunger: 35, happiness: 10 },
        { name: "Pasta", icon: "🍝", hunger: 45, happiness: 18 }
    ];
    
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    
    // Simular temporizador de cocina
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

function playMemoryGame() {
    if (petState.energy < 15) {
        showMessage("😴 Tu mascota está muy cansada para jugar memoria.", "warning");
        return;
    }
    
    // Juego de memoria con secuencias
    const colors = ["🔴", "🟡", "🟢", "🔵", "🟣"];
    const sequenceLength = Math.floor(Math.random() * 3) + 3; // 3-5 elementos
    const sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    // Mostrar secuencia al jugador
    showMessage(`🧠 Memoriza esta secuencia: ${sequence.join(" ")}`, "info");
    
    setTimeout(() => {
        // Simular que el jugador intenta recordar
        const success = Math.random() > 0.4; // 60% de probabilidad de éxito
        
        petState.happiness = Math.min(100, petState.happiness + 20);
        petState.energy = Math.max(0, petState.energy - 15);
        
        if (success) {
            const coinsEarned = sequenceLength * 3;
            petState.coins += coinsEarned;
            addPetAnimation("happy");
            gainExperience(sequenceLength * 4);
            showMessage(`🧠 ¡Perfecto! Recordaste toda la secuencia de ${sequenceLength} elementos. +${coinsEarned} monedas`, "success");
        } else {
            const coinsEarned = Math.floor(sequenceLength * 1.5);
            petState.coins += coinsEarned;
            addPetAnimation("playing");
            gainExperience(sequenceLength * 2);
            showMessage(`🧠 Casi lo logras. La secuencia era difícil. +${coinsEarned} monedas`, "success");
        }
        
        updateDisplay();
        savePetState();
    }, 3000);
}

function playPlatformGame() {
    initPlatformGame();
    showMessage("🎮 ¡A jugar al Capibara Jump!", "success");
}

// Sistema de animaciones
function addPetAnimation(animationType) {
    const petImage = document.getElementById("petSprite");
    petImage.classList.remove("eating", "playing", "sleeping", "happy", "sick");
    petImage.classList.add(animationType);
    
    setTimeout(() => {
        petImage.classList.remove(animationType);
    }, 1000);
}

// Sistema de tienda
function openShop() {
    document.getElementById("shopModal").classList.add("active");
    changeShopTab("food");
}

function closeShop() {
    document.getElementById("shopModal").classList.remove("active");
}

function changeShopTab(tab) {
    // Actualizar tabs
    document.querySelectorAll(".shop-tab").forEach(tabBtn => {
        tabBtn.classList.remove("active");
        if (tabBtn.dataset.tab === tab) {
            tabBtn.classList.add("active");
        }
    });
    
    // Mostrar items
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
        // Es un item consumible (comida o especial)
        if (item.type === "food") {
            // Agregar al inventario de comida
            petState.foodInventory.push(item.id);
            showMessage(`🍽️ Has comprado ${item.name}! Ahora está en tu inventario de comida.`, "success");
        } else {
            // Usar inmediatamente (pociones especiales)
            if (item.effect === "all") {
                petState.hunger = Math.min(100, petState.hunger + item.value);
                petState.happiness = Math.min(100, petState.happiness + item.value);
                petState.health = Math.min(100, petState.health + item.value);
                petState.energy = Math.min(100, petState.energy + item.value);
                petState.cleanliness = Math.min(100, petState.cleanliness + item.value);
                showMessage(`✨ Has usado ${item.name}! +${item.value} a todas las estadísticas`, "success");
            } else if (item.effect === "special") {
                if (item.id === "youth_potion") {
                    petState.age = Math.max(0, petState.age - 5);
                    showMessage(`⏰ ¡${item.name} usado! Tu mascota es 5 días más joven.`, "success");
                } else if (item.id === "lucky_charm") {
                    // Implementar efecto de suerte (duplicar monedas por 1 hora)
                    showMessage(`🍀 ¡${item.name} activado! Las monedas se duplicarán por 1 hora.`, "success");
                }
            } else {
                petState[item.effect] = Math.min(100, petState[item.effect] + item.value);
                showMessage(`✨ Has usado ${item.name}! +${item.value} ${item.effect}`, "success");
            }
        }
        addPetAnimation("happy");
        gainExperience(5);
    } else if (item.type === "accessory") {
        petState.inventory.push(item.id);
        petState.accessories.push(item.id);
        showMessage(`👒 Has comprado ${item.name}!`, "success");
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

// Sistema de regalo diario
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
    
    const giftCoins = Math.floor(Math.random() * 20) + 10; // 10-30 monedas
    petState.coins += giftCoins;
    petState.dailyGiftClaimed = true;
    petState.lastDailyGift = today;
    
    addPetAnimation("happy");
    gainExperience(15);
    showMessage(`🎁 ¡Regalo diario! Has recibido ${giftCoins} monedas!`, "success");
    updateDisplay();
    savePetState();
}

// Sistema de configuración
function openSettings() {
    document.getElementById("settingsModal").classList.add("active");
    document.getElementById("petNameInput").value = petState.name;
    
    // Actualizar selección de color
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

// Funciones auxiliares
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
    // Bucle principal del juego que se ejecuta cada segundo
    setInterval(() => {
        // Solo actualizar la visualización, no las estadísticas
        updateDisplay();
    }, 1000);
}

// Funciones de inventario y logros mejoradas
function showInventory() {
    let inventoryText = "🎒 INVENTARIO COMPLETO:\n\n";
    
    // Comida
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
    
    // Accesorios
    if (petState.accessories.length > 0) {
        inventoryText += "👒 ACCESORIOS:\n";
        petState.accessories.forEach(accessoryId => {
            const accessory = shopItems.accessories.find(i => i.id === accessoryId);
            if (accessory) {
                inventoryText += `${accessory.icon} ${accessory.name}\n`;
            }
        });
        inventoryText += "\n";
    }
    
    // Decoraciones
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
    
    // Juguetes
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

function showAchievements() {
    let achievementsText = "🏆 LOGROS Y ESTADÍSTICAS:\n\n";
    achievementsText += `📊 Nivel alcanzado: ${petState.level}\n`;
    achievementsText += `🎂 Días de vida: ${petState.age}\n`;
    achievementsText += `💰 Monedas totales: ${petState.coins}\n`;
    achievementsText += `🎒 Items en inventario: ${petState.inventory.length + petState.foodInventory.length}\n`;
    achievementsText += `👒 Accesorios: ${petState.accessories.length}\n`;
    achievementsText += `🎨 Decoraciones: ${petState.decorations.length}\n`;
    achievementsText += `🧸 Juguetes: ${petState.toys.length}\n`;
    achievementsText += `🍽️ Comida almacenada: ${petState.foodInventory.length}\n\n`;
    
    // Logros especiales
    achievementsText += "🌟 LOGROS ESPECIALES:\n";
    if (petState.level >= 10) achievementsText += "⭐ Maestro Cuidador (Nivel 10+)\n";
    if (petState.age >= 30) achievementsText += "🎂 Veterano (30+ días)\n";
    if (petState.coins >= 1000) achievementsText += "💎 Millonario Virtual (1000+ monedas)\n";
    if (petState.inventory.length >= 20) achievementsText += "🛍️ Coleccionista (20+ items)\n";
    
    alert(achievementsText);
}

// Inicializar el juego cuando se carga la página
document.addEventListener("DOMContentLoaded", initGame);

// Guardar estado antes de cerrar la página
window.addEventListener("beforeunload", savePetState);

// --- Lógica del Juego de Plataformas (Capibara Jump) ---

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
const JUMP_STRENGTH = -10;
const GRAVITY = 0.3;
const PLATFORM_SPEED = 0.8;
const CAMERA_FOLLOW_SPEED = 0.1;
const COIN_SIZE = 20;

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
        this.velocityX = Math.max(this.velocityX - 1, -5);
    };
    
    this.moveRight = function() {
        this.velocityX = Math.min(this.velocityX + 1, 5);
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

// Controles táctiles
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

// Funciones globales
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