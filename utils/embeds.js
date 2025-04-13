// Embed creation utilities for RPG Discord bot
const { EmbedBuilder } = require('discord.js');
const helpers = require('./helpers');

// Define CONFIG directly to avoid circular dependency
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

// Create a profile embed for a player
function createProfileEmbed(user, playerData) {
    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Profile`)
        .setColor(CONFIG.embedColor)
        .setAuthor({ name: 'QuestForge RPG', iconURL: user.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));
    
    // Main character stats
    embed.addFields(
        { name: 'Level', value: `${playerData.level} (${playerData.xp}/${helpers.getXpForLevel(playerData.level)} XP)`, inline: true },
        { name: 'Gold', value: `${playerData.gold} ${CONFIG.currency}`, inline: true },
        { name: 'Health', value: `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true },
        { name: 'Strength', value: `${playerData.stats.strength}`, inline: true },
        { name: 'Defense', value: `${playerData.stats.defense}`, inline: true }
    );
    
    // Progress bar for XP
    const xpRequired = helpers.getXpForLevel(playerData.level);
    const xpProgress = helpers.getProgressBar(playerData.xp, xpRequired, 10);
    embed.addFields({ name: 'XP Progress', value: `${xpProgress} (${playerData.xp}/${xpRequired})`, inline: false });
    
    // Equipped items
    let equippedText = 'None';
    if (playerData.equipped.weapon || playerData.equipped.armor) {
        equippedText = '';
        if (playerData.equipped.weapon) {
            const weaponItem = require('../data/items')[playerData.equipped.weapon];
            equippedText += `Weapon: ${weaponItem.name} (+${weaponItem.power} ATK)\n`;
        }
        if (playerData.equipped.armor) {
            const armorItem = require('../data/items')[playerData.equipped.armor];
            equippedText += `Armor: ${armorItem.name} (+${armorItem.defense} DEF)`;
        }
    }
    embed.addFields({ name: 'Equipped Items', value: equippedText, inline: false });
    
    // Pet info if player has one
    if (playerData.pet) {
        const petText = `${playerData.petStats.name} (Level ${playerData.petStats.level})\n` +
                      `Type: ${playerData.petStats.type}\n` +
                      `Happiness: ${playerData.petStats.happiness}/100\n` +
                      `Hunger: ${playerData.petStats.hunger}/100`;
        embed.addFields({ name: 'Pet Companion', value: petText, inline: false });
    }
    
    // Show active buffs if any
    if (playerData.buffs) {
        let buffsText = '';
        const now = Date.now();
        
        for (const [buffType, buff] of Object.entries(playerData.buffs)) {
            if (now < buff.expiresAt) {
                const timeLeft = helpers.formatDuration(buff.expiresAt - now);
                buffsText += `${helpers.capitalizeFirst(buffType)}: +${buff.amount} (${timeLeft} remaining)\n`;
            }
        }
        
        if (buffsText) {
            embed.addFields({ name: 'Active Buffs', value: buffsText, inline: false });
        }
    }
    
    // Show quest count
    if (playerData.quests) {
        const activeQuestCount = playerData.quests.active.length;
        const completedQuestCount = playerData.quests.completed.length;
        embed.addFields({ name: 'Quests', value: `${activeQuestCount} Active, ${completedQuestCount} Completed`, inline: true });
    }
    
    // Show achievement count
    const achievementCount = playerData.achievements.length;
    embed.addFields({ name: 'Achievements', value: `${achievementCount} Unlocked`, inline: true });
    
    // Show membership duration
    if (playerData.joinedAt) {
        const joinedDate = new Date(playerData.joinedAt);
        const daysSinceJoined = Math.floor((Date.now() - playerData.joinedAt) / (1000 * 60 * 60 * 24));
        embed.addFields({ name: 'Player Since', value: `${joinedDate.toDateString()} (${daysSinceJoined} days)`, inline: false });
    }
    
    // Add cooldowns at the bottom
    const now = Date.now();
    let cooldownText = '';
    
    if (now < playerData.cooldowns.farm) {
        cooldownText += `Farm: ${helpers.formatCooldown(playerData.cooldowns.farm - now)}\n`;
    }
    
    if (now < playerData.cooldowns.mine) {
        cooldownText += `Mine: ${helpers.formatCooldown(playerData.cooldowns.mine - now)}\n`;
    }
    
    if (now < playerData.cooldowns.hunt) {
        cooldownText += `Hunt: ${helpers.formatCooldown(playerData.cooldowns.hunt - now)}\n`;
    }
    
    if (now < playerData.cooldowns.fish) {
        cooldownText += `Fish: ${helpers.formatCooldown(playerData.cooldowns.fish - now)}\n`;
    }
    
    if (now < playerData.cooldowns.adventure) {
        cooldownText += `Adventure: ${helpers.formatCooldown(playerData.cooldowns.adventure - now)}\n`;
    }
    
    if (now < playerData.cooldowns.daily) {
        cooldownText += `Daily: ${helpers.formatCooldown(playerData.cooldowns.daily - now)}\n`;
    }
    
    if (cooldownText) {
        embed.addFields({ name: 'Cooldowns', value: cooldownText, inline: false });
    }
    
    return embed;
}

