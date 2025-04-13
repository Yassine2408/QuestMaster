// Adventure locations for RPG Discord bot

// Define all adventure locations
const ADVENTURE_LOCATIONS = [
  {
    name: 'Forest',
    description: 'A dense forest with various resources and creatures',
    minLevel: 1,
    rewards: {
      xp: { min: 10, max: 30 },
      gold: { min: 5, max: 20 },
      items: [
        { id: 'wood', chance: 0.8, min: 1, max: 5 },
        { id: 'herb', chance: 0.4, min: 1, max: 3 },
        { id: 'seed', chance: 0.2, min: 1, max: 1 },
        { id: 'wooden_sword', chance: 0.05, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Wolf', hp: 20, attack: 5, defense: 2, xp: 15, gold: 10 },
      { name: 'Bandit', hp: 30, attack: 8, defense: 3, xp: 20, gold: 15 },
      { name: 'Wild Boar', hp: 25, attack: 6, defense: 4, xp: 18, gold: 12 }
    ]
  },
  {
    name: 'Cave',
    description: 'A dark cave with valuable minerals and dangerous creatures',
    minLevel: 5,
    rewards: {
      xp: { min: 30, max: 50 },
      gold: { min: 15, max: 40 },
      items: [
        { id: 'stone', chance: 0.7, min: 2, max: 6 },
        { id: 'iron', chance: 0.4, min: 1, max: 4 },
        { id: 'gold', chance: 0.2, min: 1, max: 2 },
        { id: 'diamond', chance: 0.05, min: 1, max: 1 },
        { id: 'ancient_coin', chance: 0.1, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Bat', hp: 15, attack: 3, defense: 1, xp: 10, gold: 5 },
      { name: 'Spider', hp: 25, attack: 7, defense: 2, xp: 18, gold: 12 },
      { name: 'Troll', hp: 60, attack: 15, defense: 8, xp: 40, gold: 35 },
      { name: 'Cave Goblin', hp: 35, attack: 10, defense: 5, xp: 25, gold: 20 }
    ]
  },
  {
    name: 'Mountain',
    description: 'High mountains with rare resources and powerful enemies',
    minLevel: 10,
    rewards: {
      xp: { min: 50, max: 100 },
      gold: { min: 30, max: 80 },
      items: [
        { id: 'stone', chance: 0.8, min: 3, max: 8 },
        { id: 'iron', chance: 0.5, min: 2, max: 5 },
        { id: 'gold', chance: 0.3, min: 1, max: 3 },
        { id: 'diamond', chance: 0.1, min: 1, max: 2 },
        { id: 'animal_horn', chance: 0.25, min: 1, max: 2 },
        { id: 'rare_pelt', chance: 0.15, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Mountain Lion', hp: 40, attack: 12, defense: 6, xp: 30, gold: 25 },
      { name: 'Griffin', hp: 80, attack: 20, defense: 10, xp: 70, gold: 60 },
      { name: 'Rock Golem', hp: 100, attack: 18, defense: 20, xp: 80, gold: 50 },
      { name: 'Dragon', hp: 150, attack: 35, defense: 25, xp: 150, gold: 150 }
    ]
  },
  {
    name: 'Lake',
    description: 'A serene lake with abundant fish and water creatures',
    minLevel: 3,
    rewards: {
      xp: { min: 20, max: 40 },
      gold: { min: 10, max: 30 },
      items: [
        { id: 'fish', chance: 0.9, min: 2, max: 6 },
        { id: 'seaweed', chance: 0.5, min: 1, max: 3 },
        { id: 'pearl', chance: 0.15, min: 1, max: 1 },
        { id: 'treasure_chest', chance: 0.08, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Giant Fish', hp: 30, attack: 8, defense: 3, xp: 20, gold: 15 },
      { name: 'Water Snake', hp: 25, attack: 10, defense: 2, xp: 22, gold: 18 },
      { name: 'Lake Spirit', hp: 45, attack: 12, defense: 8, xp: 35, gold: 30 }
    ]
  },
  {
    name: 'Desert',
    description: 'A vast, scorching desert with hidden treasures and dangerous creatures',
    minLevel: 8,
    rewards: {
      xp: { min: 40, max: 70 },
      gold: { min: 25, max: 60 },
      items: [
        { id: 'stone', chance: 0.6, min: 2, max: 5 },
        { id: 'gold', chance: 0.3, min: 1, max: 3 },
        { id: 'ancient_coin', chance: 0.25, min: 1, max: 2 },
        { id: 'ancient_relic', chance: 0.1, min: 1, max: 1 },
        { id: 'ruby', chance: 0.08, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Scorpion', hp: 35, attack: 10, defense: 8, xp: 25, gold: 20 },
      { name: 'Sand Worm', hp: 60, attack: 15, defense: 5, xp: 40, gold: 35 },
      { name: 'Desert Bandit', hp: 45, attack: 12, defense: 7, xp: 30, gold: 40 },
      { name: 'Mummy', hp: 70, attack: 18, defense: 12, xp: 60, gold: 55 }
    ]
  },
  {
    name: 'Ancient Ruins',
    description: 'The remains of a once-great civilization, filled with treasures and undead',
    minLevel: 15,
    rewards: {
      xp: { min: 70, max: 120 },
      gold: { min: 50, max: 100 },
      items: [
        { id: 'ancient_coin', chance: 0.5, min: 1, max: 4 },
        { id: 'ancient_relic', chance: 0.3, min: 1, max: 2 },
        { id: 'gold', chance: 0.4, min: 2, max: 5 },
        { id: 'legendary_key', chance: 0.05, min: 1, max: 1 },
        { id: 'ruby', chance: 0.12, min: 1, max: 1 },
        { id: 'sapphire', chance: 0.12, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Skeleton', hp: 50, attack: 15, defense: 10, xp: 40, gold: 30 },
      { name: 'Mummified Priest', hp: 65, attack: 20, defense: 15, xp: 55, gold: 50 },
      { name: 'Ghost', hp: 40, attack: 25, defense: 5, xp: 50, gold: 45 },
      { name: 'Ancient Guardian', hp: 120, attack: 30, defense: 25, xp: 100, gold: 90 }
    ]
  },
  {
    name: 'Enchanted Forest',
    description: 'A magical forest where reality itself seems altered',
    minLevel: 20,
    rewards: {
      xp: { min: 90, max: 150 },
      gold: { min: 60, max: 120 },
      items: [
        { id: 'wood', chance: 0.8, min: 3, max: 8 },
        { id: 'herb', chance: 0.6, min: 2, max: 6 },
        { id: 'diamond', chance: 0.2, min: 1, max: 2 },
        { id: 'rare_pelt', chance: 0.3, min: 1, max: 1 },
        { id: 'pet_egg', chance: 0.1, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Faerie', hp: 40, attack: 15, defense: 15, xp: 45, gold: 50 },
      { name: 'Mystical Deer', hp: 60, attack: 18, defense: 20, xp: 60, gold: 55 },
      { name: 'Forest Elemental', hp: 90, attack: 25, defense: 15, xp: 80, gold: 70 },
      { name: 'Ancient Treant', hp: 150, attack: 30, defense: 30, xp: 120, gold: 100 }
    ]
  },
  {
    name: 'Dragon\'s Lair',
    description: 'The dangerous home of the most powerful creatures in the realm',
    minLevel: 25,
    rewards: {
      xp: { min: 150, max: 300 },
      gold: { min: 100, max: 250 },
      items: [
        { id: 'diamond', chance: 0.4, min: 1, max: 3 },
        { id: 'gold', chance: 0.7, min: 3, max: 8 },
        { id: 'rare_pelt', chance: 0.5, min: 1, max: 2 },
        { id: 'ruby', chance: 0.3, min: 1, max: 2 },
        { id: 'sapphire', chance: 0.3, min: 1, max: 2 },
        { id: 'rare_pet_egg', chance: 0.08, min: 1, max: 1 },
        { id: 'legendary_key', chance: 0.1, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Drake', hp: 120, attack: 35, defense: 25, xp: 100, gold: 120 },
      { name: 'Wyvern', hp: 150, attack: 40, defense: 30, xp: 130, gold: 150 },
      { name: 'Dragon Knight', hp: 180, attack: 45, defense: 35, xp: 150, gold: 180 },
      { name: 'Elder Dragon', hp: 250, attack: 60, defense: 45, xp: 200, gold: 250 }
    ]
  }
];

module.exports = {
  ADVENTURE_LOCATIONS
};
