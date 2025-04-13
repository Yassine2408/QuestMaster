
// Class management system for RPG Discord bot
const { EmbedBuilder } = require('discord.js');
const { CLASSES } = require('../data/classes');

async function handleClassCommand(message, playerData, args) {
  if (!args.length) {
    return showClassInfo(message);
  }

  const action = args[0].toLowerCase();
  
  if (action === 'select' && args[1]) {
    return selectClass(message, playerData, args[1].toLowerCase());
  }
  
  message.reply('Invalid class command. Use `!class` to view classes or `!class select <classname>` to choose a class.');
}

function showClassInfo(message) {
  const classEmbed = new EmbedBuilder()
    .setTitle('⚔️ Available Classes')
    .setColor(require('../index').CONFIG.embedColor)
    .setDescription('Choose your path wisely, adventurer!');

  for (const [classId, classData] of Object.entries(CLASSES)) {
    classEmbed.addFields({
      name: classData.name,
      value: `${classData.description}\n\n**Lore:** ${classData.lore}\n\n**Advantages:**\n${classData.advantages.map(a => `• ${a}`).join('\n')}\n\n**Disadvantages:**\n${classData.disadvantages.map(d => `• ${d}`).join('\n')}`,
      inline: false
    });
  }

  classEmbed.setFooter({ text: 'Use !class select <classname> to choose your class' });
  
  return message.channel.send({ embeds: [classEmbed] });
}

function selectClass(message, playerData, className) {
  if (playerData.class) {
    return message.reply('You have already chosen a class. This choice is permanent!');
  }

  if (!CLASSES[className]) {
    return message.reply('Invalid class name. Use `!class` to see available classes.');
  }

  const selectedClass = CLASSES[className];
  
  // Apply class stats and abilities
  playerData.class = className;
  playerData.stats = {
    ...playerData.stats,
    ...selectedClass.baseStats
  };
  
  // Initialize abilities
  playerData.abilities = {};
  Object.entries(selectedClass.abilities).forEach(([abilityId, ability]) => {
    if (playerData.level >= ability.unlockLevel) {
      playerData.abilities[abilityId] = {
        ...ability,
        lastUsed: 0
      };
    }
  });

  // Send confirmation
  const confirmEmbed = new EmbedBuilder()
    .setTitle(`Class Selected: ${selectedClass.name}`)
    .setColor(require('../index').CONFIG.embedColor)
    .setDescription(`You have chosen the path of the ${selectedClass.name}!\n\n${selectedClass.lore}`)
    .addFields(
      { name: 'Starting Abilities', value: Object.values(selectedClass.abilities).filter(a => a.unlockLevel <= playerData.level).map(a => `${a.name}: ${a.description}`).join('\n') || 'None yet' }
    );

  message.channel.send({ embeds: [confirmEmbed] });
  
  // Add notification
  require('../index').addNotification(
    playerData,
    `You have chosen the ${selectedClass.name} class! New abilities will unlock as you level up.`
  );

  return true;
}

module.exports = {
  handleClassCommand
};
