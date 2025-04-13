
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CLASSES } = require('../data/classes');

async function handlePvPChallenge(message, playerData, targetUser) {
    const targetData = require('../index').getPlayerData(targetUser.id);
    
    if (!playerData.class || !targetData.class) {
        return message.reply('Both players must have chosen a class to engage in PvP!');
    }

    // Create challenge embed
    const challengeEmbed = new EmbedBuilder()
        .setTitle('⚔️ PvP Challenge')
        .setColor(require('../index').CONFIG.embedColor)
        .setDescription(`${message.author} has challenged ${targetUser} to a duel!\nDo you accept?`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('pvp_accept')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('pvp_decline')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
        );

    const challengeMsg = await message.channel.send({
        embeds: [challengeEmbed],
        components: [row]
    });

    try {
        const response = await challengeMsg.awaitMessageComponent({
            filter: i => i.user.id === targetUser.id,
            time: 30000
        });

        if (response.customId === 'pvp_accept') {
            await response.deferUpdate();
            return startPvPCombat(message, playerData, targetData);
        } else {
            await challengeMsg.edit({
                content: 'Challenge declined!',
                embeds: [],
                components: []
            });
        }
    } catch (error) {
        await challengeMsg.edit({
            content: 'Challenge timed out!',
            embeds: [],
            components: []
        });
    }
}

async function startPvPCombat(message, player1Data, player2Data) {
    const combatState = {
        turn: 1,
        player1: {
            id: player1Data.userId,
            health: player1Data.stats.maxHealth,
            maxHealth: player1Data.stats.maxHealth,
            strength: player1Data.stats.strength,
            defense: player1Data.stats.defense,
            class: CLASSES[player1Data.class],
            abilities: player1Data.abilities || {},
            cooldowns: {}
        },
        player2: {
            id: player2Data.userId,
            health: player2Data.stats.maxHealth,
            maxHealth: player2Data.stats.maxHealth,
            strength: player2Data.stats.strength,
            defense: player2Data.stats.defense,
            class: CLASSES[player2Data.class],
            abilities: player2Data.abilities || {},
            cooldowns: {}
        },
        currentTurn: player1Data.userId
    };

    while (combatState.player1.health > 0 && combatState.player2.health > 0) {
        const currentPlayer = combatState.currentTurn === player1Data.userId ? combatState.player1 : combatState.player2;
        const opponent = combatState.currentTurn === player1Data.userId ? combatState.player2 : combatState.player1;

        const embed = createPvPEmbed(combatState);
        const actionRow = createActionRow(currentPlayer);

        const turnMsg = await message.channel.send({
            content: `<@${currentPlayer.id}>'s turn!`,
            embeds: [embed],
            components: [actionRow]
        });

        try {
            const response = await turnMsg.awaitMessageComponent({
                filter: i => i.user.id === currentPlayer.id,
                time: 30000
            });

            await response.deferUpdate();

            if (response.customId.startsWith('ability_')) {
                const abilityId = response.customId.split('_')[1];
                await handleAbilityUse(message, combatState, currentPlayer, opponent, abilityId);
            } else {
                // Basic attack
                const damage = Math.max(1, Math.floor(currentPlayer.strength * (1 - opponent.defense / 100)));
                opponent.health -= damage;
                await message.channel.send(`${response.user} deals ${damage} damage!`);
            }

            // Switch turns
            combatState.currentTurn = opponent.id;
            combatState.turn++;

        } catch (error) {
            // Timeout - skip turn
            await message.channel.send(`<@${currentPlayer.id}> took too long! Turn skipped.`);
            combatState.currentTurn = opponent.id;
        }
    }

    // Announce winner
    const winner = combatState.player1.health > 0 ? player1Data : player2Data;
    const winnerEmbed = new EmbedBuilder()
        .setTitle('🏆 PvP Victory!')
        .setColor('#FFD700')
        .setDescription(`<@${winner.userId}> has won the duel!`);
    
    await message.channel.send({ embeds: [winnerEmbed] });
}

function createPvPEmbed(state) {
    return new EmbedBuilder()
        .setTitle(`⚔️ PvP Combat - Turn ${state.turn}`)
        .setColor(require('../index').CONFIG.embedColor)
        .addFields(
            {
                name: `Player 1 - ${state.player1.class.name}`,
                value: `Health: ${state.player1.health}/${state.player1.maxHealth}\nStrength: ${state.player1.strength}\nDefense: ${state.player1.defense}`,
                inline: true
            },
            {
                name: `Player 2 - ${state.player2.class.name}`,
                value: `Health: ${state.player2.health}/${state.player2.maxHealth}\nStrength: ${state.player2.strength}\nDefense: ${state.player2.defense}`,
                inline: true
            }
        );
}

function createActionRow(player) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('attack')
                .setLabel('Basic Attack')
                .setStyle(ButtonStyle.Primary)
        );

    // Add class abilities that are off cooldown
    for (const [abilityId, ability] of Object.entries(player.abilities)) {
        if (!player.cooldowns[abilityId]) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ability_${abilityId}`)
                    .setLabel(ability.name)
                    .setStyle(ButtonStyle.Secondary)
            );
        }
    }

    return row;
}

async function handleAbilityUse(message, state, user, target, abilityId) {
    const ability = user.abilities[abilityId];
    
    switch (abilityId) {
        case 'battleCry':
            user.strength *= 1.2;
            await message.channel.send(`${user.class.name} uses Battle Cry! Strength increased by 20%!`);
            break;
        case 'shieldWall':
            user.defense *= 1.5;
            await message.channel.send(`${user.class.name} uses Shield Wall! Defense increased by 50%!`);
            break;
        case 'preciseShot':
            const critDamage = Math.floor(user.strength * 1.5);
            target.health -= critDamage;
            await message.channel.send(`${user.class.name} uses Precise Shot for ${critDamage} critical damage!`);
            break;
        case 'arcaneBlast':
            const magicDamage = Math.floor(user.strength * 2);
            target.health -= magicDamage;
            await message.channel.send(`${user.class.name} uses Arcane Blast for ${magicDamage} magic damage!`);
            break;
    }

    // Set cooldown
    user.cooldowns[abilityId] = ability.cooldown;
}

module.exports = {
    handlePvPChallenge
};
