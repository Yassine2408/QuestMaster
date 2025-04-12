// RPG Discord Bot
// A Discord bot implementing RPG game mechanics where users can farm resources,
// gain XP, level up, and trade items.

const fs = require('fs');
const http = require('http');
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// Track when the bot was last active
let lastActive = Date.now();
function updateActivity() {
  lastActive = Date.now();
}

// Create a simple HTTP server for UptimeRobot pings
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Web server running at http://0.0.0.0:${port}`);
  // Self-ping to keep alive
  setInterval(() => {
    http.get(`http://0.0.0.0:${port}/ping`, (res) => {
      console.log('Keep-alive ping sent');
    }).on('error', (err) => {
      console.error('Keep-alive ping failed:', err.message);
    });
  }, 4 * 60 * 1000); // Ping every 4 minutes
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
  botName: 'QuestMaster', // Bot name
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
        fish: 0,
        daily: 0
      },
      achievements: [],
      totalCrafted: 0,
      pet: null,
      petStats: {
        name: null,
        type: null,
        level: 1,
        xp: 0
      },
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

    // Check for level 10 achievement
    if (newLevel === 10 && !playerData.achievements.includes('level10')) {
      playerData.achievements.push('level10');
    }
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

    // Award first adventure achievement
    if (!playerData.achievements.includes('firstAdventure')) {
      playerData.achievements.push('firstAdventure');
    }
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

  // Check for crafted 100 items achievement
  if (playerData.totalCrafted >= 100 && !playerData.achievements.includes('crafted100')) {
    playerData.achievements.push('crafted100');
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

// Check if players are within an acceptable level range (within 3 levels of each other)
function areLevelsCompatible(player1Level, player2Level) {
  return Math.abs(player1Level - player2Level) <= 3;
}

// Create or send a party invite
async function partyInvite(message, args) {
  try {
    const inviterId = message.author.id;
    const inviterData = getPlayerData(inviterId);

    // Check if user is already in a party
    for (const partyId in gameData.parties) {
      if (gameData.parties[partyId] && gameData.parties[partyId].members.includes(inviterId)) {
        return message.reply('You are already in a party! Leave your current party before inviting others.');
      }
    }

    // Check for mentions directly from the message
    if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0) {
      return message.reply('You need to mention a player to invite them to your party! For example: `!party invite @username`');
    }

    // Get the mentioned user
    const target = message.mentions.users.first();
    if (!target || !target.id) {
      return message.reply('Could not find the user you mentioned. Make sure you\'re mentioning a valid user.');
    }

    if (target.id === inviterId) {
      return message.reply('You cannot invite yourself to a party!');
    }

    const targetId = target.id;

    // Initialize player data for target if they don't have any
    const targetData = getPlayerData(targetId);

    // Check if levels are compatible
    if (!areLevelsCompatible(inviterData.level, targetData.level)) {
      return message.reply(`You cannot invite this player because your levels are too far apart. You are level ${inviterData.level} and they are level ${targetData.level}.`);
    }

    // Initialize party invites if not already done
    if (!gameData.partyInvites) {
      gameData.partyInvites = {};
    }

    // Store the party invite
    if (!gameData.partyInvites[targetId]) {
      gameData.partyInvites[targetId] = [];
    }

    // Check if invite already exists
    if (gameData.partyInvites[targetId].includes(inviterId)) {
      return message.reply(`You have already sent a party invite to ${target.username}.`);
    }

    // Add the invite
    gameData.partyInvites[targetId].push(inviterId);
    saveData(); // Save data after adding invite

    return message.reply(`You have invited ${target.username} to your party! They can accept with \`${CONFIG.prefix}party accept @${message.author.username}\``);
  } catch (error) {
    console.error("Error in party invite:", error);
    return message.reply("An error occurred while sending the party invite. Please try again.");
  }
}