// Create help embed
function createHelpEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('🔮 QuestForge RPG Help')
        .setColor(CONFIG.embedColor)
        .setDescription('Welcome to QuestForge! Here are the available commands:');
    
    // Basic commands section
    embed.addFields({
        name: '🧙 Basic Commands',
        value: '`!help` - Show this help message\n' +
              '`!profile` - View your character profile\n' +
              '`!inventory` or `!inv` - View your inventory\n' +
              '`!balance` or `!gold` - Check your gold balance\n' +
              '`!stats` - View detailed character stats\n' +
              '`!achievements` - View your achievements',
        inline: false
    });
    
    // Resource gathering section
    embed.addFields({
        name: '🌾 Resource Gathering',
        value: '`!farm` - Gather wood and herbs\n' +
              '`!mine` - Mine for stones and minerals\n' +
              '`!hunt` - Hunt for leather and fur\n' +
              '`!fish` - Fish for... fish!\n' +
              '`!daily` - Claim your daily reward',
        inline: false
    });
    
    // Adventure section
    embed.addFields({
        name: '⚔️ Adventure',
        value: '`!adventure` or `!adv` - List adventure locations\n' +
              '`!adventure <location>` - Go on an adventure\n' +
              '`!heal` - Heal your character (costs gold)',
        inline: false
    });
    
    // Economy section
    embed.addFields({
        name: '💰 Economy',
        value: '`!shop` - View the item shop\n' +
              '`!shop buy <item>` - Buy an item\n' +
              '`!shop sell <item> [quantity]` - Sell an item',
        inline: false
    });
    
    // Inventory & Equipment section
    embed.addFields({
        name: '📦 Inventory & Equipment',
        value: '`!inventory search <term>` - Search your inventory\n' +
              '`!inventory inspect <item>` - Inspect an item\n' +
              '`!equip <item>` - Equip a weapon or armor\n' +
              '`!unequip <weapon|armor>` - Unequip an item\n' +
              '`!use <item>` - Use a consumable item\n' +
              '`!craft` - View available crafting recipes\n' +
              '`!craft <item>` - Craft an item',
        inline: false
    });
    
    // Pet system section
    embed.addFields({
        name: '🐾 Pet System',
        value: '`!pet` - View your pet\'s status\n' +
              '`!pet adopt` - Adopt a pet (requires pet egg)\n' +
              '`!pet feed` - Feed your pet\n' +
              '`!pet play` - Play with your pet\n' +
              '`!pet rename` - Rename your pet',
        inline: false
    });
    
    // Quest system section
    embed.addFields({
        name: '📜 Quest System',
        value: '`!quest` - View your active quests\n' +
              '`!quest start` - Start a new quest\n' +
              '`!quest complete` - Complete a finished quest\n' +
              '`!quest completed` - View your completed quests',
        inline: false
    });
    
    // Party system section
    embed.addFields({
        name: '👥 Party System',
        value: '`!party` - View your party status\n' +
              '`!party invite @player` - Invite a player to your party\n' +
              '`!party accept @player` - Accept a party invitation\n' +
              '`!party leave` - Leave your current party',
        inline: false
    });
    
    // Other commands section
    embed.addFields({
        name: '🏆 Other Commands',
        value: '`!leaderboard` or `!lb` - View player rankings\n' +
              '`!notifications` or `!notifs` - View your notifications\n' +
              '`!leaderboard gold` - View richest players\n' +
              '`!leaderboard craft` - View top crafters',
        inline: false
    });
    
    return embed;
}

