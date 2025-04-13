// Enhanced RPG Discord Bot
// A Discord bot implementing RPG game mechanics where users can farm resources,
// gain XP, level up, and trade items.

const fs = require('fs');
const http = require('http');
const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');

// Import system modules
const dailySystem = require('./systems/daily');
const questSystem = require('./systems/quests');
const petSystem = require('./systems/pets');
const combatSystem = require('./systems/combat');
const inventorySystem = require('./systems/inventory');

// Import utility modules
const helpers = require('./utils/helpers');
const embeds = require('./utils/embeds');

// Import data modules
const ITEMS = require('./data/items');
const LOCATIONS = require('./data/locations');
const QUESTS = require('./data/quests');
const PETS = require('./data/pets');

// Track when the bot was last active
let lastActive = Date.now();
function updateActivity() {
  lastActive = Date.now();
}

// Create a simple HTTP server for UptimeRobot pings
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  const timeSinceLastActive = Math.floor((Date.now() - lastActive) / 1000);
  res.end(`QuestForge Bot is alive! Last activity: ${timeSinceLastActive} seconds ago`);
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Web server running at http://0.0.0.0:${port}`);
  // Self-ping to keep alive
  setInterval(() => {
    http.get(`http://0.0.0.0:${port}/ping`, (res) => {
      console.log(`Keep-alive ping sent (${new Date().toISOString()})`);
    }).on('error', (err) => {
      console.error('Keep-alive ping failed:', err.message);
    });
  }, 4 * 60 * 1000); // Ping every 4 minutes
});

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
    "Guilds",
    "GuildMessages",
    "MessageContent"
  ]
});

// Bot configuration
const CONFIG = {
  prefix: '!', // Command prefix
  saveInterval: 5 * 60 * 1000, // Save data every 5 minutes
  dataFile: 'rpg_data.json', // File to store persistent data
  currency: '🪙', // Currency symbol
  botName: 'QuestForge', // Bot name
  embedColor: '#7289DA', // Default embed color
  farmCooldown: 60 * 1000, // Farming cooldown in milliseconds (1 minute)
  adventureCooldown: 5 * 60 * 1000, // Adventure cooldown (5 minutes)
  huntCooldown: 3 * 60 * 1000, // Hunting cooldown (3 minutes)
  mineCooldown: 2 * 60 * 1000, // Mining cooldown (2 minutes)
  fishCooldown: 2 * 60 * 1000, // Fishing cooldown (2 minutes)
  dailyCooldown: 24 * 60 * 60 * 1000, // Daily reward cooldown (24 hours)
  questCompletionExp: 100, // Base XP for completing a quest
  maxPetLevel: 30, // Maximum level for pets
};

// Export CONFIG directly to avoid circular dependencies
exports.CONFIG = CONFIG;

// In-memory database
let gameData = {
  players: {},
  partyInvites: {}, // Store party invites
  parties: {}, // Store active parties
  serverStats: {
    totalPlayers: 0,
    totalGoldEarned: 0,
    totalAdventures: 0,
    totalItemsCrafted: 0,
    totalMonstersDefeated: 0,
    totalQuestsCompleted: 0,
  }
};

// Shop items (subset of all items that can be purchased)
const SHOP_ITEMS = [
  'wooden_sword',
  'stone_sword',
  'iron_sword',
  'steel_sword',
  'leather_armor',
  'iron_armor',
  'health_potion',
  'strength_potion',
  'pet_food',
  'pet_toy',
  'pet_treat'
];

// Load data from file if exists
function loadData() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      const data = fs.readFileSync(CONFIG.dataFile, 'utf8');
      gameData = JSON.parse(data);
      console.log('Data loaded successfully!');

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
  }
}

// Import backup functionality
const { createBackup } = require('./backup');

