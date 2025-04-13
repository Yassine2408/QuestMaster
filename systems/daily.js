// Daily rewards system
const { MessageEmbed } = require('discord.js');

// Get a random item from the list with weights
function getRandomWeightedItem(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) return item;
  }
  
  return items[0]; // Fallback
}

// Handle daily reward command
async function handleDailyCommand(message, playerData, CONFIG) {
  const now = Date.now();
  
  // Check cooldown (24 hours)
  if (now < playerData.cooldowns.daily) {
    const remainingTime = Math.ceil((playerData.cooldowns.daily - now) / 1000);
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    return message.reply(`You've already claimed your daily reward! You can claim again in ${hours}h ${minutes}m.`);
  }
  
  // Set cooldown
  playerData.cooldowns.daily = now + CONFIG.dailyCooldown;
  
  // Determine streak
  playerData.dailyStreak = playerData.dailyStreak || 0;
  
  // Check if streak should be reset (more than 48 hours since last claim)
  if (now - (playerData.cooldowns.daily - CONFIG.dailyCooldown) > (48 * 60 * 60 * 1000)) {
    playerData.dailyStreak = 0;
  }
  
  // Increment streak
  playerData.dailyStreak++;
  
  // Calculate rewards based on streak
  const goldReward = 100 + (playerData.dailyStreak * 20);
  
  // Award gold
  playerData.gold += goldReward;
  
  // Possible item rewards based on streak level
  let possibleItems = [
    { id: 'health_potion', weight: 30 },
    { id: 'wood', count: 5, weight: 25 },
    { id: 'stone', count: 5, weight: 25 },
    { id: 'iron', count: 2, weight: 10 },
    { id: 'leather', count: 3, weight: 15 },
  ];
  
  // Better rewards for higher streaks
  if (playerData.dailyStreak >= 5) {
    possibleItems.push(
      { id: 'gold', count: 1, weight: 10 },
      { id: 'strength_potion', weight: 8 }
    );
  }
  
  if (playerData.dailyStreak >= 10) {
    possibleItems.push(
      { id: 'diamond', count: 1, weight: 5 },
      { id: 'pet_treat', weight: 8 }
    );
  }
  
  if (playerData.dailyStreak >= 30) {
    possibleItems.push(
      { id: 'pet_egg', weight: 2 },
      { id: 'legendary_key', weight: 1 }
    );
  }
  
  // Select a random item
  const itemReward = getRandomWeightedItem(possibleItems);
  const itemCount = itemReward.count || 1;
  
  // Get reference to item data
  const ITEMS = require('../data/items');
  
  // Check if the item exists
  if (!ITEMS[itemReward.id]) {
    console.error(`Error: Item ${itemReward.id} not found in items database`);
  } else {
    // Add item to inventory
    require('../index').addItemToInventory(playerData, itemReward.id, itemCount);
  }
  
  // Special milestone rewards
  let milestoneReward = null;
  
  if (playerData.dailyStreak === 7) {
    milestoneReward = {
      id: 'steel_sword',
      count: 1,
      message: "🎉 7-Day Streak Reward! You've received a Steel Sword!"
    };
    require('../index').addItemToInventory(playerData, milestoneReward.id, milestoneReward.count);
  } else if (playerData.dailyStreak === 30) {
    milestoneReward = {
      id: 'mythril_armor',
      count: 1,
      message: "🎉 30-Day Streak Reward! You've received Mythril Armor!"
    };
    require('../index').addItemToInventory(playerData, milestoneReward.id, milestoneReward.count);
  }
  
  // Create daily reward embed
  const dailyEmbed = new MessageEmbed()
    .setTitle('🎁 Daily Reward')
    .setColor(CONFIG.embedColor)
    .setDescription(`You've claimed your daily reward!`)
    .addField('Streak', `${playerData.dailyStreak} day${playerData.dailyStreak > 1 ? 's' : ''}`, true)
    .addField('Gold', `+${goldReward} ${CONFIG.currency}`, true);
  
  if (ITEMS[itemReward.id]) {
    dailyEmbed.addField('Item', `${itemCount}x ${ITEMS[itemReward.id].name}`, true);
  }
  
  if (milestoneReward) {
    dailyEmbed.addField('Milestone Reward', milestoneReward.message, false);
  }
  
  // Add info about next milestone
  if (playerData.dailyStreak < 7) {
    dailyEmbed.addField('Next Milestone', `7-day streak: Steel Sword (${7 - playerData.dailyStreak} days left)`, false);
  } else if (playerData.dailyStreak < 30) {
    dailyEmbed.addField('Next Milestone', `30-day streak: Mythril Armor (${30 - playerData.dailyStreak} days left)`, false);
  }
  
  // Show daily streak icon pattern
  let streakDisplay = '';
  for (let i = 1; i <= Math.min(playerData.dailyStreak, 30); i++) {
    if (i % 7 === 0) {
      streakDisplay += '🌟'; // Special icon for every 7th day
    } else {
      streakDisplay += '✅';
    }
    
    // Add space every 7 days for readability
    if (i % 7 === 0) streakDisplay += ' ';
  }
  
  if (streakDisplay) {
    dailyEmbed.addField('Streak Progress', streakDisplay, false);
  }
  
  message.channel.send({ embeds: [dailyEmbed] });
  
  // Add notification
  require('../index').addNotification(
    playerData, 
    `Daily Reward Claimed: +${goldReward} gold and ${itemCount}x ${ITEMS[itemReward.id]?.name || itemReward.id}`
  );
  
  // Save after daily reward
  require('../index').saveData();
  
  return true;
}

module.exports = {
  handleDailyCommand
};