// Create leaderboard embed
function createLeaderboardEmbed(players, category, title) {
    const embed = new EmbedBuilder()
        .setTitle(`🏆 ${title}`)
        .setColor(CONFIG.embedColor)
        .setDescription(`Top ${players.length} players by ${category}:`);
    
    const fields = [];
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
            case 'adventure':
                value = `${playerData.adventureCount || 0} adventures completed`;
                break;
            case 'quest':
                value = `${playerData.quests?.completed.length || 0} quests completed`;
                break;
        }
        
        fields.push({
            name: `#${index + 1} ${playerData.username || 'Unknown'}`,
            value: value,
            inline: true
        });
    });
    
    embed.addFields(fields);
    return embed;
}

// Create shop embed
function createShopEmbed(playerGold) {
    const ITEMS = require('../data/items');
    // Define SHOP_ITEMS directly to avoid circular dependency
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
      'pet_treat',
      'pet_egg',
      'rare_pet_egg'
    ];
    
    const embed = new EmbedBuilder()
        .setTitle('🛒 Item Shop')
        .setColor(CONFIG.embedColor)
        .setDescription(`Welcome to the shop! You have ${playerGold} ${CONFIG.currency}\n\nUse \`!shop buy <item>\` to purchase an item.\nUse \`!shop sell <item> [quantity]\` to sell items.`);
    
    // Group items by category
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

    for (const [category, items] of Object.entries(categories)) {
        if (items.length > 0) {
            embed.addFields({
                name: `${helpers.capitalizeFirst(category)}s`,
                value: items.join('\n'),
                inline: false
            });
        }
    }
    
    return embed;
}

// Create quest embed
function createQuestEmbed(quest, progress) {
    const embed = new EmbedBuilder()
        .setTitle(`📜 Quest: ${quest.name}`)
        .setColor(CONFIG.embedColor)
        .setDescription(quest.description);
    
    // Add objective based on quest type
    let objectiveText = '';
    switch (quest.type) {
        case 'gather':
            objectiveText = `Gather ${quest.target}x ${quest.itemName || quest.itemType}`;
            break;
        case 'kill':
            objectiveText = `Defeat ${quest.target}x ${quest.enemyType || 'enemies'}`;
            break;
        case 'location':
            objectiveText = `Visit ${quest.location} ${quest.target} times`;
            break;
        case 'craft':
            objectiveText = `Craft ${quest.target}x ${quest.itemName || quest.itemType}`;
            break;
    }
    
    embed.addFields({ name: 'Objective', value: objectiveText, inline: false });
    
    // Add progress if available
    if (progress !== undefined) {
        const progressBar = helpers.getProgressBar(progress, quest.target, 10);
        embed.addFields({ name: 'Progress', value: `${progressBar} (${progress}/${quest.target})`, inline: false });
    }
    
    // Add rewards
    let rewardText = `${quest.reward.gold} ${CONFIG.currency}\n${quest.reward.xp} XP`;
    
    if (quest.reward.item) {
        const itemName = require('../data/items')[quest.reward.item]?.name || quest.reward.item;
        rewardText += `\n${quest.reward.itemQuantity || 1}x ${itemName}`;
    }
    
    embed.addFields({ name: 'Rewards', value: rewardText, inline: false });
    
    // Add difficulty indicator
    let difficulty = '';
    if (quest.minLevel <= 5) difficulty = 'Easy';
    else if (quest.minLevel <= 15) difficulty = 'Medium';
    else if (quest.minLevel <= 25) difficulty = 'Hard';
    else difficulty = 'Very Hard';
    
    embed.addFields(
        { name: 'Difficulty', value: difficulty, inline: true },
        { name: 'Required Level', value: quest.minLevel.toString(), inline: true }
    );
    
    return embed;
}