// Accept a party invite
async function partyAccept(message, args) {
  try {
    const accepterId = message.author.id;
    const accepterData = getPlayerData(accepterId);

    // Initialize party invites if not already done
    if (!gameData.partyInvites) {
      gameData.partyInvites = {};
    }

    // Check if the user has any invites
    if (!gameData.partyInvites[accepterId] || gameData.partyInvites[accepterId].length === 0) {
      return message.reply('You don\'t have any party invites to accept!');
    }

    // Check for mentions directly from the message
    if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0) {
      // List all invites if no specific one was mentioned
      const invitersList = [];
      for (const inviterId of gameData.partyInvites[accepterId]) {
        try {
          const user = await client.users.fetch(inviterId);
          invitersList.push(user.username);
        } catch (error) {
          console.error(`Could not fetch user ${inviterId}:`, error);
        }
      }

      if (invitersList.length === 0) {
        return message.reply('You have pending invites but could not fetch the usernames. Please try again.');
      }

      return message.reply(`You have party invites from: ${invitersList.join(', ')}. Use \`${CONFIG.prefix}party accept @username\` to accept a specific invite.`);
    }

    // Get the mentioned user (inviter)
    const inviter = message.mentions.users.first();
    if (!inviter || !inviter.id) {
      return message.reply('Could not find the user you mentioned. Make sure you\'re mentioning a valid user.');
    }

    const inviterId = inviter.id;

    // Check if the invitation exists
    if (!gameData.partyInvites[accepterId].includes(inviterId)) {
      return message.reply(`You don't have a party invite from ${inviter.username}.`);
    }

    const inviterData = getPlayerData(inviterId);

    // Check if levels are still compatible
    if (!areLevelsCompatible(accepterData.level, inviterData.level)) {
      // Remove the invite
      gameData.partyInvites[accepterId] = gameData.partyInvites[accepterId].filter(id => id !== inviterId);
      saveData();
      return message.reply(`Cannot join party with ${inviter.username} because your levels are too far apart.`);
    }

    // Initialize parties if not already done
    if (!gameData.parties) {
      gameData.parties = {};
    }

    // Check if either player is already in a party
    for (const partyId in gameData.parties) {
      if (!gameData.parties[partyId]) continue;
      const party = gameData.parties[partyId];
      if (!party.members) continue;

      if (party.members.includes(accepterId)) {
        return message.reply('You are already in a party! Leave your current party before accepting invites.');
      }
      if (party.members.includes(inviterId)) {
        return message.reply(`${inviter.username} is already in a party and can't invite you right now.`);
      }
    }

    // Create a new party
    const partyId = `${inviterId}_${Date.now()}`;
    gameData.parties[partyId] = {
      leader: inviterId,
      members: [inviterId, accepterId],
      createdAt: Date.now()
    };

    // Remove the invitation
    gameData.partyInvites[accepterId] = gameData.partyInvites[accepterId].filter(id => id !== inviterId);
    saveData(); // Save data after creating party

    return message.reply(`You have joined ${inviter.username}'s party! You can now adventure together using \`${CONFIG.prefix}party adventure [location]\`.`);
  } catch (error) {
    console.error("Error in party accept:", error);
    return message.reply("An error occurred while accepting the party invite. Please try again.");
  }
}

// Leave a party
async function partyLeave(message) {
  const leaverId = message.author.id;
  let partyId = null;

  // Find the party the user is in
  for (const id in gameData.parties) {
    if (gameData.parties[id].members.includes(leaverId)) {
      partyId = id;
      break;
    }
  }

  if (!partyId) {
    return message.reply('You are not in a party!');
  }

  const party = gameData.parties[partyId];

  // If party leader leaves or it's a 2-person party, disband the party
  if (party.leader === leaverId || party.members.length <= 2) {
    // Notify all members about party disbanding
    for (const memberId of party.members) {
      if (memberId !== leaverId) {
        try {
          const member = await client.users.fetch(memberId);
          member.send(`Your party has been disbanded because ${message.author.username} left.`);
        } catch (error) {
          console.error(`Could not notify user ${memberId}:`, error);
        }
      }
    }

    // Delete the party
    delete gameData.parties[partyId];
    saveData(); // Save data after disbanding party
    return message.reply('You left the party. The party has been disbanded.');
  } else {
    // Otherwise just remove the member
    party.members = party.members.filter(id => id !== leaverId);
    saveData(); // Save data after leaving party
    return message.reply('You have left the party.');
  }
}

