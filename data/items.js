// Items data for RPG Discord bot

// Define all game items
const ITEMS = {
    // Materials
    'wood': { id: 'wood', name: 'Wood', description: 'A piece of wood', value: 5, type: 'material' },
    'stone': { id: 'stone', name: 'Stone', description: 'A piece of stone', value: 7, type: 'material' },
    'iron': { id: 'iron', name: 'Iron Ore', description: 'A chunk of iron ore', value: 20, type: 'material' },
    'gold': { id: 'gold', name: 'Gold Ore', description: 'A precious chunk of gold', value: 50, type: 'material' },
    'diamond': { id: 'diamond', name: 'Diamond', description: 'A rare and valuable gem', value: 200, type: 'material' },
    'herb': { id: 'herb', name: 'Herb', description: 'A medicinal herb', value: 15, type: 'material' },
    'fish': { id: 'fish', name: 'Fish', description: 'A freshly caught fish', value: 25, type: 'material' },
    'leather': { id: 'leather', name: 'Leather', description: 'Animal hide processed into leather', value: 30, type: 'material' },
    'fur': { id: 'fur', name: 'Fur', description: 'Soft animal fur', value: 35, type: 'material' },
    'seed': { id: 'seed', name: 'Seed', description: 'A mysterious seed that might grow into something valuable', value: 25, type: 'material' },
    'ancient_coin': { id: 'ancient_coin', name: 'Ancient Coin', description: 'A coin from a forgotten civilization', value: 75, type: 'material' },
    'ancient_relic': { id: 'ancient_relic', name: 'Ancient Relic', description: 'A mysterious relic with strange markings', value: 150, type: 'material' },
    'animal_tooth': { id: 'animal_tooth', name: 'Animal Tooth', description: 'A sharp tooth from a wild animal', value: 45, type: 'material' },
    'animal_horn': { id: 'animal_horn', name: 'Animal Horn', description: 'A horn from a wild animal', value: 55, type: 'material' },
    'rare_pelt': { id: 'rare_pelt', name: 'Rare Pelt', description: 'An unusually beautiful animal pelt', value: 120, type: 'material' },
    'seaweed': { id: 'seaweed', name: 'Seaweed', description: 'A slimy plant from the water', value: 20, type: 'material' },
    'pearl': { id: 'pearl', name: 'Pearl', description: 'A beautiful lustrous gem', value: 90, type: 'material' },
    'treasure_chest': { id: 'treasure_chest', name: 'Treasure Chest', description: 'A small chest that might contain valuables', value: 150, type: 'consumable', effect: 'treasure', power: 0 },
    'ruby': { id: 'ruby', name: 'Ruby', description: 'A brilliant red gemstone', value: 180, type: 'material' },
    'sapphire': { id: 'sapphire', name: 'Sapphire', description: 'A brilliant blue gemstone', value: 180, type: 'material' },

    // Weapons
    // Warrior Weapons
    'wooden_sword': { id: 'wooden_sword', name: 'Wooden Sword', description: 'A basic sword made of wood', value: 50, type: 'weapon', power: 5, requirements: { level: 1 }, classRestrictions: ['warrior'] },
    'battle_axe': { id: 'battle_axe', name: 'Battle Axe', description: 'A heavy axe for warriors', value: 300, type: 'weapon', power: 25, requirements: { level: 10 }, classRestrictions: ['warrior'] },
    
    // Ranger Weapons
    'hunting_bow': { id: 'hunting_bow', name: 'Hunting Bow', description: 'A basic bow for rangers', value: 50, type: 'weapon', power: 6, requirements: { level: 1 }, classRestrictions: ['ranger'] },
    'longbow': { id: 'longbow', name: 'Longbow', description: 'A powerful bow with extended range', value: 300, type: 'weapon', power: 28, requirements: { level: 10 }, classRestrictions: ['ranger'] },
    
    // Mage Weapons
    'apprentice_staff': { id: 'apprentice_staff', name: 'Apprentice Staff', description: 'A basic magical staff', value: 50, type: 'weapon', power: 7, requirements: { level: 1 }, classRestrictions: ['mage'] },
    'crystal_wand': { id: 'crystal_wand', name: 'Crystal Wand', description: 'A wand imbued with magical crystals', value: 300, type: 'weapon', power: 30, requirements: { level: 10 }, classRestrictions: ['mage'] },
    'stone_sword': { id: 'stone_sword', name: 'Stone Sword', description: 'A sword made of stone', value: 100, type: 'weapon', power: 10, requirements: { level: 5 } },
    'iron_sword': { id: 'iron_sword', name: 'Iron Sword', description: 'A reliable sword made of iron', value: 250, type: 'weapon', power: 25, requirements: { level: 10 } },
    'steel_sword': { id: 'steel_sword', name: 'Steel Sword', description: 'A powerful sword made of steel', value: 500, type: 'weapon', power: 40, requirements: { level: 15 } },
    'mythril_sword': { id: 'mythril_sword', name: 'Mythril Sword', description: 'A legendary sword made of mythril', value: 1200, type: 'weapon', power: 70, requirements: { level: 25 } },
    'hunter_bow': { id: 'hunter_bow', name: 'Hunter\'s Bow', description: 'A well-crafted bow for hunting', value: 180, type: 'weapon', power: 15, requirements: { level: 8 } },
    'iron_axe': { id: 'iron_axe', name: 'Iron Battle Axe', description: 'A heavy axe that deals serious damage', value: 320, type: 'weapon', power: 30, requirements: { level: 12 } },
    'flame_dagger': { id: 'flame_dagger', name: 'Flame Dagger', description: 'A magical dagger imbued with fire', value: 750, type: 'weapon', power: 45, requirements: { level: 20 } },
    'dragon_slayer': { id: 'dragon_slayer', name: 'Dragon Slayer', description: 'A massive sword said to have slain dragons', value: 2000, type: 'weapon', power: 85, requirements: { level: 30 } },

    // Armor
    'leather_armor': { id: 'leather_armor', name: 'Leather Armor', description: 'Basic protection made of leather', value: 80, type: 'armor', defense: 5, requirements: { level: 1 } },
    'iron_armor': { id: 'iron_armor', name: 'Iron Armor', description: 'Solid protection made of iron', value: 300, type: 'armor', defense: 15, requirements: { level: 10 } },
    'steel_armor': { id: 'steel_armor', name: 'Steel Armor', description: 'Strong protection made of steel', value: 600, type: 'armor', defense: 30, requirements: { level: 15 } },
    'mythril_armor': { id: 'mythril_armor', name: 'Mythril Armor', description: 'Legendary protection made of mythril', value: 1500, type: 'armor', defense: 50, requirements: { level: 25 } },
    'hunter_vest': { id: 'hunter_vest', name: 'Hunter\'s Vest', description: 'Light armor favored by hunters', value: 200, type: 'armor', defense: 10, requirements: { level: 5 } },
    'mage_robes': { id: 'mage_robes', name: 'Mage Robes', description: 'Enchanted robes with magical protection', value: 400, type: 'armor', defense: 20, requirements: { level: 12 } },
    'guardian_plate': { id: 'guardian_plate', name: 'Guardian Plate', description: 'Heavy armor for maximum protection', value: 900, type: 'armor', defense: 40, requirements: { level: 20 } },
    'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale Armor', description: 'Incredibly rare armor made from dragon scales', value: 2500, type: 'armor', defense: 65, requirements: { level: 30 } },

    // Potions & Consumables
    'health_potion': { id: 'health_potion', name: 'Health Potion', description: 'Restores health during adventures', value: 40, type: 'consumable', effect: 'heal', power: 30 },
    'strength_potion': { id: 'strength_potion', name: 'Strength Potion', description: 'Temporarily increases attack power', value: 70, type: 'consumable', effect: 'strength', power: 15 },
    'defense_potion': { id: 'defense_potion', name: 'Defense Potion', description: 'Temporarily increases defense', value: 70, type: 'consumable', effect: 'defense', power: 15 },
    'super_health_potion': { id: 'super_health_potion', name: 'Super Health Potion', description: 'Restores a large amount of health', value: 120, type: 'consumable', effect: 'heal', power: 75 },

    // Pet Items
    'pet_egg': { id: 'pet_egg', name: 'Pet Egg', description: 'Can be hatched to get a pet companion', value: 250, type: 'pet' },
    'rare_pet_egg': { id: 'rare_pet_egg', name: 'Rare Pet Egg', description: 'Can be hatched to get a rare pet companion', value: 500, type: 'pet' },
    'pet_food': { id: 'pet_food', name: 'Pet Food', description: 'Quality food to feed your pet', value: 30, type: 'pet', effect: 'pet_food', power: 30 },
    'pet_treat': { id: 'pet_treat', name: 'Pet Treat', description: 'A tasty treat for your pet', value: 15, type: 'pet', effect: 'pet_food', power: 15 },
    'pet_toy': { id: 'pet_toy', name: 'Pet Toy', description: 'A toy to keep your pet happy', value: 25, type: 'pet', effect: 'pet_toy', power: 25 },

    // Special Items
    'legendary_key': { id: 'legendary_key', name: 'Legendary Key', description: 'A mysterious key that might unlock something valuable', value: 500, type: 'special' },
    'gold_ring': { id: 'gold_ring', name: 'Gold Ring', description: 'A beautifully crafted ring of gold', value: 300, type: 'special' },
    'crafters_gloves': { id: 'crafters_gloves', name: 'Crafter\'s Gloves', description: 'Special gloves that improve crafting skills', value: 400, type: 'special' }
};

