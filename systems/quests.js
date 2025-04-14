// Quest system for RPG Discord bot
const { MessageEmbed, MessageActionRow, MessageButton, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const QUESTS = require('../data/quests');

// Get a list of available quests for player
function getAvailableQuests(playerData) {
  return QUESTS.filter(quest => {
    // Check if already completed
    if (playerData.quests.completed.includes(quest.id)) {
      return false;
    }

    // Check if already active
    if (playerData.quests.active.some(q => q.id === quest.id)) {
      return false;
    }

    // Check level requirement
    if (playerData.level < quest.minLevel) {
      return false;
    }

    // Check prerequisites
    if (quest.prerequisites && quest.prerequisites.length > 0) {
      if (!quest.prerequisites.every(prereq => playerData.quests.completed.includes(prereq))) {
        return false;
      }
    }

    return true;
  });
}

// Handle quest command
async function handleQuestCommand(message, playerData, args, CONFIG) {
  if (!args.length || args[0] === 'list') {
    // Display active quests
    if (playerData.quests.active.length === 0) {
      return message.reply("You don't have any active quests. Use `!quest start` to see available quests.");
    }

    const questsEmbed = new MessageEmbed()
      .setTitle('📜 Your Active Quests')
      .setColor(CONFIG.embedColor)
      .setDescription('Here are your current quests:');

    playerData.quests.active.forEach(quest => {
      let progress = '';

      // Format progress based on quest type
      if (quest.type === 'gather') {
        progress = `Progress: ${quest.current}/${quest.target} ${QUESTS.find(q => q.id === quest.id)?.itemName || quest.itemType}`;
      } else if (quest.type === 'kill') {
        progress = `Progress: ${quest.current}/${quest.target} enemies defeated`;
      } else if (quest.type === 'location') {
        progress = `Progress: ${quest.current}/${quest.target} visits to ${quest.location}`;
      } else if (quest.type === 'craft') {
        progress = `Progress: ${quest.current}/${quest.target} items crafted`;
      }

      questsEmbed.addField(
        quest.name, 
        `${quest.description}\n${progress}\n` +
        `Rewards: ${quest.reward.gold} gold, ${quest.reward.xp} XP${quest.reward.item ? `, ${quest.reward.itemQuantity || 1}x ${quest.reward.itemName}` : ''}`
      );
    });

    return message.channel.send({ embeds: [questsEmbed] });
  } else if (args[0] === 'start') {
    // Check cooldown
    const now = Date.now();
    if (now < playerData.cooldowns.quest) {
      const remainingTime = Math.ceil((playerData.cooldowns.quest - now) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      return message.reply(`You need to wait ${minutes}m ${seconds}s before taking on a new quest.`);
    }

    // Check if player already has max quests
    if (playerData.quests.active.length >= 3) {
      return message.reply("You already have 3 active quests. Complete some of them or use `!quest abandon <quest_number>` to abandon one.");
    }

    // Get available quests
    const availableQuests = getAvailableQuests(playerData);

    if (availableQuests.length === 0) {
      return message.reply("There are no quests available for you right now. Complete your active quests or level up to unlock more.");
    }

    // Display available quests with buttons to accept
    const questsEmbed = new MessageEmbed()
      .setTitle('📜 Available Quests')
      .setColor(CONFIG.embedColor)
      .setDescription('Select a quest to start:');

    // Only show up to 3 quests at a time
    const displayQuests = availableQuests.slice(0, 3);

    displayQuests.forEach((quest, index) => {
      questsEmbed.addField(
        `${index + 1}. ${quest.name} (Level ${quest.minLevel}+)`, 
        `${quest.description}\n` +
        `Rewards: ${quest.reward.gold} gold, ${quest.reward.xp} XP${quest.reward.item ? `, ${quest.reward.itemQuantity || 1}x ${quest.reward.itemName}` : ''}`
      );
    });

    // Create buttons for quest selection
    const row = new MessageActionRow()
      .addComponents(
        displayQuests.map((_, index) => 
          new MessageButton()
            .setCustomId(`quest_accept_${index}`)
            .setLabel(`Accept Quest ${index + 1}`)
            .setStyle('PRIMARY')
        )
      );

    const questMsg = await message.channel.send({ 
      embeds: [questsEmbed],
      components: [row]
    });

    // Create collector for button interactions
    const filter = i => {
      return i.customId.startsWith('quest_accept_') && i.user.id === message.author.id;
    };

    const collector = questMsg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      const index = parseInt(i.customId.replace('quest_accept_', ''));
      const selectedQuest = displayQuests[index];

      // Add quest to active quests
      const questInstance = {
        id: selectedQuest.id,
        name: selectedQuest.name,
        description: selectedQuest.description,
        type: selectedQuest.type,
        target: selectedQuest.target,
        current: 0,
        started: Date.now(),
        reward: selectedQuest.reward
      };

      // Add specific quest details based on type
      if (selectedQuest.type === 'gather') {
        questInstance.itemType = selectedQuest.itemType;
      } else if (selectedQuest.type === 'location') {
        questInstance.location = selectedQuest.location;
      } else if (selectedQuest.type === 'kill') {
        questInstance.enemyType = selectedQuest.enemyType;
      } else if (selectedQuest.type === 'craft') {
        questInstance.itemType = selectedQuest.itemType;
      }

      playerData.quests.active.push(questInstance);

      // Set cooldown (10 minutes)
      playerData.cooldowns.quest = now + (10 * 60 * 1000);

      // Save game data
      require('../index').saveData();

      // Update message with success info
      const acceptEmbed = new MessageEmbed()
        .setTitle('📜 Quest Accepted')
        .setColor(CONFIG.embedColor)
        .setDescription(`You've accepted the quest "${selectedQuest.name}"!`)
        .addField('Objective', selectedQuest.description)
        .setFooter({ text: 'Use !quest to see your active quests and their progress' });

      await questMsg.edit({ 
        embeds: [acceptEmbed],
        components: [] 
      });

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        questMsg.edit({ 
          content: 'Quest selection timed out.',
          embeds: [],
          components: [] 
        });
      }
    });

    return;
  } else if (args[0] === 'complete') {
    // Check if player has any completed quests
    const completedQuests = playerData.quests.active.filter(quest => 
      quest.current >= quest.target
    );

    if (completedQuests.length === 0) {
      return message.reply("You don't have any completed quests. Use `!quest` to see your current quest progress.");
    }

    // Create an embed for each completed quest
    for (const quest of completedQuests) {
      // Get the full quest data
      const questData = QUESTS.find(q => q.id === quest.id);

      // Remove from active quests
      playerData.quests.active = playerData.quests.active.filter(q => q.id !== quest.id);

      // Add to completed quests if not already there
      if (!playerData.quests.completed.includes(quest.id)) {
        playerData.quests.completed.push(quest.id);
      }

      // Award rewards
      playerData.gold += quest.reward.gold;

      // Award XP
      const xpReward = quest.reward.xp || CONFIG.questCompletionExp;
      const levelUps = require('../index').awardXP(playerData, xpReward);

      // Award item reward if any
      let itemAwarded = false;
      if (quest.reward.item) {
        require('../index').addItemToInventory(playerData, quest.reward.item, quest.reward.itemQuantity || 1);
        itemAwarded = true;
      }

      // Create reward embed
      const rewardEmbed = new MessageEmbed()
        .setTitle('📜 Quest Completed!')
        .setColor(CONFIG.embedColor)
        .setDescription(`You've completed the quest "${quest.name}"!`)
        .addField('Rewards', 
          `${quest.reward.gold} ${CONFIG.currency}\n` +
          `${xpReward} XP${levelUps > 0 ? ` (Level up to ${playerData.level}!)` : ''}\n` +
          (itemAwarded ? `${quest.reward.itemQuantity || 1}x ${quest.reward.itemName}` : '')
        );

      // Add notification
      require('../index').addNotification(
        playerData, 
        `Completed Quest "${quest.name}" and received ${quest.reward.gold} gold and ${xpReward} XP`
      );

      // Update stats
      require('../index').gameData.serverStats.totalQuestsCompleted++;

      await message.channel.send({ embeds: [rewardEmbed] });
    }

    // Save after completing quests
    require('../index').saveData();
    return;
  } else if (args[0] === 'abandon') {
    // Check if quest number is provided
    if (!args[1] || isNaN(parseInt(args[1]))) {
      return message.reply("Please specify the quest number to abandon. Use `!quest` to see your active quests and their numbers.");
    }

    const questIndex = parseInt(args[1]) - 1;

    // Check if quest index is valid
    if (questIndex < 0 || questIndex >= playerData.quests.active.length) {
      return message.reply("Invalid quest number. Use `!quest` to see your active quests and their numbers.");
    }

    const questToAbandon = playerData.quests.active[questIndex];

    // Create confirmation message
    const confirmEmbed = new MessageEmbed()
      .setTitle('⚠️ Abandon Quest?')
      .setColor('RED')
      .setDescription(`Are you sure you want to abandon the quest "${questToAbandon.name}"?\nYou will lose all progress on this quest.`);

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('confirm_abandon')
          .setLabel('Abandon Quest')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId('cancel_abandon')
          .setLabel('Keep Quest')
          .setStyle('SECONDARY')
      );

    const confirmMsg = await message.channel.send({ 
      embeds: [confirmEmbed],
      components: [row]
    });

    // Create collector for button interactions
    const filter = i => {
      return ['confirm_abandon', 'cancel_abandon'].includes(i.customId) && i.user.id === message.author.id;
    };

    const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      if (i.customId === 'confirm_abandon') {
        // Remove quest from active quests
        playerData.quests.active.splice(questIndex, 1);

        // Save game data
        require('../index').saveData();

        await confirmMsg.edit({ 
          content: `You have abandoned the quest "${questToAbandon.name}".`,
          embeds: [],
          components: [] 
        });
      } else {
        await confirmMsg.edit({ 
          content: `You decided to keep the quest "${questToAbandon.name}".`,
          embeds: [],
          components: [] 
        });
      }

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        confirmMsg.edit({ 
          content: 'Quest abandonment cancelled due to timeout.',
          embeds: [],
          components: [] 
        });
      }
    });

    return;
  } else if (args[0] === 'completed') {
    // Show completed quests
    if (playerData.quests.completed.length === 0) {
      return message.reply("You haven't completed any quests yet.");
    }

    const completedEmbed = new MessageEmbed()
      .setTitle('📚 Your Quest Journal')
      .setColor(CONFIG.embedColor)
      .setDescription(`You have completed ${playerData.quests.completed.length} quests.`);

    // Group quests by category
    const categories = {};

    for (const questId of playerData.quests.completed) {
      const questData = QUESTS.find(q => q.id === questId);
      if (!questData) continue;

      const category = questData.category || 'Miscellaneous';
      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(questData.name);
    }

    // Add each category to the embed
    for (const [category, quests] of Object.entries(categories)) {
      completedEmbed.addField(
        category,
        quests.join('\n')
      );
    }

    return message.channel.send({ embeds: [completedEmbed] });
  } else {
    return message.reply("Invalid quest command. Available commands: `!quest`, `!quest start`, `!quest complete`, `!quest abandon <number>`, `!quest completed`");
  }
}

