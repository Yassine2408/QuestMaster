<<<<<<< HEAD
// Enhanced RPG Discord Bot
=======
// RPG Discord Bot
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// A Discord bot implementing RPG game mechanics where users can farm resources,
// gain XP, level up, and trade items.

const fs = require('fs');
const http = require('http');
<<<<<<< HEAD
const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// Import system modules
const dailySystem = require('./systems/daily');
const questSystem = require('./systems/quests');
const petSystem = require('./systems/pets');
const combatSystem = require('./systems/combat');
const inventorySystem = require('./systems/inventory');
const classSystem = require('./systems/classes');
const pvpSystem = require('./systems/pvp'); // Added PvP system import

// Import utility modules
const helpers = require('./utils/helpers');
const embeds = require('./utils/embeds');

// Import data modules
const ITEMS = require('./data/items');
const LOCATIONS = require('./data/locations');
const QUESTS = require('./data/quests');
const PETS = require('./data/pets');
=======
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c

// Track when the bot was last active
let lastActive = Date.now();
function updateActivity() {
  lastActive = Date.now();
}

// Create a simple HTTP server for UptimeRobot pings
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
<<<<<<< HEAD
  const timeSinceLastActive = Math.floor((Date.now() - lastActive) / 1000);
  res.end(`QuestForge Bot is alive! Last activity: ${timeSinceLastActive} seconds ago`);
=======
  res.end('OK');
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Web server running at http://0.0.0.0:${port}`);
  // Self-ping to keep alive
  setInterval(() => {
    http.get(`http://0.0.0.0:${port}/ping`, (res) => {
<<<<<<< HEAD
      console.log(`Keep-alive ping sent (${new Date().toISOString()})`);
=======
      console.log('Keep-alive ping sent');
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
    }).on('error', (err) => {
      console.error('Keep-alive ping failed:', err.message);
    });
  }, 4 * 60 * 1000); // Ping every 4 minutes
});

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
<<<<<<< HEAD
    "Guilds",
    "GuildMessages",
    "MessageContent"
  ]
});

=======
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

// Note: For full functionality, enable the "Message Content Intent" and "Server Members Intent"
// in your Discord Developer Portal > Applications > Your Bot > Bot > Privileged Gateway Intents

>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// Bot configuration
const CONFIG = {
  prefix: '!', // Command prefix
  saveInterval: 5 * 60 * 1000, // Save data every 5 minutes
  dataFile: 'rpg_data.json', // File to store persistent data
  currency: '🪙', // Currency symbol
<<<<<<< HEAD
  botName: 'QuestForge', // Bot name
  embedColor: '#7289DA', // Default embed color
=======
  botName: 'QuestMaster', // Bot name
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  farmCooldown: 60 * 1000, // Farming cooldown in milliseconds (1 minute)
  adventureCooldown: 5 * 60 * 1000, // Adventure cooldown (5 minutes)
  huntCooldown: 3 * 60 * 1000, // Hunting cooldown (3 minutes)
  mineCooldown: 2 * 60 * 1000, // Mining cooldown (2 minutes)
<<<<<<< HEAD
  fishCooldown: 2 * 60 * 1000, // Fishing cooldown (2 minutes)
  dailyCooldown: 24 * 60 * 60 * 1000, // Daily reward cooldown (24 hours)
  questCompletionExp: 100, // Base XP for completing a quest
  maxPetLevel: 30, // Maximum level for pets
};

// Export CONFIG directly to avoid circular dependencies
exports.CONFIG = CONFIG;

=======
  fishCooldown: 2 * 60 * 1000 // Fishing cooldown (2 minutes)
};

>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// In-memory database
let gameData = {
  players: {},
  partyInvites: {}, // Store party invites
<<<<<<< HEAD
  parties: {}, // Store active parties
  serverStats: {
    totalPlayers: 0,
    totalGoldEarned: 0,
    totalAdventures: 0,
    totalItemsCrafted: 0,
    totalMonstersDefeated: 0,
    totalQuestsCompleted: 0,
  }
=======
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
};

// Shop items (subset of all items that can be purchased)
const SHOP_ITEMS = [
  'wooden_sword',
  'stone_sword',
  'iron_sword',
<<<<<<< HEAD
  'steel_sword',
  'leather_armor',
  'iron_armor',
  'health_potion',
  'strength_potion',
  'pet_food',
  'pet_toy',
  'pet_treat'
];

=======
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

>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// Load data from file if exists
function loadData() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      const data = fs.readFileSync(CONFIG.dataFile, 'utf8');
      gameData = JSON.parse(data);
      console.log('Data loaded successfully!');
<<<<<<< HEAD

      // Initialize counters if they don't exist
      if (!gameData.serverStats) {
        gameData.serverStats = {
          totalPlayers: Object.keys(gameData.players || {}).length,
          totalGoldEarned: 0,
          totalAdventures: 0,
          totalItemsCrafted: 0,
          totalMonstersDefeated: 0,
          totalQuestsCompleted: 0,
        };
      }

      // Set up missing properties on existing player data
      Object.keys(gameData.players).forEach(playerId => {
        const player = gameData.players[playerId];

        // Add quests property if it doesn't exist
        if (!player.quests) {
          player.quests = {
            active: [],
            completed: []
          };
        }

        // Ensure daily cooldown exists
        if (!player.cooldowns.daily) {
          player.cooldowns.daily = 0;
        }

        // Ensure pet exists with basic stats if missing
        if (!player.pet) {
          player.pet = null;
        }

        // Add quest cooldown
        if (!player.cooldowns.quest) {
          player.cooldowns.quest = 0;
        }

        // Add notifications system
        if (!player.notifications) {
          player.notifications = [];
        }
      });
    }
  } catch (error) {
    console.error('Error loading data:', error);
    // Create a backup of corrupted file if it exists
    if (fs.existsSync(CONFIG.dataFile)) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.copyFileSync(CONFIG.dataFile, `${CONFIG.dataFile}.corrupted.${timestamp}`);
      console.log(`Created backup of corrupted data file: ${CONFIG.dataFile}.corrupted.${timestamp}`);
    }
=======
    }
  } catch (error) {
    console.error('Error loading data:', error);
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  }
}

// Import backup functionality
const { createBackup } = require('./backup');

// Save data to file
function saveData() {
  try {
<<<<<<< HEAD
    // Create a temporary file first to avoid corruption
    const tempFile = `${CONFIG.dataFile}.temp`;
    fs.writeFileSync(tempFile, JSON.stringify(gameData), 'utf8');

    // Rename temp file to actual file (atomic operation)
    fs.renameSync(tempFile, CONFIG.dataFile);

    console.log(`Data saved successfully! (${new Date().toISOString()})`);
=======
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(gameData), 'utf8');
    console.log('Data saved successfully!');
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c

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
<<<<<<< HEAD
function getPlayerData(userId, username = "Unknown") {
  if (!gameData.players[userId]) {
    gameData.players[userId] = {
      username: username,
      level: 1,
      xp: 0,
      gold: 100,
      class: null,
      inventory: {},
      abilities: {},
=======
function getPlayerData(userId) {
  if (!gameData.players[userId]) {
    gameData.players[userId] = {
      level: 1,
      xp: 0,
      gold: 100,
      inventory: {},
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
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
<<<<<<< HEAD
        daily: 0,
        quest: 0
=======
        daily: 0
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
      },
      achievements: [],
      totalCrafted: 0,
      pet: null,
      petStats: {
        name: null,
        type: null,
        level: 1,
<<<<<<< HEAD
        xp: 0,
        happiness: 100,
        hunger: 100
      },
      quests: {
        active: [],
        completed: []
      },
      notifications: [],
      joinedAt: Date.now()
    };

    // Increment total player count
    gameData.serverStats.totalPlayers++;
  }

  // Update username if changed
  if (username !== "Unknown" && gameData.players[userId].username !== username) {
    gameData.players[userId].username = username;
  }

=======
        xp: 0
      },
    };
  }
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  return gameData.players[userId];
}