// View party status
async function partyStatus(message) {
  const userId = message.author.id;
  let partyId = null;

  // Find the party the user is in
  for (const id in gameData.parties) {
    if (gameData.parties[id].members.includes(userId)) {
      partyId = id;
      break;
    }
  }

  if (!partyId) {
    return message.reply('You are not in a party!');
  }

  const party = gameData.parties[partyId];

  // Create an embed for the party status
  const embed = new MessageEmbed()
    .setTitle('Party Status')
    .setColor(0x00AAFF);

  // Add party members
  let membersText = '';
  for (const memberId of party.members) {
    try {
      const user = await client.users.fetch(memberId);
      const playerData = getPlayerData(memberId);

      const isLeader = memberId === party.leader ? '👑 ' : '';
      membersText += `${isLeader}**${user.username}** - Level ${playerData.level} - HP: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}\n`;
    } catch (error) {
      console.error(`Could not fetch user ${memberId}:`, error);
    }
  }

  embed.setDescription(membersText);
  return message.channel.send({ embeds: [embed] });
}

// Go on an adventure as a party
async function partyAdventure(message, args) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  let partyId = null;

  // Find the party the user is in
  for (const id in gameData.parties) {
    if (gameData.parties[id].members.includes(userId)) {
      partyId = id;
      break;
    }
  }

  if (!partyId) {
    return message.reply('You are not in a party! Use the regular adventure command or join a party first.');
  }

  const party = gameData.parties[partyId];

  // Only party leader can initiate adventures
  if (party.leader !== userId) {
    return message.reply('Only the party leader can initiate a party adventure!');
  }

  // Check cooldowns for all party members
  const now = Date.now();
  for (const memberId of party.members) {
    const memberData = getPlayerData(memberId);
    if (memberData.cooldowns.adventure > now) {
      const timeLeft = Math.ceil((memberData.cooldowns.adventure - now) / 1000);
      try {
        const member = await client.users.fetch(memberId);
        return message.reply(`Can't start the adventure because ${member.username} needs to wait ${timeLeft} seconds before going on another adventure.`);
      } catch (error) {
        return message.reply(`Can't start the adventure because one of your party members is on cooldown (${timeLeft} seconds).`);
      }
    }
  }

  // Select location
  let location;
  if (args.length > 0) {
    const locationName = args.join(' ').toLowerCase();
    location = ADVENTURE_LOCATIONS.find(loc => loc.name.toLowerCase() === locationName);

    if (!location) {
      // Find the lowest level member to determine available locations
      let lowestLevel = 999;
      for (const memberId of party.members) {
        const memberData = getPlayerData(memberId);
        if (memberData.level < lowestLevel) {
          lowestLevel = memberData.level;
        }
      }

      const availableLocations = ADVENTURE_LOCATIONS
        .filter(loc => loc.minLevel <= lowestLevel)
        .map(loc => loc.name)
        .join(', ');

      return message.reply(`Location not found! Available locations for your party: ${availableLocations}`);
    }
  } else {
    // Find the lowest level member to determine default location
    let lowestLevel = 999;
    for (const memberId of party.members) {
      const memberData = getPlayerData(memberId);
      if (memberData.level < lowestLevel) {
        lowestLevel = memberData.level;
      }
    }

    // Default to the first location the lowest-level player can access
    location = ADVENTURE_LOCATIONS.find(loc => loc.minLevel <= lowestLevel);

    if (!location) {
      return message.reply("Your party's lowest level member isn't high enough level for any adventures yet. Try farming to level up first!");
    }
  }

  // Check level requirement for all party members
  for (const memberId of party.members) {
    const memberData = getPlayerData(memberId);
    if (memberData.level < location.minLevel) {
      try {
        const member = await client.users.fetch(memberId);
        return message.reply(`${member.username} needs to be at least level ${location.minLevel} to adventure in ${location.name}!`);
      } catch (error) {
        return message.reply(`One of your party members needs to be at least level ${location.minLevel} to adventure in ${location.name}!`);
      }
    }
  }

  // Set cooldown for all party members
  for (const memberId of party.members) {
    const memberData = getPlayerData(memberId);
    memberData.cooldowns.adventure = now + CONFIG.adventureCooldown;
  }

  // Combine party stats
  let totalAttackPower = 0;
  let totalDefense = 0;
  let memberHealths = {};

  for (const memberId of party.members) {
    const memberData = getPlayerData(memberId);
    let attackPower = memberData.stats.strength;
    let defense = memberData.stats.defense;

    if (memberData.equipped.weapon) {
      attackPower += ITEMS[memberData.equipped.weapon].power;
    }

    if (memberData.equipped.armor) {
      defense += ITEMS[memberData.equipped.armor].defense;
    }

    totalAttackPower += attackPower;
    totalDefense += Math.floor(defense * 0.7); // Scale defense a bit for balance
    memberHealths[memberId] = memberData.stats.currentHealth;
  }

  // Select 2 random enemies from the location (party faces more enemies)
  let enemies = [];
  for (let i = 0; i < 2; i++) {
    enemies.push(location.enemies[Math.floor(Math.random() * location.enemies.length)]);
  }

  // Calculate total enemy stats
  let totalEnemyHp = enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
  let totalEnemyAttack = enemies.reduce((sum, enemy) => sum + enemy.attack, 0);

  // Simulate combat
  let combatLog = [];
  combatLog.push(`Your party (${party.members.length} members) ventures into ${location.name} and encounters ${enemies.map(e => e.name).join(' and ')}!`);

  while (Object.values(memberHealths).some(health => health > 0) && totalEnemyHp > 0) {
    // Party attacks
    const partyDamage = Math.max(1, getRandomInt(totalAttackPower - 5, totalAttackPower + 5));
    totalEnemyHp -= partyDamage;
    combatLog.push(`Your party hits the enemies for ${partyDamage} combined damage.`);

    if (totalEnemyHp <= 0) break;

    // Enemies attack a random party member
    const targetMemberId = party.members[Math.floor(Math.random() * party.members.length)];
    const enemyDamage = Math.max(1, getRandomInt(totalEnemyAttack - 3, totalEnemyAttack + 3) - Math.floor(totalDefense / 3));
    memberHealths[targetMemberId] -= enemyDamage;

    try {
      const member = await client.users.fetch(targetMemberId);
      combatLog.push(`The enemies hit ${member.username} for ${enemyDamage} damage.`);
    } catch (error) {
      combatLog.push(`The enemies hit a party member for ${enemyDamage} damage.`);
    }
  }

  // Update all party members' health
  for (const memberId of party.members) {
    const memberData = getPlayerData(memberId);
    memberData.stats.currentHealth = Math.max(0, memberHealths[memberId]);
  }

  let result = `**Party Adventure in ${location.name}**\n\n`;

  // Limit combat log to avoid too long messages
  result += combatLog.slice(-8).join('\n') + '\n\n';

  const victory = totalEnemyHp <= 0;

  if (victory) {
    // Calculate rewards (slightly boosted for party play)
    const baseXpReward = enemies.reduce((sum, enemy) => sum + enemy.xp, 0) * 1.2;
    const baseGoldReward = enemies.reduce((sum, enemy) => sum + enemy.gold, 0) * 1.2;
    const bonusXp = getRandomInt(location.rewards.xp.min, location.rewards.xp.max);
    const bonusGold = getRandomInt(location.rewards.gold.min, location.rewards.gold.max);

    const totalXpReward = Math.floor(baseXpReward + bonusXp);
    const totalGoldReward = Math.floor(baseGoldReward + bonusGold);

    // Split rewards among party members
    const xpPerMember = Math.floor(totalXpReward / party.members.length);
    const goldPerMember = Math.floor(totalGoldReward / party.members.length);

    result += `**Victory!** Your party defeated the enemies!\n\n`;
    result += `**Rewards per member:**\n`;
    result += `- ${xpPerMember} XP\n`;
    result += `- ${goldPerMember} ${CONFIG.currency}\n`;

    // Determine item drops
    let allItemsGained = [];

    for (const itemReward of location.rewards.items) {
      // Increased chance for party play
      const adjustedChance = Math.min(0.95, itemReward.chance * 1.3);
      if (Math.random() <= adjustedChance) {
        const quantity = getRandomInt(itemReward.min, itemReward.max);
        allItemsGained.push({ id: itemReward.id, quantity });
      }
    }

    // Award rewards to all members
    let levelUps = [];
    for (const memberId of party.members) {
      const memberData = getPlayerData(memberId);

      // Award XP and gold
      memberData.gold += goldPerMember;
      const levelsGained = awardXP(memberData, xpPerMember);

      if (levelsGained > 0) {
        try {
          const member = await client.users.fetch(memberId);
          levelUps.push(`${member.username} leveled up to level ${memberData.level}!`);
        } catch (error) {
          levelUps.push(`A party member leveled up to level ${memberData.level}!`);
        }
      }

      // Award items (randomly split between members)
      for (const item of allItemsGained) {
        if (Math.random() < 1 / party.members.length) { // Chance to get item scales with party size
          addItemToInventory(memberData, item.id, item.quantity);
        }
      }
    }

    if (allItemsGained.length > 0) {
      result += `- Items found: ${allItemsGained.map(item => `${item.quantity} ${ITEMS[item.id].name}`).join(', ')}\n`;
      result += `(Items are randomly distributed among party members)\n`;
    }

    if (levelUps.length > 0) {
      result += `\n🎉 **Level ups:**\n${levelUps.join('\n')}`;
    }

    // Show remaining health
    result += `\n\n**Party Health:**\n`;
    for (const memberId of party.members) {
      try {
        const member = await client.users.fetch(memberId);
        const memberData = getPlayerData(memberId);
        result += `${member.username}: ${memberData.stats.currentHealth}/${memberData.stats.maxHealth} HP\n`;
      } catch (error) {
        console.error(`Could not fetch user ${memberId}:`, error);
      }
    }

  } else {
    // Party was defeated
    result += `**Defeat!** Your party was overwhelmed by the enemies...\n\n`;

    // Each member loses some gold on defeat
    for (const memberId of party.members) {
      const memberData = getPlayerData(memberId);

      // Lose 7% of gold (less than solo adventures)
      const goldLost = Math.floor(memberData.gold * 0.07);
      memberData.gold = Math.max(0, memberData.gold - goldLost);

      // Reset health to30% (better than solo adventures)
      memberData.stats.currentHealth = Math.floor(memberData.stats.maxHealth * 0.3);

      try {
        const member = await client.users.fetch(memberId);
        result += `${member.username} lost ${goldLost} ${CONFIG.currency} and now has ${memberData.stats.currentHealth}/${memberData.stats.maxHealth} HP.\n`;
      } catch (error) {
        result += `A party member lost ${goldLost} ${CONFIG.currency}.\n`;
      }
    }

    result += `\nYour party barely escaped with their lives. Consider healing before your next adventure.`;
  }

  return message.reply(result);
}