// Update quest progress for gathering activities
function updateGatheringQuestProgress(activeQuests, gatheredItems, activity) {
  const updatedQuests = [];

  activeQuests.forEach(quest => {
    // Only check gather type quests
    if (quest.type !== 'gather') return;

    // Check if the quest applies to the current activity
    const fullQuest = QUESTS.find(q => q.id === quest.id);
    if (fullQuest && fullQuest.activity && fullQuest.activity !== activity) return;

    // Check if gathered items include the quest item
    if (gatheredItems[quest.itemType] && quest.current < quest.target) {
      const amountGathered = gatheredItems[quest.itemType];
      quest.current = Math.min(quest.target, quest.current + amountGathered);

      updatedQuests.push(quest);
    }
  });

  return updatedQuests;
}

// Update quest progress for adventure activities
function updateAdventureQuestProgress(activeQuests, locationName, defeatedEnemies) {
  const updatedQuests = [];

  activeQuests.forEach(quest => {
    if (quest.type === 'location' && quest.location.toLowerCase() === locationName.toLowerCase() && quest.current < quest.target) {
      // Increment location visit
      quest.current = Math.min(quest.target, quest.current + 1);
      updatedQuests.push(quest);
    } else if (quest.type === 'kill' && quest.current < quest.target) {
      // If the quest specifies an enemy type, check if any defeated enemies match
      if (quest.enemyType) {
        const matchingEnemies = defeatedEnemies.filter(e => 
          e.toLowerCase().includes(quest.enemyType.toLowerCase())
        ).length;

        if (matchingEnemies > 0) {
          quest.current = Math.min(quest.target, quest.current + matchingEnemies);
          updatedQuests.push(quest);
        }
      } else {
        // Generic kill quest, counts any enemy
        quest.current = Math.min(quest.target, quest.current + defeatedEnemies.length);
        updatedQuests.push(quest);
      }
    }
  });

  return updatedQuests;
}