// Add item to player inventory
function addItemToInventory(playerData, itemId, quantity = 1) {
  if (!playerData.inventory[itemId]) {
    playerData.inventory[itemId] = 0;
  }
  playerData.inventory[itemId] += quantity;
<<<<<<< HEAD

  // Add a notification
  addNotification(playerData, `You received ${quantity}x ${ITEMS[itemId].name}`);

  return true;
=======
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
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

<<<<<<< HEAD
// Add a notification to player data
function addNotification(playerData, message) {
  playerData.notifications.push({
    message,
    timestamp: Date.now(),
    read: false
  });

  // Keep only last 20 notifications
  if (playerData.notifications.length > 20) {
    playerData.notifications.shift();
  }
}

=======
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// Award XP to player and handle level ups
function awardXP(playerData, xpAmount) {
  playerData.xp += xpAmount;

  // Check for level up
  let levelsGained = 0;
  let newLevel = playerData.level;

<<<<<<< HEAD
  while (playerData.xp >= helpers.getXpForLevel(newLevel)) {
    playerData.xp -= helpers.getXpForLevel(newLevel);
=======
  while (playerData.xp >= getXpForLevel(newLevel)) {
    playerData.xp -= getXpForLevel(newLevel);
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
    newLevel++;
    levelsGained++;

    // Update stats on level up
    playerData.stats.strength += 2;
    playerData.stats.defense += 2;
    playerData.stats.maxHealth += 10;
    playerData.stats.currentHealth = playerData.stats.maxHealth; // Heal on level up

<<<<<<< HEAD
    // Give level up rewards
    const levelUpGold = newLevel * 50;
    playerData.gold += levelUpGold;

    // Add notification for level up
    addNotification(
      playerData, 
      `🎉 Level Up! You are now level ${newLevel}! You gained ${levelUpGold} ${CONFIG.currency} and your stats have increased.`
    );

    // Check for level achievements
    if (newLevel === 10 && !playerData.achievements.includes('level10')) {
      playerData.achievements.push('level10');
      addItemToInventory(playerData, 'health_potion', 3);
      addNotification(playerData, "🏆 Achievement Unlocked: Reached Level 10! Received 3x Health Potion.");
    }

    if (newLevel === 25 && !playerData.achievements.includes('level25')) {
      playerData.achievements.push('level25');
      addItemToInventory(playerData, 'mythril_sword', 1);
      addNotification(playerData, "🏆 Achievement Unlocked: Reached Level 25! Received Mythril Sword.");
    }

    if (newLevel === 50 && !playerData.achievements.includes('level50')) {
      playerData.achievements.push('level50');
      addItemToInventory(playerData, 'legendary_key', 1);
      addNotification(playerData, "🏆 Achievement Unlocked: Reached Level 50! Received Legendary Key.");
=======
    // Check for level 10 achievement
    if (newLevel === 10 && !playerData.achievements.includes('level10')) {
      playerData.achievements.push('level10');
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
    }
  }

  if (levelsGained > 0) {
    playerData.level = newLevel;
    return levelsGained;
  }

  return 0;
}

<<<<<<< HEAD
=======
// Get a random number between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
// Format inventory for display
function formatInventory(inventory) {
  if (Object.keys(inventory).length === 0) {
    return "Your inventory is empty.";
  }

<<<<<<< HEAD
  const categories = {
    weapon: [],
    armor: [],
    material: [],
    consumable: [],
    pet: [],
    special: []
  };

  for (const [itemId, quantity] of Object.entries(inventory)) {
    if (ITEMS[itemId]) {
      const item = ITEMS[itemId];
      const category = item.type || 'special';

      categories[category].push(
        `${item.name} (${quantity}) - ${item.description} - Worth: ${item.value} ${CONFIG.currency}`
      );
    }
  }

  let result = "";

  for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
      result += `\n__**${category.charAt(0).toUpperCase() + category.slice(1)}s**__\n`;
      result += items.join('\n') + '\n';
    }
  }

=======
  let result = "";
  for (const [itemId, quantity] of Object.entries(inventory)) {
    if (ITEMS[itemId]) {
      result += `${ITEMS[itemId].name} (${quantity}) - ${ITEMS[itemId].description} - Worth: ${ITEMS[itemId].value} ${CONFIG.currency}\n`;
    }
  }
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  return result;
}

// Format shop items for display
function formatShopItems() {
<<<<<<< HEAD
  const categories = {
    weapon: [],
    armor: [],
    consumable: [],
    pet: []
  };

  for (const itemId of SHOP_ITEMS) {
    const item = ITEMS[itemId];
    if (!item) continue;

    let itemText = `**${item.name}** - ${item.description} - Price: ${item.value} ${CONFIG.currency}\n`;

    if (item.requirements) {
      itemText += `Requirements: Level ${item.requirements.level}\n`;
    }

    if (item.type === 'weapon') {
      itemText += `Attack Power: +${item.power}\n`;
    } else if (item.type === 'armor') {
      itemText += `Defense: +${item.defense}\n`;
    } else if (item.type === 'consumable') {
      itemText += `Effect: ${item.effect} (+${item.power})\n`;
    }

    if (categories[item.type]) {
      categories[item.type].push(itemText);
    } else {
      categories.consumable.push(itemText);
    }
  }

  let result = "";
  for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
      result += `\n__**${category.charAt(0).toUpperCase() + category.slice(1)}s**__\n`;
      result += items.join('\n');
    }
  }

  return result;
}

// Initialize when the client is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Serving ${Object.keys(gameData.players).length} players`);

  // Set the bot's activity
  client.user.setActivity({ name: '!help for commands', type: 0 }); // 0 is PLAYING

  // Regular data save interval
  setInterval(saveData, CONFIG.saveInterval);
});

// Main command handler
client.on('messageCreate', async (message) => {
  // Ignore messages from bots or without prefix
  if (message.author.bot || !message.content.startsWith(CONFIG.prefix)) return;

  updateActivity();

  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    // Get player data
    const playerData = getPlayerData(message.author.id, message.author.username);

    // Check for unread notifications
    const unreadCount = playerData.notifications.filter(n => !n.read).length;
    if (unreadCount > 0 && command !== 'notifications') {
      message.channel.send(`📬 You have ${unreadCount} unread notifications! Use \`!notifications\` to view them.`);
    }

    // Process commands
    switch (command) {
      case 'help':
        const helpEmbed = embeds.createHelpEmbed();
        message.channel.send({ embeds: [helpEmbed] });
        break;

      case 'profile':
        const profileEmbed = embeds.createProfileEmbed(message.author, playerData);
        message.channel.send({ embeds: [profileEmbed] });
        break;

      case 'inventory':
      case 'inv':
        await inventorySystem.handleInventoryCommand(message, playerData, args);
        break;

      case 'balance':
      case 'gold':
      case 'money':
        const goldEmbed = new EmbedBuilder()
          .setTitle(`${message.author.username}'s Balance`)
          .setColor(CONFIG.embedColor)
          .setDescription(`You have ${playerData.gold} ${CONFIG.currency}`);
        message.channel.send({ embeds: [goldEmbed] });
        break;

      case 'farm':
        await handleFarmCommand(message, playerData);
        break;

      case 'mine':
        await handleMineCommand(message, playerData);
        break;

      case 'hunt':
        await handleHuntCommand(message, playerData);
        break;

      case 'fish':
        await handleFishCommand(message, playerData);
        break;

      case 'daily':
        await dailySystem.handleDailyCommand(message, playerData, CONFIG);
        break;

      case 'shop':
        await handleShopCommand(message, playerData, args);
        break;

      case 'craft':
        await handleCraftCommand(message, playerData, args);
        break;

      case 'equip':
        await handleEquipCommand(message, playerData, args);
        break;

      case 'unequip':
        await handleUnequipCommand(message, playerData, args);
        break;

      case 'use':
        await handleUseCommand(message, playerData, args);
        break;

      case 'adventure':
      case 'adv':
        await handleAdventureCommand(message, playerData, args);
        break;

      case 'heal':
        await handleHealCommand(message, playerData);
        break;

      case 'party':
        await handlePartyCommand(message, playerData, args);
        break;

      case 'leaderboard':
      case 'lb':
        await handleLeaderboardCommand(message, args);
        break;

      case 'pet':
        await petSystem.handlePetCommand(message, playerData, args, CONFIG);
        break;

      case 'quest':
      case 'quests':
        await questSystem.handleQuestCommand(message, playerData, args, CONFIG);
        break;

      case 'notifications':
      case 'notifs':
        await handleNotificationsCommand(message, playerData);
        break;

      case 'stats':
        await handleStatsCommand(message, playerData);
        break;

      case 'achievements':
      case 'achieve':
        await handleAchievementsCommand(message, playerData);
        break;

      case 'class':
        await classSystem.handleClassCommand(message, playerData, args);
        break;
      case 'pvp':
        if (args.length > 0) {
          const target = message.mentions.users.first();
          if (!target) {
            message.reply('Please mention a player to challenge!');
            return;
          }
          if (target.id === message.author.id) {
            message.reply('You cannot challenge yourself!');
            return;
          }
          await pvpSystem.handlePvPChallenge(message, playerData, target); // Added PvP command handling
        } else {
          message.reply('Please specify a player to challenge using !pvp @user');
        }
        break;
    }
  } catch (error) {
    console.error(`Error processing command "${command}":`, error);
    message.reply('An error occurred while processing your command. Please try again later.');
  }
});