// Handle party commands
async function party(message, args) {
  if (!args.length) {
    return partyStatus(message);
  }

  const subCommand = args[0].toLowerCase();
  const subCommandArgs = args.slice(1);

  switch (subCommand) {
    case 'invite':
      return partyInvite(message, subCommandArgs);
    case 'accept':
      return partyAccept(message, subCommandArgs);
    case 'leave':
      return partyLeave(message);
    case 'status':
      return partyStatus(message);
    case 'adventure':
    case 'adv':
      return partyAdventure(message, subCommandArgs);
    default:
      return message.reply(`Unknown party command. Available commands: invite, accept, leave, status, adventure.`);
  }
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
    )
    .addField('👥 Party System',
      '`!party` or `!party status` - View your party status\n' +
      '`!party invite @player` - Invite a player to your party (must be within 3 levels)\n' +
      '`!party accept @player` - Accept a party invitation\n' +
      '`!party leave` - Leave your current party\n' +
      '`!party adventure [location]` - Go on an adventure with your party'
    )
    .addField('🎁 Rewards & Achievements',
      '`!daily` - Claim daily reward (50-150 gold, resets every 24h)\n' +
      '`!achievements` - View your earned achievements and how to unlock more'
    );

  return message.reply({ embeds: [embed] });
}