// Save data to file
function saveData() {
  try {
    // Create a temporary file first to avoid corruption
    const tempFile = `${CONFIG.dataFile}.temp`;
    fs.writeFileSync(tempFile, JSON.stringify(gameData), 'utf8');
    
    // Rename temp file to actual file (atomic operation)
    fs.renameSync(tempFile, CONFIG.dataFile);
    
    console.log(`Data saved successfully! (${new Date().toISOString()})`);

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
function getPlayerData(userId, username = "Unknown") {
  if (!gameData.players[userId]) {
    gameData.players[userId] = {
      username: username,
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
        daily: 0,
        quest: 0
      },
      achievements: [],
      totalCrafted: 0,
      pet: null,
      petStats: {
        name: null,
        type: null,
        level: 1,
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
  
  return gameData.players[userId];
}

// Add item to player inventory
function addItemToInventory(playerData, itemId, quantity = 1) {
  if (!playerData.inventory[itemId]) {
    playerData.inventory[itemId] = 0;
  }
  playerData.inventory[itemId] += quantity;
  
  // Add a notification
  addNotification(playerData, `You received ${quantity}x ${ITEMS[itemId].name}`);
  
  return true;
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

// Award XP to player and handle level ups
function awardXP(playerData, xpAmount) {
  playerData.xp += xpAmount;

  // Check for level up
  let levelsGained = 0;
  let newLevel = playerData.level;

  while (playerData.xp >= helpers.getXpForLevel(newLevel)) {
    playerData.xp -= helpers.getXpForLevel(newLevel);
    newLevel++;
    levelsGained++;

    // Update stats on level up
    playerData.stats.strength += 2;
    playerData.stats.defense += 2;
    playerData.stats.maxHealth += 10;
    playerData.stats.currentHealth = playerData.stats.maxHealth; // Heal on level up

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
    }
  }

  if (levelsGained > 0) {
    playerData.level = newLevel;
    return levelsGained;
  }

  return 0;
}

// Format inventory for display
function formatInventory(inventory) {
  if (Object.keys(inventory).length === 0) {
    return "Your inventory is empty.";
  }

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
  
  return result;
}

// Format shop items for display
function formatShopItems() {
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
  }

  // Set cooldown
  playerData.cooldowns.farm = now + CONFIG.farmCooldown;

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
    // Display shop items
    const shopEmbed = new EmbedBuilder()
      .setTitle('🛒 Item Shop')
      .setColor(CONFIG.embedColor)
      .setDescription(`Welcome to the shop! You have ${playerData.gold} ${CONFIG.currency}\n\nUse \`!shop buy <item>\` to purchase an item.\nUse \`!shop sell <item> [quantity]\` to sell items.`)
      .addFields({ name: 'Available Items', value: formatShopItems() });
    
    return message.channel.send({ embeds: [shopEmbed] });
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
  const unequipEmbed = new MessageEmbed()
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
  const useEmbed = new MessageEmbed()
    .setTitle('🧪 Item Used')
    .setColor(CONFIG.embedColor)
    .setDescription(`You used ${item.name}!`)
    .addField('Effect', effectDescription);
  
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
    const locationsEmbed = new MessageEmbed()
      .setTitle('🗺️ Adventure Locations')
      .setColor(CONFIG.embedColor)
      .setDescription('Choose a location for your adventure:');
    
    ADVENTURE_LOCATIONS.forEach(location => {
      locationsEmbed.addField(
        `${location.name} (Level ${location.minLevel}+)`,
        `${location.description}\nPossible Rewards: ${location.rewards.items.map(item => ITEMS[item.id].name).join(', ')}`
      );
    });
    
    locationsEmbed.addField('Usage', 'Use `!adventure <location_name>` to embark on an adventure!');
    return message.channel.send({ embeds: [locationsEmbed] });
  }
  
  // Find specified location
  const locationName = args.join(' ').toLowerCase();
  const location = ADVENTURE_LOCATIONS.find(loc => 
    loc.name.toLowerCase() === locationName
  );
  
  if (!location) {
    return message.reply(`Location "${args.join(' ')}" not found. Use \`!adventure\` to see available locations.`);
  }
  
  // Check level requirement
  if (playerData.level < location.minLevel) {
    return message.reply(`You need to be at least level ${location.minLevel} to adventure in ${location.name}.`);
  }
  
  // Set cooldown
  playerData.cooldowns.adventure = now + CONFIG.adventureCooldown;
  
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
      const questEmbed = new MessageEmbed()
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
  const confirmRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('confirm_heal')
        .setLabel('Heal')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('cancel_heal')
        .setLabel('Cancel')
        .setStyle('DANGER')
    );
  
  const confirmEmbed = new MessageEmbed()
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
      
      const healEmbed = new MessageEmbed()
        .setTitle('❤️ Healed')
        .setColor(CONFIG.embedColor)
        .setDescription(`You have been fully healed for ${healCost} ${CONFIG.currency}!`)
        .addField('Current Health', `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, true)
        .addField('Remaining Gold', `${playerData.gold} ${CONFIG.currency}`, true);
      
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
    
    const partyEmbed = new MessageEmbed()
      .setTitle('🤝 Party Status')
      .setColor(CONFIG.embedColor)
      .setDescription(`Your party has ${party.members.length} members:`)
      .addField('Members', members.join('\n'))
      .addField('Leader', gameData.players[party.leader]?.username || 'Unknown')
      .setFooter({ text: `Party ID: ${partyId}` });
    
    return message.channel.send({ embeds: [partyEmbed] });
  }
  
  const action = args[0].toLowerCase();
  
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
  const leaderboardEmbed = new MessageEmbed()
    .setTitle(title)
    .setColor(CONFIG.embedColor)
    .setDescription('Top 10 players:');
  
  players.forEach((player, index) => {
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
    
    leaderboardEmbed.addField(
      `#${index + 1} ${playerData.username || 'Unknown'}`,
      value
    );
  });
  
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
