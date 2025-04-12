// RPG Discord Bot
// A Discord bot implementing RPG game mechanics where users can farm resources,
// gain XP, level up, and trade items.

const fs = require('fs');
const http = require('http');
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// Create a simple HTTP server for UptimeRobot pings
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Discord RPG Bot is online!');
});
server.listen(3000, () => {
  console.log('Web server running on port 3000');
});

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

// Note: For full functionality, enable the "Message Content Intent" and "Server Members Intent"
// in your Discord Developer Portal > Applications > Your Bot > Bot > Privileged Gateway Intents

// Bot configuration
const CONFIG = {
  prefix: '!', // Command prefix
  saveInterval: 5 * 60 * 1000, // Save data every 5 minutes
  dataFile: 'rpg_data.json', // File to store persistent data
  currency: '🪙', // Currency symbol
  farmCooldown: 60 * 1000, // Farming cooldown in milliseconds (1 minute)
  adventureCooldown: 5 * 60 * 1000, // Adventure cooldown (5 minutes)
  huntCooldown: 3 * 60 * 1000, // Hunting cooldown (3 minutes)
  mineCooldown: 2 * 60 * 1000, // Mining cooldown (2 minutes)
  fishCooldown: 2 * 60 * 1000 // Fishing cooldown (2 minutes)
};

// In-memory database
let gameData = {
  players: {},
  partyInvites: {}, // Store party invites
  parties: {} // Store active parties
};

// Game items
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
  
  // Weapons
  'wooden_sword': { id: 'wooden_sword', name: 'Wooden Sword', description: 'A basic sword made of wood', value: 50, type: 'weapon', power: 5, requirements: { level: 1 } },
  'stone_sword': { id: 'stone_sword', name: 'Stone Sword', description: 'A sword made of stone', value: 100, type: 'weapon', power: 10, requirements: { level: 5 } },
  'iron_sword': { id: 'iron_sword', name: 'Iron Sword', description: 'A reliable sword made of iron', value: 250, type: 'weapon', power: 25, requirements: { level: 10 } },
  'steel_sword': { id: 'steel_sword', name: 'Steel Sword', description: 'A powerful sword made of steel', value: 500, type: 'weapon', power: 40, requirements: { level: 15 } },
  'mythril_sword': { id: 'mythril_sword', name: 'Mythril Sword', description: 'A legendary sword made of mythril', value: 1200, type: 'weapon', power: 70, requirements: { level: 25 } },
  
  // Armor
  'leather_armor': { id: 'leather_armor', name: 'Leather Armor', description: 'Basic protection made of leather', value: 80, type: 'armor', defense: 5, requirements: { level: 1 } },
  'iron_armor': { id: 'iron_armor', name: 'Iron Armor', description: 'Solid protection made of iron', value: 300, type: 'armor', defense: 15, requirements: { level: 10 } },
  'steel_armor': { id: 'steel_armor', name: 'Steel Armor', description: 'Strong protection made of steel', value: 600, type: 'armor', defense: 30, requirements: { level: 15 } },
  'mythril_armor': { id: 'mythril_armor', name: 'Mythril Armor', description: 'Legendary protection made of mythril', value: 1500, type: 'armor', defense: 50, requirements: { level: 25 } },
  
  // Potions
  'health_potion': { id: 'health_potion', name: 'Health Potion', description: 'Restores health during adventures', value: 40, type: 'consumable', effect: 'heal', power: 30 },
  'strength_potion': { id: 'strength_potion', name: 'Strength Potion', description: 'Temporarily increases attack power', value: 70, type: 'consumable', effect: 'strength', power: 15 }
};

// Shop items (subset of all items that can be purchased)
const SHOP_ITEMS = [
  'wooden_sword',
  'stone_sword',
  'iron_sword',
  'leather_armor',
  'iron_armor',
  'health_potion',
  'strength_potion'
];

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
  'leather_armor': { 
    materials: { 'leather': 10 }, 
    result: 'leather_armor',
    count: 1
  },
  'health_potion': { 
    materials: { 'herb': 3 }, 
    result: 'health_potion',
    count: 1
  }
};