// Crafting recipes
const RECIPES = {
    'wooden_sword': { 
        materials: { 'wood': 5 }, 
        result: 'wooden_sword',
        count: 1
    },
    'stone_sword': { 
        materials: { 'wood': 3, 'stone': 8 }, 
        result: 'stone_sword',
        count: 1
    },
    'iron_sword': { 
        materials: { 'wood': 3, 'iron': 10 }, 
        result: 'iron_sword',
        count: 1
    },
    'steel_sword': { 
        materials: { 'wood': 2, 'iron': 15, 'stone': 5 }, 
        result: 'steel_sword',
        count: 1
    },
    'leather_armor': { 
        materials: { 'leather': 10 }, 
        result: 'leather_armor',
        count: 1
    },
    'iron_armor': { 
        materials: { 'iron': 15, 'leather': 5 }, 
        result: 'iron_armor',
        count: 1
    },
    'hunter_vest': { 
        materials: { 'leather': 8, 'fur': 5 }, 
        result: 'hunter_vest',
        count: 1
    },
    'hunter_bow': { 
        materials: { 'wood': 8, 'leather': 2 }, 
        result: 'hunter_bow',
        count: 1
    },
    'health_potion': { 
        materials: { 'herb': 3 }, 
        result: 'health_potion',
        count: 1
    },
    'strength_potion': { 
        materials: { 'herb': 2, 'animal_tooth': 1 }, 
        result: 'strength_potion',
        count: 1
    },
    'defense_potion': { 
        materials: { 'herb': 2, 'animal_horn': 1 }, 
        result: 'defense_potion',
        count: 1
    },
    'super_health_potion': { 
        materials: { 'health_potion': 2, 'rare_pelt': 1 }, 
        result: 'super_health_potion',
        count: 1
    },
    'iron_axe': { 
        materials: { 'wood': 4, 'iron': 12 }, 
        result: 'iron_axe',
        count: 1
    },
    'pet_food': { 
        materials: { 'fish': 2, 'herb': 1 }, 
        result: 'pet_food',
        count: 2
    },
    'pet_treat': { 
        materials: { 'fish': 1 }, 
        result: 'pet_treat',
        count: 3
    },
    'pet_toy': { 
        materials: { 'wood': 2, 'leather': 1 }, 
        result: 'pet_toy',
        count: 1
    }
};

module.exports = ITEMS;
module.exports.RECIPES = RECIPES;