// Handle farm command
async function handleFarmCommand(message, playerData) {
  const now = Date.now();

  // Check cooldown
  if (now < playerData.cooldowns.farm) {
    const remainingTime = Math.ceil((playerData.cooldowns.farm - now) / 1000);
    return message.reply(`You're still tired from your last farming session. You can farm again in ${remainingTime} seconds.`);
=======
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  }

  // Set cooldown
  playerData.cooldowns.farm = now + CONFIG.farmCooldown;

<<<<<<< HEAD
  // Calculate rewards based on level and randomness
  const woodAmount = helpers.getRandomInt(1, 3 + Math.floor(playerData.level / 5));
  const herbChance = 0.3 + (playerData.level * 0.01); // Increases with level

  let rewards = `${woodAmount}x Wood`;
  let herbAmount = 0;

  // Add items to inventory
  addItemToInventory(playerData, 'wood', woodAmount);

  if (Math.random() < herbChance) {
    herbAmount = helpers.getRandomInt(1, 2);
    addItemToInventory(playerData, 'herb', herbAmount);
    rewards += `, ${herbAmount}x Herb`;
  }

  // Special rare finds
  if (Math.random() < 0.05) { // 5% chance
    let specialItem;
    if (Math.random() < 0.7) {
      specialItem = 'seed';
      addItemToInventory(playerData, 'seed', 1);
      rewards += `, 1x Seed`;
    } else {
      specialItem = 'ancient_coin';
      addItemToInventory(playerData, 'ancient_coin', 1);
      rewards += `, 1x Ancient Coin`;
    }
  }

  // XP reward
  const xpReward = helpers.getRandomInt(5, 10 + Math.floor(playerData.level / 2));
  const levelUps = awardXP(playerData, xpReward);

  // Create a farm embed
  const farmEmbed = new EmbedBuilder()
    .setTitle('🌱 Farming Results')
    .setColor(CONFIG.embedColor)
    .setDescription(`You went farming and collected:\n${rewards}`)
    .addFields({ name: 'Experience', value: `+${xpReward} XP`, inline: true });

  if (levelUps > 0) {
    farmEmbed.addFields({ name: 'Level Up!', value: `You are now level ${playerData.level}!`, inline: true });
  }

  // Add cooldown information
  const cooldownTime = Math.floor(CONFIG.farmCooldown / 1000);
  farmEmbed.setFooter({ text: `You can farm again in ${cooldownTime} seconds.` });

  // Check for quest progress
  if (playerData.quests && playerData.quests.active) {
    const updatedQuests = questSystem.updateGatheringQuestProgress(
      playerData.quests.active, 
      { wood: woodAmount, herb: herbAmount },
      'farm'
    );

    if (updatedQuests.length > 0) {
      const questUpdates = updatedQuests.map(q => 
        `Quest "${q.name}": ${q.current}/${q.target} ${q.itemType} collected`
      );
      farmEmbed.addFields({ name: 'Quest Progress', value: questUpdates.join('\n') });
    }
  }

  // Send the message
  message.channel.send({ embeds: [farmEmbed] });

  // Save after important actions
  saveData();
}

// Handle mine command
async function handleMineCommand(message, playerData) {
  const now = Date.now();

  // Check cooldown
  if (now < playerData.cooldowns.mine) {
    const remainingTime = Math.ceil((playerData.cooldowns.mine - now) / 1000);
    return message.reply(`You're still tired from your last mining session. You can mine again in ${remainingTime} seconds.`);
  }

  // Set cooldown
  playerData.cooldowns.mine = now + CONFIG.mineCooldown;

  // Calculate rewards based on level and randomness
  const stoneAmount = helpers.getRandomInt(2, 5 + Math.floor(playerData.level / 5));

  // Chances improve with level
  const ironChance = 0.4 + (playerData.level * 0.01);
  const goldChance = 0.15 + (playerData.level * 0.005);
  const diamondChance = 0.05 + (playerData.level * 0.002);

  // Initialize rewards string and counters
  let rewards = `${stoneAmount}x Stone`;
  let ironAmount = 0;
  let goldAmount = 0;
  let diamondAmount = 0;

  // Add stone to inventory
  addItemToInventory(playerData, 'stone', stoneAmount);

  // Check for iron
  if (Math.random() < ironChance) {
    ironAmount = helpers.getRandomInt(1, 2 + Math.floor(playerData.level / 10));
    addItemToInventory(playerData, 'iron', ironAmount);
    rewards += `, ${ironAmount}x Iron Ore`;
  }

  // Check for gold
  if (Math.random() < goldChance) {
    goldAmount = helpers.getRandomInt(1, 1 + Math.floor(playerData.level / 15));
    addItemToInventory(playerData, 'gold', goldAmount);
    rewards += `, ${goldAmount}x Gold Ore`;
  }

  // Check for diamond (rare)
  if (Math.random() < diamondChance) {
    diamondAmount = 1; // Usually just 1
    addItemToInventory(playerData, 'diamond', diamondAmount);
    rewards += `, ${diamondAmount}x Diamond`;
  }

  // Very rare find
  if (Math.random() < 0.02) { // 2% chance
    addItemToInventory(playerData, 'ancient_relic', 1);
    rewards += `, 1x Ancient Relic`;
  }

  // XP reward
  const xpReward = helpers.getRandomInt(10, 15 + Math.floor(playerData.level / 2));
  const levelUps = awardXP(playerData, xpReward);

  // Create a mining embed
  const miningEmbed = new EmbedBuilder()
    .setTitle('⛏️ Mining Results')
    .setColor(CONFIG.embedColor)
    .setDescription(`You went mining and collected:\n${rewards}`)
    .addFields({ name: 'Experience', value: `+${xpReward} XP`, inline: true });

  if (levelUps > 0) {
    miningEmbed.addFields({ name: 'Level Up!', value: `You are now level ${playerData.level}!`, inline: true });
  }

  // Add cooldown information
  const cooldownTime = Math.floor(CONFIG.mineCooldown / 1000);
  miningEmbed.setFooter({ text: `You can mine again in ${cooldownTime} seconds.` });

  // Check for quest progress
  if (playerData.quests && playerData.quests.active) {
    const updatedQuests = questSystem.updateGatheringQuestProgress(
      playerData.quests.active, 
      { 
        stone: stoneAmount, 
        iron: ironAmount, 
        gold: goldAmount, 
        diamond: diamondAmount 
      },
      'mine'
    );

    if (updatedQuests.length > 0) {
      const questUpdates = updatedQuests.map(q => 
        `Quest "${q.name}": ${q.current}/${q.target} ${q.itemType} collected`
      );
      miningEmbed.addFields({ name: 'Quest Progress', value: questUpdates.join('\n') });
    }
  }

  // Send the message
  message.channel.send({ embeds: [miningEmbed] });

  // Save after important actions
  saveData();
}

// Handle hunt command
async function handleHuntCommand(message, playerData) {
  const now = Date.now();

  // Check cooldown
  if (now < playerData.cooldowns.hunt) {
    const remainingTime = Math.ceil((playerData.cooldowns.hunt - now) / 1000);
    return message.reply(`You're still tired from your last hunting session. You can hunt again in ${remainingTime} seconds.`);
  }

  // Set cooldown
  playerData.cooldowns.hunt = now + CONFIG.huntCooldown;

  // Calculate rewards based on level and randomness
  const leatherAmount = helpers.getRandomInt(1, 3 + Math.floor(playerData.level / 5));

  // Chances improve with level
  const furChance = 0.4 + (playerData.level * 0.01);

  // Initialize rewards string and counters
  let rewards = `${leatherAmount}x Leather`;
  let furAmount = 0;

  // Add leather to inventory
  addItemToInventory(playerData, 'leather', leatherAmount);

  // Check for fur
  if (Math.random() < furChance) {
    furAmount = helpers.getRandomInt(1, 2 + Math.floor(playerData.level / 10));
    addItemToInventory(playerData, 'fur', furAmount);
    rewards += `, ${furAmount}x Fur`;
  }

  // Rare animal part
  if (Math.random() < 0.1) { // 10% chance
    let rareItem;
    if (Math.random() < 0.6) {
      rareItem = 'animal_tooth';
      addItemToInventory(playerData, 'animal_tooth', 1);
      rewards += `, 1x Animal Tooth`;
    } else {
      rareItem = 'animal_horn';
      addItemToInventory(playerData, 'animal_horn', 1);
      rewards += `, 1x Animal Horn`;
    }
  }

  // Very rare find
  if (Math.random() < 0.03) { // 3% chance
    addItemToInventory(playerData, 'rare_pelt', 1);
    rewards += `, 1x Rare Pelt`;
  }

  // XP reward
  const xpReward = helpers.getRandomInt(10, 20 + Math.floor(playerData.level / 2));
  const levelUps = awardXP(playerData, xpReward);

  // Create a hunting embed
  const huntingEmbed = new EmbedBuilder()
    .setTitle('🏹 Hunting Results')
    .setColor(CONFIG.embedColor)
    .setDescription(`You went hunting and collected:\n${rewards}`)
    .addFields({ name: 'Experience', value: `+${xpReward} XP`, inline: true });

  if (levelUps > 0) {
    huntingEmbed.addFields({ name: 'Level Up!', value: `You are now level ${playerData.level}!`, inline: true });
  }

  // Add cooldown information
  const cooldownTime = Math.floor(CONFIG.huntCooldown / 1000);
  huntingEmbed.setFooter({ text: `You can hunt again in ${cooldownTime} seconds.` });

  // Check for quest progress
  if (playerData.quests && playerData.quests.active) {
    const updatedQuests = questSystem.updateGatheringQuestProgress(
      playerData.quests.active, 
      { leather: leatherAmount, fur: furAmount },
      'hunt'
    );

    if (updatedQuests.length > 0) {
      const questUpdates = updatedQuests.map(q => 
        `Quest "${q.name}": ${q.current}/${q.target} ${q.itemType} collected`
      );
      huntingEmbed.addFields({ name: 'Quest Progress', value: questUpdates.join('\n') });
    }
  }

  // Send the message
  message.channel.send({ embeds: [huntingEmbed] });

  // Save after important actions
  saveData();
}