// Locations for adventures
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
        { id: 'wooden_sword', chance: 0.05, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Wolf', hp: 20, attack: 5, xp: 15, gold: 10 },
      { name: 'Bandit', hp: 30, attack: 8, xp: 20, gold: 15 }
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
        { id: 'diamond', chance: 0.05, min: 1, max: 1 }
      ]
    },
    enemies: [
      { name: 'Bat', hp: 15, attack: 3, xp: 10, gold: 5 },
      { name: 'Spider', hp: 25, attack: 7, xp: 18, gold: 12 },
      { name: 'Troll', hp: 60, attack: 15, xp: 40, gold: 35 }
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
        { id: 'diamond', chance: 0.1, min: 1, max: 2 }
      ]
    },
    enemies: [
      { name: 'Mountain Lion', hp: 40, attack: 12, xp: 30, gold: 25 },
      { name: 'Griffin', hp: 80, attack: 20, xp: 70, gold: 60 },
      { name: 'Dragon', hp: 150, attack: 35, xp: 150, gold: 150 }
    ]
  }
];

// Level experience requirements
function getXpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Load data from file if exists
function loadData() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      const data = fs.readFileSync(CONFIG.dataFile, 'utf8');
      gameData = JSON.parse(data);
      console.log('Data loaded successfully!');
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Import backup functionality
const { createBackup } = require('./backup');

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(gameData), 'utf8');
    console.log('Data saved successfully!');
    
    // Create a backup every 5 saves (adjust as needed)
    saveData.counter = (saveData.counter || 0) + 1;
    if (saveData.counter >= 5) {
      createBackup();
      saveData.counter = 0;
    }
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Get or create player data
function getPlayerData(userId) {
  if (!gameData.players[userId]) {
    gameData.players[userId] = {
      level: 1,
      xp: 0,
      gold: 100,
      inventory: {},
      equipped: {
        weapon: null,
        armor: null
      },
      stats: {
        strength: 5,
        defense: 5,
        maxHealth: 100,
        currentHealth: 100
      },
      cooldowns: {
        farm: 0,
        adventure: 0,
        hunt: 0,
        mine: 0,
        fish: 0
      },
      achievements: []
    };
  }
  return gameData.players[userId];
}

// Add item to player inventory
function addItemToInventory(playerData, itemId, quantity = 1) {
  if (!playerData.inventory[itemId]) {
    playerData.inventory[itemId] = 0;
  }
  playerData.inventory[itemId] += quantity;
}

// Remove item from player inventory
function removeItemFromInventory(playerData, itemId, quantity = 1) {
  if (!playerData.inventory[itemId] || playerData.inventory[itemId] < quantity) {
    return false;
  }
  
  playerData.inventory[itemId] -= quantity;
  if (playerData.inventory[itemId] <= 0) {
    delete playerData.inventory[itemId];
  }
  return true;
}

// Award XP to player and handle level ups
function awardXP(playerData, xpAmount) {
  playerData.xp += xpAmount;
  
  // Check for level up
  let levelsGained = 0;
  let newLevel = playerData.level;
  
  while (playerData.xp >= getXpForLevel(newLevel)) {
    playerData.xp -= getXpForLevel(newLevel);
    newLevel++;
    levelsGained++;
    
    // Update stats on level up
    playerData.stats.strength += 2;
    playerData.stats.defense += 2;
    playerData.stats.maxHealth += 10;
    playerData.stats.currentHealth = playerData.stats.maxHealth; // Heal on level up
  }
  
  if (levelsGained > 0) {
    playerData.level = newLevel;
    return levelsGained;
  }
  
  return 0;
}

// Get a random number between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format inventory for display
function formatInventory(inventory) {
  if (Object.keys(inventory).length === 0) {
    return "Your inventory is empty.";
  }
  
  let result = "";
  for (const [itemId, quantity] of Object.entries(inventory)) {
    if (ITEMS[itemId]) {
      result += `${ITEMS[itemId].name} (${quantity}) - ${ITEMS[itemId].description} - Worth: ${ITEMS[itemId].value} ${CONFIG.currency}\n`;
    }
  }
  return result;
}

// Format shop items for display
function formatShopItems() {
  let result = "";
  for (const itemId of SHOP_ITEMS) {
    const item = ITEMS[itemId];
    result += `${item.name} - ${item.description} - Price: ${item.value} ${CONFIG.currency}\n`;
    
    if (item.requirements) {
      result += `Requirements: Level ${item.requirements.level}\n`;
    }
    
    if (item.type === 'weapon') {
      result += `Attack Power: +${item.power}\n`;
    } else if (item.type === 'armor') {
      result += `Defense: +${item.defense}\n`;
    }
    
    result += '\n';
  }
  return result;
}

