const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class BotError extends Error {
    constructor(message, type = 'general') {
        super(message);
        this.type = type;
        this.name = 'BotError';
    }
}

function createErrorEmbed(error) {
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription(error.message)
        .setTimestamp();

    if (error.type === 'cooldown') {
        embed.addFields({ name: 'Cooldown', value: `Please wait ${Math.ceil(error.cooldown / 60)} minutes before trying again.` });
    }

    return embed;
}

function handleError(error, message) {
    console.error(`[ERROR] ${error.message}`);
    
    if (message) {
        const embed = createErrorEmbed(error);
        message.reply({ embeds: [embed] }).catch(console.error);
    }
}

module.exports = {
    BotError,
    handleError
}; 