// Handle fish command
async function handleFishCommand(message, playerData) {
  const now = Date.now();

  // Check cooldown
  if (now < playerData.cooldowns.fish) {
    const remainingTime = Math.ceil((playerData.cooldowns.fish - now) / 1000);
    return message.reply(`You're still waiting for the fish to return. You can fish again in ${remainingTime} seconds.`);
  }

  // Set cooldown
  playerData.cooldowns.fish = now + CONFIG.fishCooldown;

  // Calculate rewards based on level and randomness
  const fishAmount = helpers.getRandomInt(1, 2 + Math.floor(playerData.level / 5));

  // Initialize rewards string and counters
  let rewards = `${fishAmount}x Fish`;

  // Add fish to inventory
  addItemToInventory(playerData, 'fish', fishAmount);

  // Rare catches
  if (Math.random() < 0.15) { // 15% chance
    let rareItem;
    if (Math.random() < 0.7) {
      rareItem = 'seaweed';
      addItemToInventory(playerData, 'seaweed', 1);
      rewards += `, 1x Seaweed`;
    } else {
      rareItem = 'pearl';
      addItemToInventory(playerData, 'pearl', 1);
      rewards += `, 1x Pearl`;
    }
  }

  // Very rare treasure
  if (Math.random() < 0.03) { // 3% chance
    addItemToInventory(playerData, 'treasure_chest', 1);
    rewards += `, 1x Treasure Chest`;
  }

  // XP reward
  const xpReward = helpers.getRandomInt(10, 15 + Math.floor(playerData.level / 2));
  const levelUps = awardXP(playerData, xpReward);

  // Create a fishing embed
  const fishingEmbed = new EmbedBuilder()
    .setTitle('🎣 Fishing Results')
    .setColor(CONFIG.embedColor)
    .setDescription(`You went fishing and caught:\n${rewards}`)
    .addFields({ name: 'Experience', value: `+${xpReward} XP`, inline: true });

  if (levelUps > 0) {
    fishingEmbed.addFields({ name: 'Level Up!', value: `You are now level ${playerData.level}!`, inline: true });
  }

  // Add cooldown information
  const cooldownTime = Math.floor(CONFIG.fishCooldown / 1000);
  fishingEmbed.setFooter({ text: `You can fish again in ${cooldownTime} seconds.` });

  // Check for quest progress
  if (playerData.quests && playerData.quests.active) {
    const updatedQuests = questSystem.updateGatheringQuestProgress(
      playerData.quests.active, 
      { fish: fishAmount },
      'fish'
    );

    if (updatedQuests.length > 0) {
      const questUpdates = updatedQuests.map(q => 
        `Quest "${q.name}": ${q.current}/${q.target} ${q.itemType} collected`
      );
      fishingEmbed.addFields({ name: 'Quest Progress', value: questUpdates.join('\n') });
    }
  }

  // Send the message
  message.channel.send({ embeds: [fishingEmbed] });

  // Save after important actions
  saveData();
}

// Handle shop command
async function handleShopCommand(message, playerData, args) {
  if (!args.length) {
    // Create category selection buttons
    const categoryRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('shop_weapons')
          .setLabel('⚔️ Weapons')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('shop_armor')
          .setLabel('🛡️ Armor')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('shop_consumables')
          .setLabel('🧪 Consumables')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('shop_pets')
          .setLabel('🐾 Pet Items')
          .setStyle(ButtonStyle.Primary)
      );

    // Create initial shop embed
    const shopEmbed = new EmbedBuilder()
      .setTitle('🛒 Item Shop')
      .setColor(CONFIG.embedColor)
      .setDescription(`Welcome to the shop!\nYou have ${playerData.gold} ${CONFIG.currency}\n\nSelect a category to view items.`)
      .setFooter({ text: 'Click the buttons below to browse categories' });

    const msg = await message.channel.send({
      embeds: [shopEmbed],
      components: [categoryRow]
    });

    // Create collector for button interactions
    const collector = msg.createMessageComponentCollector({
      time: 300000 // 5 minutes
    });

    collector.on('collect', async i => {
      if (i.user.id !== message.author.id) {
        return i.reply({ content: 'Only the command user can use these buttons!', ephemeral: true });
      }

      if (i.customId.startsWith('shop_')) {
        // Handle category selection
        const category = i.customId.split('_')[1];
        const items = SHOP_ITEMS.filter(itemId => {
          const item = ITEMS[itemId];
          return item && (
            (category === 'weapons' && item.type === 'weapon') ||
            (category === 'armor' && item.type === 'armor') ||
            (category === 'consumables' && item.type === 'consumable') ||
            (category === 'pets' && item.type === 'pet')
          );
        });

        const itemButtons = [];
        let currentRow = new ActionRowBuilder();
        let buttonCount = 0;

        items.forEach(itemId => {
          const item = ITEMS[itemId];
          if (buttonCount === 5) {
            itemButtons.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonCount = 0;
          }

          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`buy_${itemId}`)
              .setLabel(`${item.name} (${item.value} 🪙)`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(playerData.gold < item.value)
          );
          buttonCount++;
        });

        if (buttonCount > 0) {
          itemButtons.push(currentRow);
        }

        // Add back button
        const backRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('shop_back')
              .setLabel('← Back to Categories')
              .setStyle(ButtonStyle.Danger)
          );
        itemButtons.push(backRow);

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`🛒 ${category.charAt(0).toUpperCase() + category.slice(1)}`)
          .setColor(CONFIG.embedColor)
          .setDescription(`Your gold: ${playerData.gold} ${CONFIG.currency}\nClick an item to purchase it.`);

        items.forEach(itemId => {
          const item = ITEMS[itemId];
          let itemDesc = `Price: ${item.value} ${CONFIG.currency}\n${item.description}`;
          
          if (item.requirements) {
            itemDesc += `\nRequired Level: ${item.requirements.level}`;
          }
          
          if (item.power) {
            itemDesc += `\nAttack: +${item.power}`;
          }
          
          if (item.defense) {
            itemDesc += `\nDefense: +${item.defense}`;
          }

          categoryEmbed.addFields({
            name: item.name,
            value: itemDesc,
            inline: true
          });
        });

        await i.update({
          embeds: [categoryEmbed],
          components: itemButtons
        });
      } else if (i.customId === 'shop_back') {
        // Handle back button
        await i.update({
          embeds: [shopEmbed],
          components: [categoryRow]
        });
      } else if (i.customId.startsWith('buy_')) {
        // Handle purchase
        const itemId = i.customId.split('_')[1];
        const item = ITEMS[itemId];

        if (playerData.gold < item.value) {
          return i.reply({ content: `You don't have enough gold to buy ${item.name}!`, ephemeral: true });
        }

        if (item.requirements && playerData.level < item.requirements.level) {
          return i.reply({ content: `You need to be level ${item.requirements.level} to buy ${item.name}!`, ephemeral: true });
        }

        // Process purchase
        playerData.gold -= item.value;
        addItemToInventory(playerData, itemId);

        // Update global stats
        gameData.serverStats.totalGoldEarned += item.value;

        const purchaseEmbed = new EmbedBuilder()
          .setTitle('🛍️ Purchase Successful!')
          .setColor(CONFIG.embedColor)
          .setDescription(`You purchased ${item.name} for ${item.value} ${CONFIG.currency}.\nYou now have ${playerData.gold} ${CONFIG.currency}.`);

        await i.reply({ embeds: [purchaseEmbed], ephemeral: true });
        saveData();

        // Refresh the shop view
        const category = item.type + 's';
        i.message.components[0].components.forEach(button => {
          if (button.data.custom_id === `buy_${itemId}`) {
            button.setDisabled(playerData.gold < item.value);
          }
        });

        await i.message.edit({
          components: i.message.components
        });
      }
    });

    collector.on('end', () => {
      msg.edit({ components: [] });
    });

    return;
  }

  const action = args[0].toLowerCase();

  if (action === 'buy') {
    if (!args[1]) {
      return message.reply('Please specify an item to buy. Use `!shop` to see available items.');
    }

    const itemId = args[1].toLowerCase();

    // Check if item exists in shop
    if (!SHOP_ITEMS.includes(itemId) || !ITEMS[itemId]) {
      return message.reply('That item is not available in the shop. Use `!shop` to see available items.');
    }

    const item = ITEMS[itemId];

    // Check level requirement
    if (item.requirements && playerData.level < item.requirements.level) {
      return message.reply(`You need to be level ${item.requirements.level} to purchase this item.`);
    }

    // Check if player has enough gold
    if (playerData.gold < item.value) {
      return message.reply(`You don't have enough gold to buy ${item.name}. You need ${item.value} ${CONFIG.currency}, but you only have ${playerData.gold} ${CONFIG.currency}.`);
    }

    // Buy the item
    playerData.gold -= item.value;
    addItemToInventory(playerData, itemId);

    // Track global stats
    gameData.serverStats.totalGoldEarned += item.value;

    message.reply(`You purchased ${item.name} for ${item.value} ${CONFIG.currency}. You now have ${playerData.gold} ${CONFIG.currency} remaining.`);

    // Save after purchase
    saveData();
  } else if (action === 'sell') {
    if (!args[1]) {
      return message.reply('Please specify an item to sell. Use `!inventory` to see your items.');
    }

    const itemId = args[1].toLowerCase();
    let quantity = 1;

    if (args[2] && !isNaN(parseInt(args[2]))) {
      quantity = parseInt(args[2]);
      if (quantity <= 0) {
        return message.reply('Please enter a valid quantity.');
      }
    }

    // Check if player has the item
    if (!playerData.inventory[itemId] || playerData.inventory[itemId] < quantity) {
      return message.reply(`You don't have ${quantity}x ${ITEMS[itemId]?.name || itemId} to sell.`);
    }

    const item = ITEMS[itemId];
    if (!item) {
      return message.reply('That item does not exist.');
    }

    // Calculate sell value (usually 60% of buy value)
    const sellValue = Math.floor(item.value * 0.6) * quantity;

    // Sell the item
    removeItemFromInventory(playerData, itemId, quantity);
    playerData.gold += sellValue;

    message.reply(`You sold ${quantity}x ${item.name} for ${sellValue} ${CONFIG.currency}. You now have ${playerData.gold} ${CONFIG.currency}.`);

    // Save after sale
    saveData();
  } else {
    message.reply('Invalid shop action. Use `!shop buy <item>` or `!shop sell <item> [quantity]`.');
  }
}