// Format recipes for display
function formatRecipes() {
  let result = "";
  for (const [recipeId, recipe] of Object.entries(RECIPES)) {
    const resultItem = ITEMS[recipe.result];
    result += `${resultItem.name}:\n`;
    
    for (const [materialId, quantity] of Object.entries(recipe.materials)) {
      const material = ITEMS[materialId];
      result += `- ${material.name}: ${quantity}\n`;
    }
    
    result += '\n';
  }
  return result;
}

// Create a profile embed for a player
function createProfileEmbed(user, playerData) {
  const embed = new MessageEmbed()
    .setTitle(`${user.username}'s Profile`)
    .setColor(0x0099FF)
    .setThumbnail(user.displayAvatarURL())
    .addField('Level', playerData.level.toString(), true)
    .addField('XP', `${playerData.xp}/${getXpForLevel(playerData.level)}`, true)
    .addField('Gold', `${playerData.gold} ${CONFIG.currency}`, true)
    .addField('Stats', `Strength: ${playerData.stats.strength}\nDefense: ${playerData.stats.defense}\nHealth: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, false);
  
  // Add equipped items
  let equippedText = 'None';
  if (playerData.equipped.weapon) {
    const weapon = ITEMS[playerData.equipped.weapon];
    equippedText = `Weapon: ${weapon.name} (+${weapon.power} Strength)`;
    
    if (playerData.equipped.armor) {
      const armor = ITEMS[playerData.equipped.armor];
      equippedText += `\nArmor: ${armor.name} (+${armor.defense} Defense)`;
    }
  } else if (playerData.equipped.armor) {
    const armor = ITEMS[playerData.equipped.armor];
    equippedText = `Armor: ${armor.name} (+${armor.defense} Defense)`;
  }
  
  embed.addField('Equipped', equippedText, false);
  
  return embed;
}

// Farm resources
async function farm(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  // Check cooldown
  const now = Date.now();
  if (playerData.cooldowns.farm > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.farm - now) / 1000);
    return message.reply(`You need to wait ${timeLeft} seconds before farming again.`);
  }
  
  // Set cooldown
  playerData.cooldowns.farm = now + CONFIG.farmCooldown;
  
  // Random amount of resources
  const woodAmount = getRandomInt(1, 3);
  const herbAmount = Math.random() < 0.4 ? getRandomInt(1, 2) : 0;
  const xpGained = getRandomInt(5, 10);
  
  // Add resources to inventory
  addItemToInventory(playerData, 'wood', woodAmount);
  if (herbAmount > 0) {
    addItemToInventory(playerData, 'herb', herbAmount);
  }
  
  // Award XP
  const levelsGained = awardXP(playerData, xpGained);
  
  // Create response
  let response = `You went farming and gathered:\n- ${woodAmount} Wood`;
  if (herbAmount > 0) {
    response += `\n- ${herbAmount} Herbs`;
  }
  response += `\n\nYou gained ${xpGained} XP!`;
  
  if (levelsGained > 0) {
    response += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
  }
  
  return message.reply(response);
}

// Go on an adventure
async function adventure(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  // Check cooldown
  const now = Date.now();
  if (playerData.cooldowns.adventure > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.adventure - now) / 1000);
    return message.reply(`You need to wait ${timeLeft} seconds before going on another adventure.`);
  }
  
  // Select location
  let location;
  if (args.length > 0) {
    const locationName = args.join(' ').toLowerCase();
    location = ADVENTURE_LOCATIONS.find(loc => loc.name.toLowerCase() === locationName);
    
    if (!location) {
      const availableLocations = ADVENTURE_LOCATIONS
        .filter(loc => loc.minLevel <= playerData.level)
        .map(loc => loc.name)
        .join(', ');
      
      return message.reply(`Location not found! Available locations for your level: ${availableLocations}`);
    }
  } else {
    // Default to the first location the player can access
    location = ADVENTURE_LOCATIONS.find(loc => loc.minLevel <= playerData.level);
    
    if (!location) {
      return message.reply("You're not high enough level for any adventures yet. Try farming to level up first!");
    }
  }
  
  // Check level requirement
  if (playerData.level < location.minLevel) {
    return message.reply(`You need to be at least level ${location.minLevel} to adventure in ${location.name}!`);
  }
  
  // Set cooldown
  playerData.cooldowns.adventure = now + CONFIG.adventureCooldown;
  
  // Calculate effective combat stats
  let attackPower = playerData.stats.strength;
  let defense = playerData.stats.defense;
  
  if (playerData.equipped.weapon) {
    attackPower += ITEMS[playerData.equipped.weapon].power;
  }
  
  if (playerData.equipped.armor) {
    defense += ITEMS[playerData.equipped.armor].defense;
  }
  
  // Select random enemy from the location
  const enemy = location.enemies[Math.floor(Math.random() * location.enemies.length)];
  
  // Simulate combat
  let playerHealth = playerData.stats.currentHealth;
  let enemyHealth = enemy.hp;
  let combatLog = [];
  
  while (playerHealth > 0 && enemyHealth > 0) {
    // Player attacks
    const playerDamage = Math.max(1, getRandomInt(attackPower - 3, attackPower + 3));
    enemyHealth -= playerDamage;
    combatLog.push(`You hit the ${enemy.name} for ${playerDamage} damage.`);
    
    if (enemyHealth <= 0) break;
    
    // Enemy attacks
    const enemyDamage = Math.max(1, getRandomInt(enemy.attack - 2, enemy.attack + 2) - Math.floor(defense / 2));
    playerHealth -= enemyDamage;
    combatLog.push(`The ${enemy.name} hits you for ${enemyDamage} damage.`);
  }
  
  // Update player health
  playerData.stats.currentHealth = Math.max(0, playerHealth);
  
  let result = `You ventured into ${location.name} and encountered a ${enemy.name}!\n\n`;
  
  // Limit combat log to last 6 entries to avoid too long messages
  result += combatLog.slice(-6).join('\n') + '\n\n';
  
  let xpGained = 0;
  let goldGained = 0;
  let itemsGained = [];
  
  if (playerHealth > 0) {
    // Victory!
    result += `You defeated the ${enemy.name}!`;
    
    // Award XP and gold
    xpGained = enemy.xp + getRandomInt(location.rewards.xp.min, location.rewards.xp.max);
    goldGained = enemy.gold + getRandomInt(location.rewards.gold.min, location.rewards.gold.max);
    
    playerData.gold += goldGained;
    
    // Chance for item drops
    for (const itemReward of location.rewards.items) {
      if (Math.random() <= itemReward.chance) {
        const quantity = getRandomInt(itemReward.min, itemReward.max);
        addItemToInventory(playerData, itemReward.id, quantity);
        itemsGained.push(`${quantity} ${ITEMS[itemReward.id].name}`);
      }
    }
    
    // Level up check
    const levelsGained = awardXP(playerData, xpGained);
    
    result += `\n\nRewards:`;
    result += `\n- ${xpGained} XP`;
    result += `\n- ${goldGained} ${CONFIG.currency}`;
    
    if (itemsGained.length > 0) {
      result += `\n- Items: ${itemsGained.join(', ')}`;
    }
    
    if (levelsGained > 0) {
      result += `\n\n🎉 You leveled up to level ${playerData.level}! 🎉`;
    }
    
    result += `\n\nRemaining Health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`;
  } else {
    // Defeat
    result += `You were defeated by the ${enemy.name}!`;
    
    // Player loses some gold on defeat
    const goldLost = Math.floor(playerData.gold * 0.1); // Lose 10% of gold
    playerData.gold = Math.max(0, playerData.gold - goldLost);
    
    // Reset health to 25%
    playerData.stats.currentHealth = Math.floor(playerData.stats.maxHealth * 0.25);
    
    result += `\n\nYou lost ${goldLost} ${CONFIG.currency} and barely escaped with your life.`;
    result += `\n\nCurrent Health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`;
  }
  
  return message.reply(result);
}

// Hunt for resources
async function hunt(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  // Check cooldown
  const now = Date.now();
  if (playerData.cooldowns.hunt > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.hunt - now) / 1000);
    return message.reply(`You need to wait ${timeLeft} seconds before hunting again.`);
  }
  
  // Set cooldown
  playerData.cooldowns.hunt = now + CONFIG.huntCooldown;
  
  // Random outcome
  const successRate = 0.7; // 70% success rate
  let result;
  
  if (Math.random() < successRate) {
    // Successful hunt
    const leatherAmount = getRandomInt(1, 3);
    const furAmount = Math.random() < 0.3 ? getRandomInt(1, 2) : 0;
    const xpGained = getRandomInt(10, 20);
    
    addItemToInventory(playerData, 'leather', leatherAmount);
    if (furAmount > 0) {
      addItemToInventory(playerData, 'fur', furAmount);
    }
    
    // Award XP
    const levelsGained = awardXP(playerData, xpGained);
    
    result = `Your hunt was successful! You gathered:\n- ${leatherAmount} Leather`;
    if (furAmount > 0) {
      result += `\n- ${furAmount} Fur`;
    }
    result += `\n\nYou gained ${xpGained} XP!`;
    
    if (levelsGained > 0) {
      result += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
    }
  } else {
    // Failed hunt
    const xpGained = getRandomInt(3, 7);
    const levelsGained = awardXP(playerData, xpGained);
    
    result = `Your hunt was unsuccessful. The animals were too quick today.`;
    result += `\n\nYou gained ${xpGained} XP for the effort!`;
    
    if (levelsGained > 0) {
      result += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
    }
  }
  
  return message.reply(result);
}

// Mine for minerals
async function mine(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  // Check cooldown
  const now = Date.now();
  if (playerData.cooldowns.mine > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.mine - now) / 1000);
    return message.reply(`You need to wait ${timeLeft} seconds before mining again.`);
  }
  
  // Set cooldown
  playerData.cooldowns.mine = now + CONFIG.mineCooldown;
  
  // Random resources
  const stoneAmount = getRandomInt(2, 5);
  const ironChance = 0.6;
  const goldChance = 0.3;
  const diamondChance = 0.1;
  
  let ironAmount = 0;
  let goldAmount = 0;
  let diamondAmount = 0;
  
  if (Math.random() < ironChance) {
    ironAmount = getRandomInt(1, 3);
  }
  
  if (Math.random() < goldChance) {
    goldAmount = getRandomInt(1, 2);
  }
  
  if (Math.random() < diamondChance) {
    diamondAmount = 1;
  }
  
  // Add resources to inventory
  addItemToInventory(playerData, 'stone', stoneAmount);
  if (ironAmount > 0) addItemToInventory(playerData, 'iron', ironAmount);
  if (goldAmount > 0) addItemToInventory(playerData, 'gold', goldAmount);
  if (diamondAmount > 0) addItemToInventory(playerData, 'diamond', diamondAmount);
  
  // Award XP
  const xpGained = getRandomInt(10, 25);
  const levelsGained = awardXP(playerData, xpGained);
  
  // Create response
  let response = `You went mining and gathered:\n- ${stoneAmount} Stone`;
  if (ironAmount > 0) response += `\n- ${ironAmount} Iron Ore`;
  if (goldAmount > 0) response += `\n- ${goldAmount} Gold Ore`;
  if (diamondAmount > 0) response += `\n- ${diamondAmount} Diamond`;
  
  response += `\n\nYou gained ${xpGained} XP!`;
  
  if (levelsGained > 0) {
    response += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
  }
  
  return message.reply(response);
}

// Fish for resources
async function fish(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  // Check cooldown
  const now = Date.now();
  if (playerData.cooldowns.fish > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.fish - now) / 1000);
    return message.reply(`You need to wait ${timeLeft} seconds before fishing again.`);
  }
  
  // Set cooldown
  playerData.cooldowns.fish = now + CONFIG.fishCooldown;
  
  // Random outcome
  const successRate = 0.8; // 80% success rate
  
  if (Math.random() < successRate) {
    // Successful fishing
    const fishAmount = getRandomInt(1, 4);
    const xpGained = getRandomInt(10, 15);
    
    addItemToInventory(playerData, 'fish', fishAmount);
    
    // Award XP
    const levelsGained = awardXP(playerData, xpGained);
    
    let result = `You caught ${fishAmount} fish!`;
    result += `\n\nYou gained ${xpGained} XP!`;
    
    if (levelsGained > 0) {
      result += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
    }
    
    return message.reply(result);
  } else {
    // Failed fishing
    const xpGained = getRandomInt(3, 5);
    const levelsGained = awardXP(playerData, xpGained);
    
    let result = `You didn't catch any fish this time.`;
    result += `\n\nYou gained ${xpGained} XP for the effort!`;
    
    if (levelsGained > 0) {
      result += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
    }
    
    return message.reply(result);
  }
}