// Update quest progress for crafting activities
function updateCraftingQuestProgress(activeQuests, craftedItem, quantity = 1) {
  const updatedQuests = [];

  activeQuests.forEach(quest => {
    if (quest.type === 'craft' && quest.current < quest.target) {
      // Check if the quest specifies an item type
      if (quest.itemType && craftedItem !== quest.itemType) return;

      quest.current = Math.min(quest.target, quest.current + quantity);
      updatedQuests.push(quest);
    }
  });

  return updatedQuests;
}

// Handle notifications command
async function handleNotificationsCommand(message, playerData) {
  if (!playerData.notifications || playerData.notifications.length === 0) {
    return message.reply('You have no notifications.');
  }

  const notificationsEmbed = new MessageEmbed()
    .setTitle('📬 Your Notifications')
    .setColor(CONFIG.embedColor)
    .setDescription('Click the buttons below to delete notifications:');

  const recentNotifications = playerData.notifications.slice(-10).reverse();
  const fields = recentNotifications.map((notification, index) => {
    const timeAgo = helpers.formatTimeAgo(notification.timestamp);
    return {
      name: `#${index + 1} (${timeAgo})`,
      value: notification.message
    };
  });

  notificationsEmbed.addFields(fields);

  // Create delete buttons
  const rows = [];
  for (let i = 0; i < recentNotifications.length; i += 5) {
    const row = new MessageActionRow();
    const chunk = recentNotifications.slice(i, i + 5);

    chunk.forEach((_, index) => {
      row.addComponents(
        new MessageButton()
          .setCustomId(`delete_notif_${i + index}`)
          .setLabel(`Delete #${i + index + 1}`)
          .setStyle('DANGER')
      );
    });
    rows.push(row);
  }

  // Add Delete All button
  const deleteAllRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('delete_all_notifs')
        .setLabel('Delete All')
        .setStyle('DANGER')
    );
  rows.push(deleteAllRow);

  const msg = await message.channel.send({
    embeds: [notificationsEmbed],
    components: rows
  });

  // Create collector for button interactions
  const collector = msg.createMessageComponentCollector({
    time: 60000 // 1 minute timeout
  });

  collector.on('collect', async i => {
    if (i.user.id !== message.author.id) {
      return i.reply({ content: 'These buttons are not for you!', ephemeral: true });
    }

    if (i.customId === 'delete_all_notifs') {
      playerData.notifications = [];
      await i.update({
        content: 'All notifications deleted!',
        embeds: [],
        components: []
      });
    } else {
      const index = parseInt(i.customId.split('_')[2]);
      const notifIndex = playerData.notifications.length - 10 + index;
      if (notifIndex >= 0 && notifIndex < playerData.notifications.length) {
        playerData.notifications.splice(notifIndex, 1);

        // If no notifications left
        if (playerData.notifications.length === 0) {
          await i.update({
            content: 'All notifications deleted!',
            embeds: [],
            components: []
          });
        } else {
          // Update the embed with remaining notifications
          const updatedNotifications = playerData.notifications.slice(-10).reverse();
          const updatedFields = updatedNotifications.map((notification, idx) => {
            const timeAgo = helpers.formatTimeAgo(notification.timestamp);
            return {
              name: `#${idx + 1} (${timeAgo})`,
              value: notification.message
            };
          });

          notificationsEmbed.setFields(updatedFields);

          // Update buttons
          const updatedRows = [];
          for (let i = 0; i < updatedNotifications.length; i += 5) {
            const row = new MessageActionRow();
            const chunk = updatedNotifications.slice(i, i + 5);

            chunk.forEach((_, index) => {
              row.addComponents(
                new MessageButton()
                  .setCustomId(`delete_notif_${i + index}`)
                  .setLabel(`Delete #${i + index + 1}`)
                  .setStyle('DANGER')
              );
            });
            updatedRows.push(row);
          }
          updatedRows.push(deleteAllRow);

          await i.update({
            embeds: [notificationsEmbed],
            components: updatedRows
          });
        }
      }
    }

    // Save after deleting notifications
    require('../index').saveData();
  });

  collector.on('end', () => {
    msg.edit({ components: [] });
  });

  // Mark remaining notifications as read
  playerData.notifications.forEach(notification => {
    notification.read = true;
  });

  // Save after reading notifications
  require('../index').saveData();
}

module.exports = {
  handleQuestCommand,
  updateGatheringQuestProgress,
  updateAdventureQuestProgress,
  updateCraftingQuestProgress,
  handleNotificationsCommand
};