// Quests data for RPG Discord bot

// Define all quests
const QUESTS = [
  // Beginner quests
  {
    id: 'gather_wood',
    name: 'Woodcutter\'s Task',
    description: 'Gather wood for the local carpenter',
    type: 'gather',
    itemType: 'wood',
    target: 10,
    minLevel: 1,
    activity: 'farm',
    reward: {
      gold: 30,
      xp: 50,
      item: 'health_potion',
      itemQuantity: 1,
      itemName: 'Health Potion'
    },
    category: 'Gathering'
  },
  {
    id: 'hunt_leather',
    name: 'Leather Collection',
    description: 'Collect leather for the town\'s leatherworker',
    type: 'gather',
    itemType: 'leather',
    target: 8,
    minLevel: 2,
    activity: 'hunt',
    reward: {
      gold: 40,
      xp: 60,
      item: 'leather_armor',
      itemQuantity: 1,
      itemName: 'Leather Armor'
    },
    category: 'Gathering'
  },
  {
    id: 'fish_dinner',
    name: 'Fishing for Dinner',
    description: 'Catch fish for the village feast',
    type: 'gather',
    itemType: 'fish',
    target: 5,
    minLevel: 3,
    activity: 'fish',
    reward: {
      gold: 35,
      xp: 55,
      item: 'health_potion',
      itemQuantity: 2,
      itemName: 'Health Potion'
    },
    category: 'Gathering'
  },
  {
    id: 'forest_visit',
    name: 'Forest Exploration',
    description: 'Explore the forest to map the area',
    type: 'location',
    location: 'Forest',
    target: 3,
    minLevel: 1,
    reward: {
      gold: 50,
      xp: 75,
      item: 'wooden_sword',
      itemQuantity: 1,
      itemName: 'Wooden Sword'
    },
    category: 'Exploration'
  },
  {
    id: 'wolf_hunter',
    name: 'Wolf Hunter',
    description: 'Hunt wolves that have been threatening the village',
    type: 'kill',
    enemyType: 'Wolf',
    target: 5,
    minLevel: 2,
    reward: {
      gold: 60,
      xp: 80,
      item: 'strength_potion',
      itemQuantity: 1,
      itemName: 'Strength Potion'
    },
    category: 'Combat'
  },
  
  // Intermediate quests
  {
    id: 'mine_iron',
    name: 'Iron Collector',
    description: 'Gather iron ore for the town blacksmith',
    type: 'gather',
    itemType: 'iron',
    target: 12,
    minLevel: 5,
    activity: 'mine',
    reward: {
      gold: 80,
      xp: 100,
      item: 'iron_sword',
      itemQuantity: 1,
      itemName: 'Iron Sword'
    },
    category: 'Gathering',
    prerequisites: ['gather_wood']
  },
  {
    id: 'cave_explorer',
    name: 'Cave Explorer',
    description: 'Explore the dangerous cave system near town',
    type: 'location',
    location: 'Cave',
    target: 3,
    minLevel: 6,
    reward: {
      gold: 90,
      xp: 120,
      item: 'defense_potion',
      itemQuantity: 2,
      itemName: 'Defense Potion'
    },
    category: 'Exploration',
    prerequisites: ['forest_visit']
  },
  {
    id: 'troll_slayer',
    name: 'Troll Slayer',
    description: 'Defeat the trolls that live in the cave',
    type: 'kill',
    enemyType: 'Troll',
    target: 3,
    minLevel: 7,
    reward: {
      gold: 120,
      xp: 150,
      item: 'iron_armor',
      itemQuantity: 1,
      itemName: 'Iron Armor'
    },
    category: 'Combat',
    prerequisites: ['wolf_hunter']
  },
  {
    id: 'craft_potions',
    name: 'Potion Crafter',
    description: 'Craft health potions for the adventurers guild',
    type: 'craft',
    itemType: 'health_potion',
    target: 5,
    minLevel: 5,
    reward: {
      gold: 70,
      xp: 90,
      item: 'super_health_potion',
      itemQuantity: 1,
      itemName: 'Super Health Potion'
    },
    category: 'Crafting'
  },
  {
    id: 'lake_fishing',
    name: 'Lake Fishing Expedition',
    description: 'Fish in the lake to discover rare aquatic species',
    type: 'location',
    location: 'Lake',
    target: 2,
    minLevel: 4,
    reward: {
      gold: 60,
      xp: 80,
      item: 'pearl',
      itemQuantity: 1,
      itemName: 'Pearl'
    },
    category: 'Exploration',
    prerequisites: ['fish_dinner']
  },
  
  // Advanced quests
  {
    id: 'mountain_climber',
    name: 'Mountain Climber',
    description: 'Scale the treacherous mountain peaks',
    type: 'location',
    location: 'Mountain',
    target: 3,
    minLevel: 10,
    reward: {
      gold: 150,
      xp: 200,
      item: 'diamond',
      itemQuantity: 1,
      itemName: 'Diamond'
    },
    category: 'Exploration',
    prerequisites: ['cave_explorer']
  },
  {
    id: 'griffin_hunter',
    name: 'Griffin Hunter',
    description: 'Hunt the griffins that nest in the mountains',
    type: 'kill',
    enemyType: 'Griffin',
    target: 2,
    minLevel: 12,
    reward: {
      gold: 180,
      xp: 250,
      item: 'rare_pelt',
      itemQuantity: 1,
      itemName: 'Rare Pelt'
    },
    category: 'Combat',
    prerequisites: ['troll_slayer']
  },
  {
    id: 'gold_prospector',
    name: 'Gold Prospector',
    description: 'Mine for gold in the rich mountain veins',
    type: 'gather',
    itemType: 'gold',
    target: 8,
    minLevel: 11,
    activity: 'mine',
    reward: {
      gold: 200,
      xp: 180,
      item: 'gold_ring',
      itemQuantity: 1,
      itemName: 'Gold Ring'
    },
    category: 'Gathering',
    prerequisites: ['mine_iron']
  },
  {
    id: 'craft_armor',
    name: 'Armor Smith',
    description: 'Craft iron armor for the town guard',
    type: 'craft',
    itemType: 'iron_armor',
    target: 1,
    minLevel: 10,
    reward: {
      gold: 150,
      xp: 200,
      item: 'steel_armor',
      itemQuantity: 1,
      itemName: 'Steel Armor'
    },
    category: 'Crafting',
    prerequisites: ['craft_potions']
  },
  {
    id: 'desert_explorer',
    name: 'Desert Explorer',
    description: 'Brave the scorching desert heat to find ancient treasures',
    type: 'location',
    location: 'Desert',
    target: 3,
    minLevel: 9,
    reward: {
      gold: 130,
      xp: 170,
      item: 'ancient_coin',
      itemQuantity: 3,
      itemName: 'Ancient Coin'
    },
    category: 'Exploration'
  },
  
  // Expert quests
  {
    id: 'ancient_ruins_explorer',
    name: 'Ancient Ruins Explorer',
    description: 'Explore the dangerous ruins of a forgotten civilization',
    type: 'location',
    location: 'Ancient Ruins',
    target: 3,
    minLevel: 15,
    reward: {
      gold: 250,
      xp: 300,
      item: 'ancient_relic',
      itemQuantity: 1,
      itemName: 'Ancient Relic'
    },
    category: 'Exploration',
    prerequisites: ['desert_explorer']
  },
  {
    id: 'guardian_slayer',
    name: 'Guardian Slayer',
    description: 'Defeat the Ancient Guardians that protect the ruins',
    type: 'kill',
    enemyType: 'Ancient Guardian',
    target: 2,
    minLevel: 17,
    reward: {
      gold: 300,
      xp: 350,
      item: 'steel_sword',
      itemQuantity: 1,
      itemName: 'Steel Sword'
    },
    category: 'Combat',
    prerequisites: ['griffin_hunter']
  },
  {
    id: 'diamond_collector',
    name: 'Diamond Collector',
    description: 'Collect rare diamonds from the deepest cave systems',
    type: 'gather',
    itemType: 'diamond',
    target: 3,
    minLevel: 15,
    activity: 'mine',
    reward: {
      gold: 350,
      xp: 320,
      item: 'treasure_chest',
      itemQuantity: 1,
      itemName: 'Treasure Chest'
    },
    category: 'Gathering',
    prerequisites: ['gold_prospector']
  },
  {
    id: 'enchanted_forest_explorer',
    name: 'Enchanted Forest Explorer',
    description: 'Brave the magical Enchanted Forest and discover its secrets',
    type: 'location',
    location: 'Enchanted Forest',
    target: 3,
    minLevel: 20,
    reward: {
      gold: 400,
      xp: 450,
      item: 'pet_egg',
      itemQuantity: 1,
      itemName: 'Pet Egg'
    },
    category: 'Exploration',
    prerequisites: ['ancient_ruins_explorer']
  },
  
  // Master quests
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    description: 'Venture into the Dragon\'s Lair and slay an Elder Dragon',
    type: 'kill',
    enemyType: 'Elder Dragon',
    target: 1,
    minLevel: 25,
    reward: {
      gold: 1000,
      xp: 1500,
      item: 'dragon_slayer',
      itemQuantity: 1,
      itemName: 'Dragon Slayer Sword'
    },
    category: 'Combat',
    prerequisites: ['guardian_slayer', 'enchanted_forest_explorer']
  },
  {
    id: 'elemental_slayer',
    name: 'Elemental Hunter',
    description: 'Defeat the powerful Forest Elementals of the Enchanted Forest',
    type: 'kill',
    enemyType: 'Forest Elemental',
    target: 3,
    minLevel: 22,
    reward: {
      gold: 500,
      xp: 600,
      item: 'rare_pet_egg',
      itemQuantity: 1,
      itemName: 'Rare Pet Egg'
    },
    category: 'Combat',
    prerequisites: ['enchanted_forest_explorer']
  },
  {
    id: 'gem_collector',
    name: 'Gem Collector',
    description: 'Collect valuable gems from across the land',
    type: 'gather',
    itemType: 'ruby',
    target: 2,
    minLevel: 20,
    reward: {
      gold: 450,
      xp: 500,
      item: 'flame_dagger',
      itemQuantity: 1,
      itemName: 'Flame Dagger'
    },
    category: 'Gathering',
    prerequisites: ['diamond_collector']
  },
  {
    id: 'master_craftsman',
    name: 'Master Craftsman',
    description: 'Craft multiple rare items to prove your mastery',
    type: 'craft',
    itemType: 'steel_armor',
    target: 1,
    minLevel: 20,
    reward: {
      gold: 600,
      xp: 700,
      item: 'crafters_gloves',
      itemQuantity: 1,
      itemName: 'Crafter\'s Gloves'
    },
    category: 'Crafting',
    prerequisites: ['craft_armor']
  },
  {
    id: 'dragon_scale_collector',
    name: 'Dragon Scale Collector',
    description: 'Collect scales from defeated dragons',
    type: 'gather',
    itemType: 'rare_pelt', // Using rare_pelt as substitute for dragon scales
    target: 5,
    minLevel: 28,
    reward: {
      gold: 800,
      xp: 1000,
      item: 'dragon_scale',
      itemQuantity: 1,
      itemName: 'Dragon Scale Armor'
    },
    category: 'Gathering',
    prerequisites: ['dragon_slayer']
  }
];

module.exports = QUESTS;