// Shop interaction - view, buy, sell
async function shop(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (!args.length) {
    // Show shop
    const embed = new MessageEmbed()
      .setTitle('Item Shop')
      .setDescription(`Your Gold: ${playerData.gold} ${CONFIG.currency}`)
      .setColor(0x00AE86)
      .addField('Available Items', formatShopItems())
      .addField('Commands', '`!shop buy <item>` - Buy an item\n`!shop sell <item> [quantity]` - Sell an item');
    
    return message.reply({ embeds: [embed] });
  }
  
  const action = args[0].toLowerCase();
  
  if (action === 'buy') {
    if (args.length < 2) {
      return message.reply('Please specify an item to buy!');
    }
    
    const itemName = args.slice(1).join(' ').toLowerCase();
    const item = Object.values(ITEMS).find(i => i.name.toLowerCase() === itemName);
    
    if (!item) {
      return message.reply('Item not found!');
    }
    
    // Check if the item is in the shop
    if (!SHOP_ITEMS.includes(item.id)) {
      return message.reply('This item is not available in the shop!');
    }
    
    // Check level requirement
    if (item.requirements && item.requirements.level > playerData.level) {
      return message.reply(`You need to be level ${item.requirements.level} to buy this item!`);
    }
    
    // Check if player has enough gold
    if (playerData.gold < item.value) {
      return message.reply(`You don't have enough gold! You need ${item.value} ${CONFIG.currency}.`);
    }
    
    // Purchase item
    playerData.gold -= item.value;
    addItemToInventory(playerData, item.id);
    
    return message.reply(`You bought a ${item.name} for ${item.value} ${CONFIG.currency}!`);
  } else if (action === 'sell') {
    if (args.length < 2) {
      return message.reply('Please specify an item to sell!');
    }
    
    let quantity = 1;
    let itemName;
    
    if (args.length >= 3 && !isNaN(args[args.length - 1])) {
      quantity = parseInt(args[args.length - 1]);
      itemName = args.slice(1, args.length - 1).join(' ').toLowerCase();
    } else {
      itemName = args.slice(1).join(' ').toLowerCase();
    }
    
    const item = Object.values(ITEMS).find(i => i.name.toLowerCase() === itemName);
    
    if (!item) {
      return message.reply('Item not found!');
    }
    
    // Check if player has the item
    if (!playerData.inventory[item.id] || playerData.inventory[item.id] < quantity) {
      return message.reply(`You don't have ${quantity} ${item.name} to sell!`);
    }
    
    // Calculate sell value (usually 70% of buy price)
    const sellValue = Math.floor(item.value * 0.7) * quantity;
    
    // Remove item from inventory and add gold
    removeItemFromInventory(playerData, item.id, quantity);
    playerData.gold += sellValue;
    
    return message.reply(`You sold ${quantity} ${item.name} for ${sellValue} ${CONFIG.currency}!`);
  } else {
    return message.reply('Invalid shop action! Use `buy` or `sell`.');
  }
}