// Create pet status embed
function createPetStatusEmbed(playerData) {
    if (!playerData.pet) {
        return new EmbedBuilder()
            .setTitle('🐾 No Pet')
            .setColor(CONFIG.embedColor)
            .setDescription("You don't have a pet yet! Use `!pet adopt` to adopt one.");
    }
    
    const petData = require('../data/pets').find(pet => pet.type === playerData.pet);
    
    const embed = new EmbedBuilder()
        .setTitle(`🐾 ${playerData.petStats.name} (${petData?.name || playerData.pet})`)
        .setColor(CONFIG.embedColor)
        .setDescription(`Your level ${playerData.petStats.level} pet companion!`);
    
    // XP progress bar
    const petXpRequired = require('../systems/pets').getPetXpForLevel(playerData.petStats.level);
    const petXpProgress = helpers.getProgressBar(playerData.petStats.xp, petXpRequired, 10);
    
    embed.addFields({
        name: 'Level',
        value: `${playerData.petStats.level} (${playerData.petStats.xp}/${petXpRequired} XP)\n${petXpProgress}`,
        inline: false
    });
    
    // Happiness and hunger bars
    const happinessBar = helpers.getProgressBar(playerData.petStats.happiness, 100, 10);
    const hungerBar = helpers.getProgressBar(playerData.petStats.hunger, 100, 10);
    
    embed.addFields(
        { name: 'Happiness', value: `${happinessBar} (${playerData.petStats.happiness}/100)`, inline: true },
        { name: 'Hunger', value: `${hungerBar} (${playerData.petStats.hunger}/100)`, inline: true }
    );
    
    // Pet bonuses
    const petBonus = Math.floor(playerData.petStats.level / 2);
    embed.addFields({
        name: 'Bonuses',
        value: `+${petBonus} Strength\n+${petBonus} Defense\n+${petBonus * 5} Max Health`,
        inline: false
    });
    
    // Pet abilities
    if (petData && petData.abilities) {
        const unlockedAbilities = petData.abilities
            .filter(ability => ability.level <= playerData.petStats.level);
        
        const lockedAbilities = petData.abilities
            .filter(ability => ability.level > playerData.petStats.level);
        
        if (unlockedAbilities.length > 0) {
            embed.addFields({
                name: 'Abilities',
                value: unlockedAbilities.map(a => `${a.name}: ${a.description}`).join('\n'),
                inline: false
            });
        }
        
        if (lockedAbilities.length > 0) {
            embed.addFields({
                name: 'Locked Abilities',
                value: lockedAbilities.map(a => `${a.name} (Unlocks at Level ${a.level})`).join('\n'),
                inline: false
            });
        }
    }
    
    return embed;
}

// Create notification embed
function createNotificationEmbed(playerData) {
    const embed = new EmbedBuilder()
        .setTitle('📬 Your Notifications')
        .setColor(CONFIG.embedColor);
    
    if (!playerData.notifications || playerData.notifications.length === 0) {
        embed.setDescription('You have no notifications.');
        return embed;
    }
    
    const recentNotifications = playerData.notifications.slice(0, 10);
    let notificationText = '';
    
    recentNotifications.forEach((notification, index) => {
        const timeAgo = helpers.formatTimeAgo(notification.timestamp);
        notificationText += `**${index + 1}. ${timeAgo}**\n${notification.message}\n\n`;
    });
    
    embed.setDescription(notificationText);
    
    if (playerData.notifications.length > 10) {
        embed.setFooter({ text: `Showing 10 of ${playerData.notifications.length} notifications. Older notifications are automatically cleared after 7 days.` });
    }
    
    return embed;
}

module.exports = {
    createProfileEmbed,
    createHelpEmbed,
    createLeaderboardEmbed,
    createShopEmbed,
    createQuestEmbed,
    createPetStatusEmbed,
    createNotificationEmbed
};