// Handle commands
client.on('messageCreate', async message => {
  // Update activity timestamp whenever bot receives a message
  updateActivity();
  // Ignore bot messages and messages without prefix
  if (message.author.bot || !message.content.startsWith(CONFIG.prefix)) return;

  // Parse command and arguments
  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      case 'daily':
        await claimDaily(message);
        break;

      case 'achievements':
        const playerAchievements = getPlayerData(message.author.id);
        const achievementsEmbed = new MessageEmbed()
          .setTitle(`${message.author.username}'s Achievements`)
          .setColor(0xFFD700);

        let description = '';
        for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
          const unlocked = playerAchievements.achievements.includes(id);
          description += `${unlocked ? '🏆' : '🔒'} **${achievement.name}**\n${achievement.description}\n\n`;
        }

        achievementsEmbed.setDescription(description);
        await message.reply({ embeds: [achievementsEmbed] });
        break;

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

      case 'party':
        await party(message, args);
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

  // Mark bot as active
  updateActivity();

  // Load data from file
  loadData();

  // Set up autosave
  setInterval(() => {
    saveData();
  }, CONFIG.saveInterval);

  // Update activity timestamp regularly (every 5 minutes)
  setInterval(() => {
    updateActivity();
  }, 5 * 60 * 1000);
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

// Daily reward system
async function claimDaily(message) {
  const userId = message.author.id;
  const playerData = getPlayerData(userId);
  const now = Date.now();

  if (playerData.cooldowns.daily > now) {
    const timeLeft = Math.ceil((playerData.cooldowns.daily - now) / 1000);
    return message.reply(`You can claim your daily reward in ${timeLeft} seconds!`);
  }

  // Award daily reward
  const rewardGold = getRandomInt(50, 150);
  playerData.gold += rewardGold;
  playerData.cooldowns.daily = now + 86400000; // 24 hours cooldown

  return message.reply(`You claimed your daily reward: ${rewardGold} ${CONFIG.currency}!`);
}


// Achievements system
const ACHIEVEMENTS = {
  'level10': {
    id: 'level10',
    name: 'Level 10 Achiever',
    description: 'Reached level 10'
  },
  'firstAdventure': {
    id: 'firstAdventure',
    name: 'First Adventure',
    description: 'Completed your first adventure'
  },
  'crafted100': {
    id: 'crafted100',
    name: 'Master Craftsman',
    description: 'Crafted 100 items'
  }
};


// Add achievement tracking to awardXP
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

    // Check for level 10 achievement
    if (newLevel === 10 && !playerData.achievements.includes('level10')) {
      playerData.achievements.push('level10');
    }
  }

  if (levelsGained > 0) {
    playerData.level = newLevel;
    return levelsGained;
  }

  return 0;
}

// Add achievement tracking to adventure
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

    // Award first adventure achievement
    if (!playerData.achievements.includes('firstAdventure')) {
      playerData.achievements.push('firstAdventure');
    }
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

// Add achievement tracking to craft
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

  // Check for crafted 100 items achievement
  if (playerData.totalCrafted >= 100 && !playerData.achievements.includes('crafted100')) {
    playerData.achievements.push('crafted100');
  }

  return message.reply(response);
}

// Add totalCrafted to player data
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
        fish: 0,
        daily: 0
      },
      achievements: [],
      totalCrafted: 0,
      pet: null,
      petStats: {
        name: null,
        type: null,
        level: 1,
        xp: 0
      },
    };
  }
  return gameData.players[userId];
}

// Update craft function to track total crafted
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

  // Check for crafted 100 items achievement
  playerData.totalCrafted += recipe.count;
  if (playerData.totalCrafted >= 100 && !playerData.achievements.includes('crafted100')) {
    playerData.achievements.push('crafted100');
  }

  return message.reply(response);
}