// Crafting system
async function craft(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (!args.length) {
    // Show available recipes
    const embed = new MessageEmbed()
      .setTitle('Crafting Recipes')
      .setDescription('Here are the items you can craft:')
      .setColor(0xF1C40F)
      .addField('Recipes', formatRecipes());
    
    return message.reply({ embeds: [embed] });
  }
  
  // Get the item to craft
  const itemName = args.join(' ').toLowerCase();
  const recipeEntry = Object.entries(RECIPES).find(([_, recipe]) => 
    ITEMS[recipe.result].name.toLowerCase() === itemName
  );
  
  if (!recipeEntry) {
    return message.reply(`No recipe found for "${args.join(' ')}"!`);
  }
  
  const [recipeId, recipe] = recipeEntry;
  
  // Check if player has required materials
  for (const [materialId, quantity] of Object.entries(recipe.materials)) {
    if (!playerData.inventory[materialId] || playerData.inventory[materialId] < quantity) {
      const materialName = ITEMS[materialId].name;
      return message.reply(`You don't have enough materials! You need ${quantity} ${materialName}.`);
    }
  }
  
  // Remove materials and add crafted item
  for (const [materialId, quantity] of Object.entries(recipe.materials)) {
    removeItemFromInventory(playerData, materialId, quantity);
  }
  
  addItemToInventory(playerData, recipe.result, recipe.count);
  
  // Award XP for crafting
  const xpGained = getRandomInt(10, 20);
  const levelsGained = awardXP(playerData, xpGained);
  
  let response = `You crafted a ${ITEMS[recipe.result].name}!`;
  response += `\n\nYou gained ${xpGained} XP for crafting!`;
  
  if (levelsGained > 0) {
    response += `\n🎉 You leveled up to level ${playerData.level}! 🎉`;
  }
  
  return message.reply(response);
}