// Handle craft command
async function handleCraftCommand(message, playerData, args) {
  // Import recipes
  const RECIPES = require('./data/items').RECIPES;

  if (!args.length) {
    // Display available recipes
    const recipesEmbed = new EmbedBuilder()
      .setTitle('⚒️ Crafting Recipes')
      .setColor(CONFIG.embedColor)
      .setDescription('Here are the available crafting recipes:');

    let recipeText = '';
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      const resultItem = ITEMS[recipe.result];
      recipeText += `**${resultItem.name}**:\n`;

      for (const [materialId, quantity] of Object.entries(recipe.materials)) {
        const material = ITEMS[materialId];
        recipeText += `- ${material.name}: ${quantity}\n`;
      }

      recipeText += '\n';
    }

    recipesEmbed.addFields({ name: 'Recipes', value: recipeText || 'No recipes available' });
    return message.channel.send({ embeds: [recipesEmbed] });
  }

  const recipeId = args[0].toLowerCase();

  // Check if recipe exists
  if (!RECIPES[recipeId]) {
    return message.reply('That recipe does not exist. Use `!craft` to see available recipes.');
  }

  const recipe = RECIPES[recipeId];
  const resultItem = ITEMS[recipe.result];

  // Check level requirements if any
  if (resultItem.requirements && playerData.level < resultItem.requirements.level) {
    return message.reply(`You need to be level ${resultItem.requirements.level} to craft ${resultItem.name}.`);
  }

  // Check if player has the required materials
  const missingMaterials = [];
  for (const [materialId, quantity] of Object.entries(recipe.materials)) {
    const playerQuantity = playerData.inventory[materialId] || 0;
    if (playerQuantity < quantity) {
      missingMaterials.push(`${ITEMS[materialId].name} (have ${playerQuantity}/${quantity})`);
    }
  }

  if (missingMaterials.length > 0) {
    return message.reply(`You don't have the required materials to craft ${resultItem.name}. Missing: ${missingMaterials.join(', ')}`);
  }

  // Remove materials from inventory
  for (const [materialId, quantity] of Object.entries(recipe.materials)) {
    removeItemFromInventory(playerData, materialId, quantity);
  }

  // Add crafted item to inventory
  addItemToInventory(playerData, recipe.result, recipe.count || 1);

  // Update craft count
  playerData.totalCrafted = (playerData.totalCrafted || 0) + 1;

  // Update global stats
  gameData.serverStats.totalItemsCrafted++;

  // Check for crafting achievements
  if (playerData.totalCrafted >= 10 && !playerData.achievements.includes('crafter10')) {
    playerData.achievements.push('crafter10');
    playerData.gold += 100;
    addNotification(playerData, "🏆 Achievement Unlocked: Craft 10 items! Received 100 gold.");
  }

  if (playerData.totalCrafted >= 50 && !playerData.achievements.includes('crafter50')) {
    playerData.achievements.push('crafter50');
    addItemToInventory(playerData, 'crafters_gloves', 1);
    addNotification(playerData, "🏆 Achievement Unlocked: Craft 50 items! Received Crafter's Gloves.");
  }

  // Award XP for crafting
  const xpReward = 15 + Math.floor(resultItem.value / 10);
  const levelUps = awardXP(playerData, xpReward);

  // Create crafting embed
  const craftEmbed = new EmbedBuilder()
    .setTitle('⚒️ Item Crafted')
    .setColor(CONFIG.embedColor)
    .setDescription(`You crafted ${recipe.count || 1}x **${resultItem.name}**!`)
    .addFields(
      { name: 'Materials Used', value: Object.entries(recipe.materials).map(([id, qty]) => `${ITEMS[id].name}: ${qty}`).join('\n'), inline: false },
      { name: 'Experience', value: `+${xpReward} XP`, inline: true }
    );

  if (levelUps > 0) {
    craftEmbed.addFields({ name: 'Level Up!', value: `You are now level ${playerData.level}!`, inline: true });
  }

  message.channel.send({ embeds: [craftEmbed] });

  // Save after crafting
  saveData();
}

// Handle equip command
async function handleEquipCommand(message, playerData, args) {
  if (!args.length) {
    return message.reply('Please specify an item to equip. Usage: `!equip <item>`');
  }

  const itemId = args[0].toLowerCase();

  // Check if player has the item
  if (!playerData.inventory[itemId]) {
    return message.reply(`You don't have ${ITEMS[itemId]?.name || itemId} in your inventory.`);
  }

  const item = ITEMS[itemId];
  if (!item) {
    return message.reply('That item does not exist.');
  }

  // Check if item is equippable
  if (item.type !== 'weapon' && item.type !== 'armor') {
    return message.reply(`${item.name} is not equippable. You can only equip weapons and armor.`);
  }

  // Check level requirement
  if (item.requirements && playerData.level < item.requirements.level) {
    return message.reply(`You need to be level ${item.requirements.level} to equip ${item.name}.`);
  }

  // Unequip previous item of the same type if any
  const slot = item.type; // 'weapon' or 'armor'
  const previousItemId = playerData.equipped[slot];

  if (previousItemId) {
    addItemToInventory(playerData, previousItemId);
  }

  // Equip new item
  playerData.equipped[slot] = itemId;
  removeItemFromInventory(playerData, itemId);

  // Update stats based on equipped items
  updatePlayerStats(playerData);

  // Create equip embed
  const equipEmbed = new EmbedBuilder()
    .setTitle('⚔️ Item Equipped')
    .setColor(CONFIG.embedColor)
    .setDescription(`You equipped ${item.name}!`)
    .addFields(
      { name: 'Slot', value: slot.charAt(0).toUpperCase() + slot.slice(1), inline: true },
      { name: slot === 'weapon' ? 'Attack Power' : 'Defense', value: `+${slot === 'weapon' ? item.power : item.defense}`, inline: true }
    );

  if (previousItemId) {
    equipEmbed.addFields(
      { name: 'Previous Item', value: `${ITEMS[previousItemId].name} was returned to your inventory`, inline: false }
    );
  }

  message.channel.send({ embeds: [equipEmbed] });

  // Save after equipping
  saveData();
}

// Handle unequip command
async function handleUnequipCommand(message, playerData, args) {
  if (!args.length) {
    return message.reply('Please specify what to unequip. Usage: `!unequip <weapon|armor>`');
  }

  const slot = args[0].toLowerCase();

  if (slot !== 'weapon' && slot !== 'armor') {
    return message.reply('You can only unequip `weapon` or `armor`. Usage: `!unequip <weapon|armor>`');
  }

  // Check if player has an item equipped in that slot
  const equippedItemId = playerData.equipped[slot];
  if (!equippedItemId) {
    return message.reply(`You don't have anything equipped in your ${slot} slot.`);
  }

  // Unequip the item
  const item = ITEMS[equippedItemId];
  playerData.equipped[slot] = null;
  addItemToInventory(playerData, equippedItemId);

  // Update stats
  updatePlayerStats(playerData);

  // Create unequip embed
  const unequipEmbed = new EmbedBuilder()
    .setTitle('🔄 Item Unequipped')
    .setColor(CONFIG.embedColor)
    .setDescription(`You unequipped ${item.name} and placed it in your inventory.`);

  message.channel.send({ embeds: [unequipEmbed] });

  // Save after unequipping
  saveData();
}