// Equip items
async function equip(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (!args.length) {
    return message.reply('Please specify an item to equip!');
  }
  
  const itemName = args.join(' ').toLowerCase();
  const item = Object.values(ITEMS).find(i => i.name.toLowerCase() === itemName);
  
  if (!item) {
    return message.reply(`Item "${args.join(' ')}" not found!`);
  }
  
  // Check if player has the item
  if (!playerData.inventory[item.id]) {
    return message.reply(`You don't have a ${item.name} to equip!`);
  }
  
  // Check if item is equippable
  if (item.type !== 'weapon' && item.type !== 'armor') {
    return message.reply(`You can't equip a ${item.name}!`);
  }
  
  // Check level requirement
  if (item.requirements && item.requirements.level > playerData.level) {
    return message.reply(`You need to be level ${item.requirements.level} to equip this item!`);
  }
  
  // Unequip current item of same type
  const itemType = item.type;
  const currentItem = playerData.equipped[itemType];
  
  if (currentItem) {
    addItemToInventory(playerData, currentItem);
  }
  
  // Remove from inventory and equip
  removeItemFromInventory(playerData, item.id);
  playerData.equipped[itemType] = item.id;
  
  return message.reply(`You equipped the ${item.name}!`);
}

// Unequip items
async function unequip(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (!args.length) {
    return message.reply('Please specify what to unequip: `weapon` or `armor`');
  }
  
  const itemType = args[0].toLowerCase();
  
  if (itemType !== 'weapon' && itemType !== 'armor') {
    return message.reply('You can only unequip `weapon` or `armor`!');
  }
  
  const currentItem = playerData.equipped[itemType];
  
  if (!currentItem) {
    return message.reply(`You don't have any ${itemType} equipped!`);
  }
  
  // Add to inventory and unequip
  addItemToInventory(playerData, currentItem);
  playerData.equipped[itemType] = null;
  
  return message.reply(`You unequipped your ${ITEMS[currentItem].name}!`);
}

// Use consumable items
async function useItem(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (!args.length) {
    return message.reply('Please specify an item to use!');
  }
  
  const itemName = args.join(' ').toLowerCase();
  const item = Object.values(ITEMS).find(i => i.name.toLowerCase() === itemName);
  
  if (!item) {
    return message.reply(`Item "${args.join(' ')}" not found!`);
  }
  
  // Check if player has the item
  if (!playerData.inventory[item.id]) {
    return message.reply(`You don't have a ${item.name} to use!`);
  }
  
  // Check if item is usable
  if (item.type !== 'consumable') {
    return message.reply(`You can't use a ${item.name}!`);
  }
  
  // Apply item effect
  let effectMessage = '';
  
  if (item.effect === 'heal') {
    const healAmount = item.power;
    playerData.stats.currentHealth = Math.min(
      playerData.stats.maxHealth,
      playerData.stats.currentHealth + healAmount
    );
    effectMessage = `You restored ${healAmount} health points. Current health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`;
  } else if (item.effect === 'strength') {
    // For temporary buffs, we would need a buff system
    // For simplicity, let's just add a small permanent boost
    playerData.stats.strength += 1;
    effectMessage = `Your strength increased by 1! Current strength: ${playerData.stats.strength}`;
  }
  
  // Remove from inventory
  removeItemFromInventory(playerData, item.id);
  
  return message.reply(`You used the ${item.name}. ${effectMessage}`);
}

// Heal command (uses gold to restore health)
async function heal(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  
  if (playerData.stats.currentHealth >= playerData.stats.maxHealth) {
    return message.reply('You are already at full health!');
  }
  
  const healCost = Math.ceil((playerData.stats.maxHealth - playerData.stats.currentHealth) * 0.5);
  
  if (playerData.gold < healCost) {
    return message.reply(`You don't have enough gold to heal! You need ${healCost} ${CONFIG.currency}.`);
  }
  
  playerData.gold -= healCost;
  playerData.stats.currentHealth = playerData.stats.maxHealth;
  
  return message.reply(`You paid ${healCost} ${CONFIG.currency} to completely restore your health!`);
}