// Update player stats based on level and equipment
function updatePlayerStats(playerData) {
  // Base stats from level
  playerData.stats.strength = 5 + ((playerData.level - 1) * 2);
  playerData.stats.defense = 5 + ((playerData.level - 1) * 2);

  // Add equipment bonuses
  if (playerData.equipped.weapon && ITEMS[playerData.equipped.weapon]) {
    playerData.stats.strength += ITEMS[playerData.equipped.weapon].power || 0;
  }

  if (playerData.equipped.armor && ITEMS[playerData.equipped.armor]) {
    playerData.stats.defense += ITEMS[playerData.equipped.armor].defense || 0;
  }

  // Set max health (based on level)
  playerData.stats.maxHealth = 100 + ((playerData.level - 1) * 10);

  // Add pet bonuses if applicable
  if (playerData.pet) {
    const petBonus = Math.floor(playerData.petStats.level / 2);
    playerData.stats.strength += petBonus;
    playerData.stats.defense += petBonus;
    playerData.stats.maxHealth += (petBonus * 5);
  }

  // Ensure current health doesn't exceed max health
  if (playerData.stats.currentHealth > playerData.stats.maxHealth) {
    playerData.stats.currentHealth = playerData.stats.maxHealth;
  }
}

// Handle use command
async function handleUseCommand(message, playerData, args) {
  if (!args.length) {
    return message.reply('Please specify an item to use. Usage: `!use <item>`');
  }

  const itemId = args[0].toLowerCase();

  // Check if player has the item
  if (!playerData.inventory[itemId]) {
    return message.reply(`You don't have ${ITEMS[itemId]?.name || itemId} in your inventory.`);
  }

  const item = ITEMS[itemId];
  if (!item) {
    return message.reply('That item does not exist.');
  }

  // Check if item is usable
  if (item.type !== 'consumable') {
    return message.reply(`${item.name} is not usable. You can only use consumable items.`);
  }

  // Apply item effect
  let effectDescription = '';

  switch (item.effect) {
    case 'heal':
      const healAmount = item.power;
      const oldHealth = playerData.stats.currentHealth;
      playerData.stats.currentHealth = Math.min(playerData.stats.maxHealth, playerData.stats.currentHealth + healAmount);
      const actualHeal = playerData.stats.currentHealth - oldHealth;
      effectDescription = `Restored ${actualHeal} health. Current health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`;
      break;

    case 'strength':
      // Temporary buff stored in player data
      playerData.buffs = playerData.buffs || {};
      playerData.buffs.strength = {
        amount: item.power,
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      effectDescription = `Increased strength by ${item.power} for 30 minutes!`;
      break;

    case 'defense':
      // Temporary buff stored in player data
      playerData.buffs = playerData.buffs || {};
      playerData.buffs.defense = {
        amount: item.power,
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      effectDescription = `Increased defense by ${item.power} for 30 minutes!`;
      break;

    case 'pet_food':
      if (!playerData.pet) {
        return message.reply("You don't have a pet to feed!");
      }
      playerData.petStats.hunger = Math.min(100, playerData.petStats.hunger + item.power);
      effectDescription = `Fed your pet ${playerData.petStats.name}. Hunger: ${playerData.petStats.hunger}/100`;
      break;

    case 'pet_toy':
      if (!playerData.pet) {
        return message.reply("You don't have a pet to play with!");
      }
      playerData.petStats.happiness = Math.min(100, playerData.petStats.happiness + item.power);
      effectDescription = `Played with your pet ${playerData.petStats.name}. Happiness: ${playerData.petStats.happiness}/100`;
      break;

    case 'treasure':
      // Open treasure chest
      const goldFound = helpers.getRandomInt(50, 200 + (playerData.level * 10));
      playerData.gold += goldFound;

      // Chance to find rare items
      let foundItems = [];
      if (Math.random() < 0.4) {
        addItemToInventory(playerData, 'health_potion', 1);
        foundItems.push("1x Health Potion");
      }

      if (Math.random() < 0.2) {
        const gem = Math.random() < 0.3 ? 'ruby' : 'sapphire';
        addItemToInventory(playerData, gem, 1);
        foundItems.push(`1x ${ITEMS[gem].name}`);
      }

      effectDescription = `Opened treasure chest and found ${goldFound} ${CONFIG.currency}`;
      if (foundItems.length > 0) {
        effectDescription += ` and ${foundItems.join(', ')}`;
      }
      break;

    default:
      return message.reply(`This item cannot be used right now.`);
  }

  // Remove the used item
  removeItemFromInventory(playerData, itemId);

  // Create item use embed
  const useEmbed = new EmbedBuilder()
    .setTitle('🧪 Item Used')
    .setColor(CONFIG.embedColor)
    .setDescription(`You used ${item.name}!`)
    .addFields({ name: 'Effect', value: effectDescription });

  message.channel.send({ embeds: [useEmbed] });

  // Save after using item
  saveData();
}

// Handle adventure command
async function handleAdventureCommand(message, playerData, args) {
  const now = Date.now();

  // Check cooldown
  if (now < playerData.cooldowns.adventure) {
    const remainingTime = Math.ceil((playerData.cooldowns.adventure - now) / 1000);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return message.reply(`You're still recovering from your last adventure. You can adventure again in ${minutes}m ${seconds}s.`);
  }

  // Check if player's health is too low
  if (playerData.stats.currentHealth < playerData.stats.maxHealth * 0.3) {
    return message.reply(`Your health is too low to go on an adventure! Current health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}. Use \`!heal\` to recover.`);
  }

  // Get available locations from the locations module
  const ADVENTURE_LOCATIONS = LOCATIONS.ADVENTURE_LOCATIONS;

  // If no location specified, show available locations
  if (!args.length) {
    const locationsEmbed = new EmbedBuilder()
      .setTitle('🗺️ Adventure Locations')
      .setColor(CONFIG.embedColor)
      .setDescription('Choose a location for your adventure:');

    const locationFields = ADVENTURE_LOCATIONS.map(location => {
      return {
        name: `${location.name} (Level ${location.minLevel}+)`,
        value: `${location.description}\nPossible Rewards: ${location.rewards.items.map(item => ITEMS[item.id].name).join(', ')}`,
        inline: false
      };
    });

    locationFields.push({
      name: 'Usage',
      value: 'Use `!adventure <location_name>` to embark on an adventure!',
      inline: false
    });

    locationsEmbed.addFields(locationFields);
    return message.channel.send({ embeds: [locationsEmbed] });
  }

  // Find specified location
  const locationName = args.join(' ').toLowerCase();
  const location = ADVENTURE_LOCATIONS.find(loc => 
    loc.name.toLowerCase() === locationName
  );

  if (!location) {
    return message.reply(`Location "${args.join(' ')}" not found. Use \`!adventure\` to see available locations.`);
=======
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  }

  // Check level requirement
  if (playerData.level < location.minLevel) {
<<<<<<< HEAD
    return message.reply(`You need to be at least level ${location.minLevel} to adventure in ${location.name}.`);
=======
    return message.reply(`You need to be at least level ${location.minLevel} to adventure in ${location.name}!`);
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  }

  // Set cooldown
  playerData.cooldowns.adventure = now + CONFIG.adventureCooldown;

<<<<<<< HEAD
  // Update global stats
  gameData.serverStats.totalAdventures++;

  // Run the adventure using the combat system
  const adventureResult = await combatSystem.runAdventure(message, playerData, location);

  // If adventure went well, update quest progress
  if (adventureResult.success && playerData.quests && playerData.quests.active) {
    const updatedQuests = questSystem.updateAdventureQuestProgress(
      playerData.quests.active,
      location.name,
      adventureResult.defeatedEnemies
    );

    if (updatedQuests.length > 0) {
      const questEmbed = new EmbedBuilder()
        .setTitle('📜 Quest Progress Updated')
        .setColor(CONFIG.embedColor)
        .setDescription(updatedQuests.map(q => 
          `Quest "${q.name}": ${q.current}/${q.target} ${q.type === 'location' ? 'visits' : 'enemies defeated'}`
        ).join('\n'));

      message.channel.send({ embeds: [questEmbed] });
    }
  }

  // Save after adventure
  saveData();
}

// Handle heal command
async function handleHealCommand(message, playerData) {
  if (playerData.stats.currentHealth >= playerData.stats.maxHealth) {
    return message.reply(`You are already at full health! (${playerData.stats.currentHealth}/${playerData.stats.maxHealth})`);
  }

  // Calculate healing cost (10 gold per 10% of max health missing)
  const missingHealthPercent = (playerData.stats.maxHealth - playerData.stats.currentHealth) / playerData.stats.maxHealth;
  const healCost = Math.ceil(missingHealthPercent * playerData.stats.maxHealth);

  // Check if player can afford healing
  if (playerData.gold < healCost) {
    return message.reply(`You don't have enough gold to heal. Cost: ${healCost} ${CONFIG.currency}, You have: ${playerData.gold} ${CONFIG.currency}`);
  }

  // Interactive healing confirmation
  const confirmRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_heal')
        .setLabel('Heal')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel_heal')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );

  const confirmEmbed = new EmbedBuilder()
    .setTitle('❤️ Healing')
    .setColor(CONFIG.embedColor)
    .setDescription(`Healing to full health will cost ${healCost} ${CONFIG.currency}.\nYour current health: ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}\nYour gold: ${playerData.gold} ${CONFIG.currency}`)
    .setFooter({ text: 'Click a button to confirm or cancel' });

  const confirmMsg = await message.channel.send({ 
    embeds: [confirmEmbed],
    components: [confirmRow]
  });

  // Create collector for button interactions
  const filter = i => {
    return ['confirm_heal', 'cancel_heal'].includes(i.customId) && i.user.id === message.author.id;
  };

  const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });

  collector.on('collect', async i => {
    await i.deferUpdate();

    if (i.customId === 'confirm_heal') {
      // Deduct gold and heal
      playerData.gold -= healCost;
      playerData.stats.currentHealth = playerData.stats.maxHealth;

      const healEmbed = new EmbedBuilder()
        .setTitle('❤️ Healed')
        .setColor(CONFIG.embedColor)
        .setDescription(`You have been fully healed for ${healCost} ${CONFIG.currency}!`)
        .addFields(
          { name: 'Current Health', value: `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true },
          { name: 'Remaining Gold', value: `${playerData.gold} ${CONFIG.currency}`, inline: true }
        );

      await confirmMsg.edit({ 
        embeds: [healEmbed],
        components: [] 
      });

      // Save after healing
      saveData();
    } else {
      // Cancel healing
      await confirmMsg.edit({ 
        content: 'Healing canceled.',
        embeds: [],
        components: [] 
      });
    }

    collector.stop();
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      confirmMsg.edit({ 
        content: 'Healing request timed out.',
        embeds: [],
        components: [] 
      });
    }
  });
}

// Handle party command
async function handlePartyCommand(message, playerData, args) {
  if (!args.length || args[0] === 'status') {
    // Show party status
    const partyId = helpers.getPartyIdForPlayer(gameData.parties, message.author.id);

    if (!partyId) {
      return message.reply('You are not in a party. Use `!party invite @player` to invite someone to your party.');
    }

    const party = gameData.parties[partyId];
    const members = party.members.map(memberId => {
      const memberData = gameData.players[memberId];
      if (!memberData) return 'Unknown player';

      return `${memberData.username || 'Unknown'} (Level ${memberData.level}) - HP: ${memberData.stats.currentHealth}/${memberData.stats.maxHealth}`;
    });

    const partyEmbed = new EmbedBuilder()
      .setTitle('🤝 Party Status')
      .setColor(CONFIG.embedColor)
      .setDescription(`Your party has ${party.members.length} members:`)
      .addFields(
        { name: 'Members', value: members.join('\n'), inline: false },
        { name: 'Leader', value: gameData.players[party.leader]?.username || 'Unknown', inline: false }
      )
      .setFooter({ text: `Party ID: ${partyId}` });

    return message.channel.send({ embeds: [partyEmbed] });
=======
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
  }

  const action = args[0].toLowerCase();

<<<<<<< HEAD
  if (action === 'invite') {
    // Check if user mentioned someone
    if (!message.mentions.users.size) {
      return message.reply('You need to mention a user to invite them to your party.');
    }

    const targetUser = message.mentions.users.first();

    // Can't invite yourself
    if (targetUser.id === message.author.id) {
      return message.reply('You cannot invite yourself to a party.');
    }

    // Check if target user exists in game data
    const targetPlayerData = getPlayerData(targetUser.id, targetUser.username);

    // Check if levels are close enough (within 5 levels)
    if (Math.abs(playerData.level - targetPlayerData.level) > 5) {
      return message.reply(`You cannot invite ${targetUser.username} because their level (${targetPlayerData.level}) is too different from yours (${playerData.level}). Party members must be within 5 levels of each other.`);
    }

    // Check if player is already in a party
    const playerPartyId = helpers.getPartyIdForPlayer(gameData.parties, message.author.id);

    // Check if target is already in a party
    const targetPartyId = helpers.getPartyIdForPlayer(gameData.parties, targetUser.id);
    if (targetPartyId) {
      return message.reply(`${targetUser.username} is already in a party.`);
    }

    // Create party invite
    gameData.partyInvites[targetUser.id] = {
      inviterId: message.author.id,
      timestamp: Date.now(),
      partyId: playerPartyId // Will be null if inviter doesn't have a party yet
    };

    message.channel.send(`${targetUser}, you have been invited to join ${message.author.username}'s party! Use \`!party accept @${message.author.username}\` to accept.`);
  } else if (action === 'accept') {
    // Check if user mentioned someone
    if (!message.mentions.users.size) {
      return message.reply('You need to mention the user whose invitation you want to accept.');
    }

    const inviterUser = message.mentions.users.first();

    // Check if invitation exists
    if (!gameData.partyInvites[message.author.id] || gameData.partyInvites[message.author.id].inviterId !== inviterUser.id) {
      return message.reply(`You don't have a pending invitation from ${inviterUser.username}.`);
    }

    const invitation = gameData.partyInvites[message.author.id];

    // Check if invitation is expired (30 minutes)
    if (Date.now() - invitation.timestamp > 30 * 60 * 1000) {
      delete gameData.partyInvites[message.author.id];
      return message.reply('This invitation has expired. Ask for a new one.');
    }

    // Check if player is already in a party
    const playerPartyId = helpers.getPartyIdForPlayer(gameData.parties, message.author.id);
    if (playerPartyId) {
      return message.reply('You are already in a party. Use `!party leave` to leave your current party first.');
    }

    // Get inviter's party
    let partyId = invitation.partyId;

    // If inviter doesn't have a party yet, create one
    if (!partyId) {
      partyId = Date.now().toString();
      gameData.parties[partyId] = {
        leader: inviterUser.id,
        members: [inviterUser.id],
        created: Date.now()
      };
    }

    // Add player to party
    gameData.parties[partyId].members.push(message.author.id);

    // Remove invitation
    delete gameData.partyInvites[message.author.id];

    // Notify both players
    message.reply(`You have joined ${inviterUser.username}'s party!`);

    // Save after party changes
    saveData();
  } else if (action === 'leave') {
    // Check if player is in a party
    const partyId = helpers.getPartyIdForPlayer(gameData.parties, message.author.id);

    if (!partyId) {
      return message.reply('You are not in a party.');
    }

    const party = gameData.parties[partyId];

    // Remove player from party
    party.members = party.members.filter(memberId => memberId !== message.author.id);

    // If party is empty or if leader left, disband party
    if (party.members.length === 0 || party.leader === message.author.id) {
      delete gameData.parties[partyId];
      message.reply('You left the party. Since you were the leader, the party has been disbanded.');
    } else {
      message.reply('You left the party.');
    }

    // Save after party changes
    saveData();
  } else if (action === 'adventure') {
    // Check if player is in a party
    const partyId = helpers.getPartyIdForPlayer(gameData.parties, message.author.id);

    if (!partyId) {
      return message.reply('You are not in a party. Join a party first before going on a party adventure.');
    }

    const party = gameData.parties[partyId];

    // Only party leader can start an adventure
    if (party.leader !== message.author.id) {
      return message.reply('Only the party leader can start a party adventure.');
    }

    // Check if all party members are ready (cooldowns, health)
    const notReadyMembers = [];

    for (const memberId of party.members) {
      const memberData = gameData.players[memberId];

      if (!memberData) continue;

      // Check cooldown
      if (Date.now() < memberData.cooldowns.adventure) {
        notReadyMembers.push(`${memberData.username || 'Unknown'} (on cooldown)`);
      }

      // Check health
      if (memberData.stats.currentHealth < memberData.stats.maxHealth * 0.3) {
        notReadyMembers.push(`${memberData.username || 'Unknown'} (low health)`);
      }
    }

    if (notReadyMembers.length > 0) {
      return message.reply(`Some party members are not ready for an adventure: ${notReadyMembers.join(', ')}`);
    }

    // Run party adventure (similar to regular adventure but with all members)
    await message.reply("Party adventure coming soon!");

    // Save after adventure
    saveData();
  } else {
    message.reply('Invalid party action. Available actions: status, invite, accept, leave, adventure');
  }
}

// Handle leaderboard command
async function handleLeaderboardCommand(message, args) {
  let category = 'level';
  if (args.length > 0) {
    category = args[0].toLowerCase();
  }

  let title, sortFn;

  switch (category) {
    case 'level':
      title = '🏆 Level Leaderboard';
      sortFn = (a, b) => b[1].level - a[1].level;
      break;
    case 'gold':
      title = '💰 Gold Leaderboard';
      sortFn = (a, b) => b[1].gold - a[1].gold;
      break;
    case 'craft':
    case 'crafting':
      title = '⚒️ Crafting Leaderboard';
      sortFn = (a, b) => (b[1].totalCrafted || 0) - (a[1].totalCrafted || 0);
      break;
    default:
      return message.reply('Invalid leaderboard category. Available categories: level, gold, craft');
  }

  // Get sorted player data
  const players = Object.entries(gameData.players)
    .sort(sortFn)
    .slice(0, 10);

  // Create leaderboard embed
  const leaderboardEmbed = new EmbedBuilder()
    .setTitle(title)
    .setColor(CONFIG.embedColor)
    .setDescription('Top 10 players:');

  const leaderboardFields = players.map((player, index) => {
    const [playerId, playerData] = player;
    let value;

    switch (category) {
      case 'level':
        value = `Level ${playerData.level} (${playerData.xp}/${helpers.getXpForLevel(playerData.level)} XP)`;
        break;
      case 'gold':
        value = `${playerData.gold} ${CONFIG.currency}`;
        break;
      case 'craft':
      case 'crafting':
        value = `${playerData.totalCrafted || 0} items crafted`;
        break;
    }

    return {
      name: `#${index + 1} ${playerData.username || 'Unknown'}`,
      value: value,
      inline: false
    };
  });

  leaderboardEmbed.addFields(leaderboardFields);

  message.channel.send({ embeds: [leaderboardEmbed] });
}

// Handle notifications command
async function handleNotificationsCommand(message, playerData) {
  if (!playerData.notifications || playerData.notifications.length === 0) {
    return message.reply('You have no notifications.');
  }

  const notificationsEmbed = new EmbedBuilder()
    .setTitle('📬 Your Notifications')
    .setColor(CONFIG.embedColor)
    .setDescription('Your recent notifications:');

  // Add last 10 notifications, newest first
  const fields = playerData.notifications.slice(-10).reverse().map((notification, index) => {
    const timeAgo = helpers.formatTimeAgo(notification.timestamp);
    return {
      name: `#${index + 1} (${timeAgo})`,
      value: notification.message
    };
  });

  notificationsEmbed.addFields(fields);

  // Mark all notifications as read
  playerData.notifications.forEach(notification => {
    notification.read = true;
  });

  message.channel.send({ embeds: [notificationsEmbed] });

  // Save after reading notifications
  saveData();
}

// Handle stats command
async function handleStatsCommand(message, playerData) {
  // Update stats first to make sure they're current
  updatePlayerStats(playerData);

  const statsEmbed = new EmbedBuilder()
    .setTitle(`${message.author.username}'s Stats`)
    .setColor(CONFIG.embedColor)
    .addFields(
      { name: 'Level', value: `${playerData.level} (${playerData.xp}/${helpers.getXpForLevel(playerData.level)} XP)`, inline: true },
      { name: 'Health', value: `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true },
      { name: 'Gold', value: `${playerData.gold} ${CONFIG.currency}`, inline: true },
      { name: 'Strength', value: `${playerData.stats.strength}`, inline: true },
      { name: 'Defense', value: `${playerData.stats.defense}`, inline: true }
    );

  // Add equipped items
  let equippedText = 'None';
  if (playerData.equipped.weapon || playerData.equipped.armor) {
    equippedText = '';
    if (playerData.equipped.weapon) {
      equippedText += `Weapon: ${ITEMS[playerData.equipped.weapon].name} (+${ITEMS[playerData.equipped.weapon].power} ATK)\n`;
    }
    if (playerData.equipped.armor) {
      equippedText += `Armor: ${ITEMS[playerData.equipped.armor].name} (+${ITEMS[playerData.equipped.armor].defense} DEF)`;
    }
  }
  statsEmbed.addFields({ name: 'Equipped', value: equippedText, inline: false });

  // Add active buffs if any
  if (playerData.buffs) {
    let buffsText = '';

    for (const [buffType, buff] of Object.entries(playerData.buffs)) {
      if (Date.now() > buff.expiresAt) continue; // Skip expired buffs

      const timeLeft = Math.ceil((buff.expiresAt - Date.now()) / (60 * 1000)); // minutes
      buffsText += `${buffType.charAt(0).toUpperCase() + buffType.slice(1)}: +${buff.amount} (expires in ${timeLeft} minutes)\n`;
    }

    if (buffsText) {
      statsEmbed.addFields({ name: 'Active Buffs', value: buffsText, inline: false });
    }
  }

  // Add pet info if exists
  if (playerData.pet) {
    statsEmbed.addFields({ 
      name: 'Pet', 
      value: `${playerData.petStats.name} (${playerData.petStats.type})\n` +
             `Level: ${playerData.petStats.level}\n` +
             `Happiness: ${playerData.petStats.happiness}/100\n` +
             `Hunger: ${playerData.petStats.hunger}/100`,
      inline: false
    });
  }

  message.channel.send({ embeds: [statsEmbed] });
}

// Handle achievements command
async function handleAchievementsCommand(message, playerData) {
  const achievements = [
    { id: 'level10', name: 'Apprentice', description: 'Reach level 10', reward: '3x Health Potion' },
    { id: 'level25', name: 'Expert Adventurer', description: 'Reach level 25', reward: 'Mythril Sword' },
    { id: 'level50', name: 'Master of QuestForge', description: 'Reach level 50', reward: 'Legendary Key' },
    { id: 'crafter10', name: 'Novice Crafter', description: 'Craft 10 items', reward: '100 Gold' },
    { id: 'crafter50', name: 'Master Craftsman', description: 'Craft 50 items', reward: "Crafter's Gloves" },
    { id: 'collector', name: 'Collector', description: 'Collect at least 20 different items', reward: '250 Gold' },
    { id: 'wealthy', name: 'Wealthy', description: 'Accumulate 1000 gold', reward: 'Gold Ring' },
    { id: 'pet_master', name: 'Pet Master', description: 'Raise a pet to level 10', reward: 'Rare Pet Egg' }
  ];

  const achievementsEmbed = new EmbedBuilder()
    .setTitle(`${message.author.username}'s Achievements`)
    .setColor(CONFIG.embedColor)
    .setDescription('Track your accomplishments:');

  // Add achievements with completion status
  const achievementFields = achievements.map(achievement => {
    const unlocked = playerData.achievements.includes(achievement.id);
    return {
      name: `${unlocked ? '✅' : '❌'} ${achievement.name}`,
      value: `${achievement.description}\nReward: ${achievement.reward}`,
      inline: false
    };
  });

  achievementsEmbed.addFields(achievementFields);

  achievementsEmbed.setFooter({ text: `${playerData.achievements.length}/${achievements.length} achievements completed` });

  message.channel.send({ embeds: [achievementsEmbed] });
}

// Load data on startup
loadData();

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Export necessary functions and objects for other modules
module.exports = {
  CONFIG,
  gameData,
  getPlayerData,
  addItemToInventory,
  removeItemFromInventory,
  awardXP,
  saveData,
  addNotification,
  updatePlayerStats
};
=======
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
    )
    .addField('🐾 Pet System',
      '`!tame <creature>` - Try to tame a creature (Wolf, Bear, Eagle)\n' +
      '`!pet` - View your pet\'s status'
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
        // Level up pet if player has one
        const adventurePlayer = getPlayerData(message.author.id);
        if (adventurePlayer.pet && adventurePlayer.petStats) {
          const petXpGained = getRandomInt(5, 15);
          adventurePlayer.petStats.xp += petXpGained;
          
          // Level up pet if enough XP (100 XP per level)
          if (adventurePlayer.petStats.xp >= 100 * adventurePlayer.petStats.level) {
            adventurePlayer.petStats.xp = 0;
            adventurePlayer.petStats.level += 1;
            await message.channel.send(`🐾 Your pet gained ${petXpGained} XP and leveled up to level ${adventurePlayer.petStats.level}!`);
          } else {
            await message.channel.send(`🐾 Your pet gained ${petXpGained} XP!`);
          }
        }
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

      case 'tame':
        if (!args.length) {
          return message.reply('Please specify what creature you want to tame! Available creatures: Wolf, Bear, Eagle');
        }
        const creatureName = args[0].toLowerCase();
        const validCreatures = ['wolf', 'bear', 'eagle'];
        
        if (!validCreatures.includes(creatureName)) {
          return message.reply('That creature cannot be tamed! Available creatures: Wolf, Bear, Eagle');
        }
        
        // Get player data for taming
        const tamePlayerData = getPlayerData(message.author.id);
        if (tamePlayerData.pet) {
          return message.reply('You already have a pet! You can only have one pet at a time.');
        }
        
        const tameChance = Math.random();
        if (tameChance > 0.6) {
          tamePlayerData.pet = creatureName;
          tamePlayerData.petStats = {
            name: creatureName,
            type: creatureName,
            level: 1,
            xp: 0
          };
          return message.reply(`Success! You tamed a ${creatureName.charAt(0).toUpperCase() + creatureName.slice(1)}!`);
        } else {
          return message.reply('The creature ran away! Try taming another one.');
        }
        break;

      case 'pet':
        {
          const playerPetData = getPlayerData(message.author.id);
          if (!playerPetData.pet || !playerPetData.petStats) {
            return message.reply('You don\'t have a pet yet! Use !tame to get one.');
          }
          
          const petType = playerPetData.petStats.type || 'Unknown';
          const petLevel = playerPetData.petStats.level || 1;
          const petXP = playerPetData.petStats.xp || 0;
          
          const petEmbed = new MessageEmbed()
            .setTitle('Your Pet')
            .setColor(0x00AE86)
            .addFields([
              { name: 'Type', value: petType.charAt(0).toUpperCase() + petType.slice(1) },
              { name: 'Level', value: petLevel.toString() },
              { name: 'XP', value: petXP.toString() }
            ]);
          
          return message.reply({ embeds: [petEmbed] });
        }
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