// Leaderboard command
async function leaderboard(message) {
  const playerEntries = Object.entries(gameData.players)
    .map(([userId, data]) => ({
      userId,
      level: data.level,
      xp: data.xp,
      gold: data.gold
    }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp);
  
  const top10 = playerEntries.slice(0, 10);
  
  let leaderboardText = '';
  
  for (let i = 0; i < top10.length; i++) {
    const player = top10[i];
    let username;
    
    try {
      const user = await client.users.fetch(player.userId);
      username = user.username;
    } catch (error) {
      username = `Unknown Player (${player.userId})`;
    }
    
    leaderboardText += `**${i + 1}.** ${username} - Level ${player.level} (${player.xp} XP) - ${player.gold} ${CONFIG.currency}\n`;
  }
  
  if (leaderboardText === '') {
    leaderboardText = 'No players on the leaderboard yet!';
  }
  
  const embed = new MessageEmbed()
    .setTitle('RPG Leaderboard')
    .setDescription(leaderboardText)
    .setColor(0xFFD700)
    .setFooter('Top players by level and experience');
  
  return message.reply({ embeds: [embed] });
}

// Print help message
function help(message) {
  const embed = new MessageEmbed()
    .setTitle('RPG Game Commands')
    .setColor(0x00AE86)
    .setDescription('Here are all the available commands for the RPG game:')
    .addField('⚔️ Basic Commands', 
      '`!profile` - View your character profile\n' +
      '`!inventory` - View your inventory\n' +
      '`!balance` - Check your gold balance\n' +
      '`!help` - Show this help message'
    )
    .addField('🌾 Resource Gathering',
      '`!farm` - Gather wood and herbs\n' +
      '`!mine` - Mine for stones and minerals\n' +
      '`!hunt` - Hunt for leather and fur\n' +
      '`!fish` - Fish for... fish!'
    )
    .addField('🛍️ Economy',
      '`!shop` - View the item shop\n' +
      '`!shop buy <item>` - Buy an item\n' +
      '`!shop sell <item> [quantity]` - Sell an item'
    )
    .addField('🛠️ Crafting',
      '`!craft` - View available crafting recipes\n' +
      '`!craft <item>` - Craft an item'
    )
    .addField('⚔️ Equipment',
      '`!equip <item>` - Equip a weapon or armor\n' +
      '`!unequip <weapon|armor>` - Unequip an item\n' +
      '`!use <item>` - Use a consumable item'
    )
    .addField('🌄 Adventure',
      '`!adventure [location]` - Go on an adventure\n' +
      '`!heal` - Heal your character (costs gold)\n' +
      '`!leaderboard` - View the player leaderboard'
    );
  
  return message.reply({ embeds: [embed] });
}

// Handle commands
client.on('messageCreate', async message => {
  // Ignore bot messages and messages without prefix
  if (message.author.bot || !message.content.startsWith(CONFIG.prefix)) return;
  
  // Parse command and arguments
  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  try {
    switch (command) {
      case 'help':
        await help(message);
        break;
      
      case 'profile':
        const userId = message.author.id;
        const playerData = getPlayerData(userId);
        const profileEmbed = createProfileEmbed(message.author, playerData);
        await message.reply({ embeds: [profileEmbed] });
        break;
      
      case 'inventory':
        const userInventory = getPlayerData(message.author.id);
        const inventoryText = formatInventory(userInventory.inventory);
        
        const inventoryEmbed = new MessageEmbed()
          .setTitle(`${message.author.username}'s Inventory`)
          .setColor(0x5F9EA0)
          .setDescription(inventoryText);
        
        await message.reply({ embeds: [inventoryEmbed] });
        break;
      
      case 'balance':
        const player = getPlayerData(message.author.id);
        await message.reply(`You have ${player.gold} ${CONFIG.currency}`);
        break;
      
      case 'farm':
        await farm(message);
        break;
      
      case 'mine':
        await mine(message);
        break;
      
      case 'hunt':
        await hunt(message);
        break;
      
      case 'fish':
        await fish(message);
        break;
      
      case 'adventure':
        await adventure(message, args);
        break;
      
      case 'shop':
        await shop(message, args);
        break;
      
      case 'craft':
        await craft(message, args);
        break;
      
      case 'equip':
        await equip(message, args);
        break;
      
      case 'unequip':
        await unequip(message, args);
        break;
      
      case 'use':
        await useItem(message, args);
        break;
      
      case 'heal':
        await heal(message);
        break;
      
      case 'leaderboard':
        await leaderboard(message);
        break;
      
      default:
        // Unknown command
        break;
    }
  } catch (error) {
    console.error('Error executing command:', error);
    await message.reply('An error occurred while executing the command!');
  }
});

// When the client is ready, run this code
client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}!`);
  
  // Load data from file
  loadData();
  
  // Set up autosave
  setInterval(() => {
    saveData();
  }, CONFIG.saveInterval);
});

// Login to Discord
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN not found! Make sure to set it in your environment variables.');
  process.exit(1);
}

client.login(token);

// Save data before exiting
process.on('SIGINT', () => {
  console.log('Saving data before exiting...');
  saveData();
  process.exit(0);
});
