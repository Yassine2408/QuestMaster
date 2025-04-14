// Combat system for RPG Discord bot
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const helpers = require('../utils/helpers');

// Run an adventure (combat encounter)
async function runAdventure(message, playerData, location) {
    // Initialize results object
    const results = {
        success: false,
        defeatedEnemies: [],
        loot: [],
        experience: 0,
        gold: 0
    };

    // Create adventure embed
    const adventureEmbed = new EmbedBuilder()
        .setTitle(`🗺️ Adventure: ${location.name}`)
        .setColor(require('../index').CONFIG.embedColor)
        .setDescription(`You venture into ${location.name}...\n\n${location.description}`);

    const adventureMsg = await message.channel.send({ embeds: [adventureEmbed] });

    // Short delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine if enemies are encountered (90% chance)
    if (Math.random() < 0.9) {
        // Select 1-3 random enemies from the location
        const enemyCount = helpers.getRandomInt(1, Math.min(3, location.enemies.length));
        const enemies = [];

        // Prevent duplicate enemies unless the location has very few enemy types
        const availableEnemies = [...location.enemies];

        for (let i = 0; i < enemyCount; i++) {
            if (availableEnemies.length === 0) break;

            const randomIndex = helpers.getRandomInt(0, availableEnemies.length - 1);
            const selectedEnemy = { ...availableEnemies[randomIndex] }; // Clone to avoid reference issues

            // Add unique ID for this encounter
            selectedEnemy.id = `enemy_${i}`;

            // Randomize HP slightly (±10%)
            const hpVariance = selectedEnemy.hp * 0.1;
            selectedEnemy.hp = Math.floor(selectedEnemy.hp - hpVariance + (Math.random() * hpVariance * 2));

            // Add to encounter enemies
            enemies.push(selectedEnemy);

            // Remove from available pool for variety
            if (availableEnemies.length > 1) {
                availableEnemies.splice(randomIndex, 1);
            }
        }

        // Run combat
        const combatResult = await runCombat(message, playerData, enemies, adventureMsg);

        // Process combat results
        if (combatResult.fled) {
            // Player fled
            const fledEmbed = new EmbedBuilder()
                .setTitle('🏃 Escaped!')
                .setColor('#FFFF00') // Yellow
                .setDescription(`You escaped from ${location.name} with your life, but no rewards.`)
                .addFields(
                    { name: 'Health Remaining', value: `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true }
                );

            await adventureMsg.edit({ embeds: [fledEmbed] });
            return { success: false, fled: true };
        } else if (combatResult.defeated) {
            // Player was defeated
            const defeatEmbed = new EmbedBuilder()
                .setTitle('❌ Defeated')
                .setColor('#FF0000') // Red
                .setDescription(`You were defeated in ${location.name}! You'll need to recover before adventuring again.`)
                .addFields(
                    { name: 'Lost', value: 'A small amount of gold', inline: true }
                );

            // Lose some gold (10-20% of current gold)
            const goldLost = Math.floor(playerData.gold * (0.1 + Math.random() * 0.1));
            if (goldLost > 0) {
                playerData.gold = Math.max(0, playerData.gold - goldLost);
                defeatEmbed.addFields(
                    { name: 'Gold Lost', value: `${goldLost} ${require('../index').CONFIG.currency}`, inline: true }
                );
            }

            // Heal to 25% health
            playerData.stats.currentHealth = Math.floor(playerData.stats.maxHealth * 0.25);
            defeatEmbed.addFields(
                { name: 'Health', value: `Recovered to ${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true }
            );

            await adventureMsg.edit({ embeds: [defeatEmbed] });

            // Save after defeat
            require('../index').saveData();

            return { success: false, defeated: true, goldLost };
        } else {
            // Player won
            results.success = true;
            results.defeatedEnemies = combatResult.defeatedEnemies;

            // Update global stats
            require('../index').gameData.serverStats.totalMonstersDefeated += combatResult.defeatedEnemies.length;
        }
    }

    // Process rewards
    const goldMin = location.rewards.gold.min;
    const goldMax = location.rewards.gold.max;
    const goldReward = helpers.getRandomInt(goldMin, goldMax);

    // Apply pet bonus if applicable
    let petBonusText = '';
    if (playerData.pet && playerData.petStats.happiness > 50 && playerData.petStats.hunger > 50) {
        const petBonus = Math.floor(playerData.petStats.level / 5) + 1;
        results.gold = Math.floor(goldReward * petBonus);
        petBonusText = ` (${petBonus}x Pet Bonus!)`;
    } else {
        results.gold = goldReward;
    }

    // Award gold
    playerData.gold += results.gold;

    // Award XP
    const xpMin = location.rewards.xp.min;
    const xpMax = location.rewards.xp.max;
    results.experience = helpers.getRandomInt(xpMin, xpMax);

    // Add extra XP based on enemies defeated
    if (results.defeatedEnemies.length > 0) {
        results.experience += results.defeatedEnemies.length * 10;
    }

    // Award XP to player
    const levelUps = require('../index').awardXP(playerData, results.experience);

    // Award XP to pet if the player has one
    if (playerData.pet) {
        const petXpGain = Math.floor(results.experience * 0.5); // Pet gets 50% of player XP
        const petResult = require('../systems/pets').awardPetXP(playerData, petXpGain);

        if (petResult.levelsGained > 0) {
            petBonusText += ` Your pet leveled up to ${playerData.petStats.level}!`;
        }
    }

    // Determine item rewards
    const itemRewards = [];

    // Process each possible item reward
    for (const itemReward of location.rewards.items) {
        const roll = Math.random();
        if (roll <= itemReward.chance) {
            const quantity = helpers.getRandomInt(itemReward.min, itemReward.max);

            if (quantity > 0) {
                // Add to player inventory
                require('../index').addItemToInventory(playerData, itemReward.id, quantity);

                // Add to results for display
                itemRewards.push({
                    id: itemReward.id,
                    name: require('../data/items')[itemReward.id].name,
                    quantity
                });
            }
        }
    }

    // Create rewards embed
    const rewardsEmbed = new EmbedBuilder()
        .setTitle(`🎉 Adventure Complete: ${location.name}`)
        .setColor('#00FF00'); // Green

    if (results.defeatedEnemies.length > 0) {
        rewardsEmbed.setDescription(`You successfully explored ${location.name} and defeated ${results.defeatedEnemies.length} enemies!`);
        rewardsEmbed.addFields({ name: 'Enemies Defeated', value: results.defeatedEnemies.join(', '), inline: false });
    } else {
        rewardsEmbed.setDescription(`You successfully explored ${location.name} without encountering any enemies.`);
    }

    // Add rewards to embed
    rewardsEmbed.addFields(
        { name: 'Gold', value: `${results.gold} ${require('../index').CONFIG.currency}${petBonusText}`, inline: true },
        { name: 'Experience', value: `${results.experience} XP${levelUps > 0 ? ` (Leveled up to ${playerData.level}!)` : ''}`, inline: true }
    );

    if (itemRewards.length > 0) {
        rewardsEmbed.addFields({
            name: 'Items Found', 
            value: itemRewards.map(item => `${item.quantity}x ${item.name}`).join('\n'), 
            inline: false
        });
    }

    rewardsEmbed.addFields({ name: 'Health', value: `${playerData.stats.currentHealth}/${playerData.stats.maxHealth}`, inline: true });

    // Show cooldown
    const cooldownTime = Math.floor(require('../index').CONFIG.adventureCooldown / 1000 / 60);
    rewardsEmbed.setFooter({ text: `You can adventure again in ${cooldownTime} minutes.` });

    await adventureMsg.edit({ embeds: [rewardsEmbed] });

    // Add adventure completion notification
    require('../index').addNotification(
        playerData,
        `Adventure Complete: Explored ${location.name} and earned ${results.gold} gold and ${results.experience} XP`
    );

    // Return the results
    return results;
}

// Run a combat encounter
async function runCombat(message, playerData, enemies, adventureMsg) {
    // Initialize combat state
    const combatState = {
        turn: 1,
        playerHealth: playerData.stats.currentHealth,
        playerMaxHealth: playerData.stats.maxHealth,
        playerStrength: playerData.stats.strength,
        playerDefense: playerData.stats.defense,
        enemies: enemies,
        defeatedEnemies: [],
        fled: false,
        defeated: false
    };

    // Apply buffs if any
    if (playerData.buffs) {
        const now = Date.now();

        if (playerData.buffs.strength && playerData.buffs.strength.expiresAt > now) {
            combatState.playerStrength += playerData.buffs.strength.amount;
        }

        if (playerData.buffs.defense && playerData.buffs.defense.expiresAt > now) {
            combatState.playerDefense += playerData.buffs.defense.amount;
        }
    }

    // Apply pet bonuses if applicable
    if (playerData.pet) {
        const petBonus = Math.floor(playerData.petStats.level / 2);
        combatState.playerStrength += petBonus;
        combatState.playerDefense += petBonus;

        // Special pet abilities
        const petType = playerData.pet;
        const petData = require('../data/pets').find(p => p.type === petType);

        if (petData && petData.abilities) {
            for (const ability of petData.abilities) {
                if (ability.level <= playerData.petStats.level) {
                    // Apply combat abilities
                    if (ability.type === 'combat_start' && ability.effect === 'damage') {
                        // Pet attacks at start of combat
                        const petDamage = Math.floor(playerData.petStats.level * 0.8) + ability.power;

                        // Apply damage to a random enemy
                        if (combatState.enemies.length > 0) {
                            const targetIndex = helpers.getRandomInt(0, combatState.enemies.length - 1);
                            combatState.enemies[targetIndex].hp -= petDamage;

                            // Update combat log
                            await message.channel.send(`🐾 Your pet ${playerData.petStats.name} uses ${ability.name} for ${petDamage} damage to ${combatState.enemies[targetIndex].name}!`);
                        }
                    }
                }
            }
        }
    }

    // Remove defeated enemies
    combatState.enemies = combatState.enemies.filter(enemy => enemy.hp > 0);

    // Main combat loop
    while (combatState.enemies.length > 0 && combatState.playerHealth > 0 && !combatState.fled) {
        // Create combat embed
        const combatEmbed = createCombatEmbed(combatState);

        // Create action buttons
        const actionRow = new ActionRowBuilder();

        // Basic attack button
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('combat_attack')
                .setLabel('Attack')
                .setStyle(ButtonStyle.Primary)
        );

        // Heal button if health is below 70%
        if (combatState.playerHealth < combatState.playerMaxHealth * 0.7 && playerData.inventory['health_potion']) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId('combat_heal')
                    .setLabel(`Use Health Potion (${playerData.inventory['health_potion'] || 0}x)`)
                    .setStyle(ButtonStyle.Success)
            );
        }

        // Flee button
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('combat_flee')
                .setLabel('Flee')
                .setStyle(ButtonStyle.Danger)
        );

        // Update adventure message with combat state
        await adventureMsg.edit({
            embeds: [combatEmbed],
            components: [actionRow]
        });

        // Wait for player action
        const filter = i => i.customId.startsWith('combat_') && i.user.id === message.author.id;

        try {
            const collected = await adventureMsg.awaitMessageComponent({ filter, time: 30000 });
            await collected.deferUpdate();

            // Process player action
            if (collected.customId === 'combat_attack') {
                // Select first enemy if only one exists
                if (combatState.enemies.length === 1) {
                    const targetEnemy = combatState.enemies[0];
                    const damage = Math.max(1, Math.floor(combatState.playerStrength * (0.8 + Math.random() * 0.4)));
                    targetEnemy.hp -= damage;
                    await message.channel.send(`You attack ${targetEnemy.name} for ${damage} damage!`);
                    
                    if (targetEnemy.hp <= 0) {
                        await message.channel.send(`You defeated ${targetEnemy.name}!`);
                        combatState.defeatedEnemies.push(targetEnemy);
                        combatState.enemies = combatState.enemies.filter(e => e.id !== targetEnemy.id);
                    }
                } else {
                    await handlePlayerAttack(message, combatState, adventureMsg);
                }
            } else if (collected.customId === 'combat_heal') {
                await handlePlayerHeal(message, playerData, combatState, adventureMsg);
            } else if (collected.customId === 'combat_flee') {
                const fleeChance = 0.3 + (playerData.level * 0.01); // Better chance at higher levels

                if (Math.random() < fleeChance) {
                    combatState.fled = true;
                    await message.channel.send('You managed to escape!');
                } else {
                    await message.channel.send('You failed to escape!');

                    // Enemies get a free attack when flee fails
                    await handleEnemyAttacks(message, combatState, adventureMsg);
                }
            }
        } catch (error) {
            // Timeout - enemies attack once
            await message.channel.send('You hesitated! The enemies attack!');
            const enemyDamage = Math.floor(Math.random() * 4) + 4; // Random damage between 4-8
            combatState.playerHealth -= enemyDamage;
            await message.channel.send(`Enemies deal ${enemyDamage} damage!`);
        }

        // Check if combat is over
        if (combatState.enemies.length === 0) {
            // All enemies defeated
            break;
        }

        if (combatState.playerHealth <= 0) {
            // Player defeated
            combatState.defeated = true;
            break;
        }

        if (combatState.fled) {
            // Player fled
            break;
        }

        // Next turn
        combatState.turn++;
    }

    // Update player health after combat
    playerData.stats.currentHealth = combatState.playerHealth;

    // Update pet hunger/happiness if they participated
    if (playerData.pet) {
        // Decrease hunger from exertion
        playerData.petStats.hunger = Math.max(0, playerData.petStats.hunger - 5);
    }

    // Return combat results
    return {
        defeated: combatState.defeated,
        fled: combatState.fled,
        defeatedEnemies: combatState.defeatedEnemies.map(enemy => enemy.name)
    };
}

// Create combat embed
function createCombatEmbed(combatState) {
    const embed = new EmbedBuilder()
        .setTitle(`⚔️ Combat - Turn ${combatState.turn}`)
        .setColor(require('../index').CONFIG.embedColor);

    // Player stats
    const healthPercent = (combatState.playerHealth / combatState.playerMaxHealth) * 100;
    let healthBar = '';

    if (healthPercent > 60) {
        healthBar = '🟩'.repeat(Math.ceil(healthPercent / 10));
    } else if (healthPercent > 30) {
        healthBar = '🟨'.repeat(Math.ceil(healthPercent / 10));
    } else {
        healthBar = '🟥'.repeat(Math.ceil(healthPercent / 10));
    }

    embed.addFields({
        name: '🧙 You',
        value: `Health: ${combatState.playerHealth}/${combatState.playerMaxHealth}\n` +
        `${healthBar}\n` +
        `Attack: ${combatState.playerStrength} | Defense: ${combatState.playerDefense}`,
        inline: false
    });

    // Enemies
    combatState.enemies.forEach((enemy, index) => {
        const enemyHealthPercent = Math.min(100, Math.max(0, (enemy.hp / enemy.maxHp || enemy.hp) * 100));
        let enemyHealthBar = '';

        if (enemyHealthPercent > 60) {
            enemyHealthBar = '🟩'.repeat(Math.ceil(enemyHealthPercent / 20));
        } else if (enemyHealthPercent > 30) {
            enemyHealthBar = '🟨'.repeat(Math.ceil(enemyHealthPercent / 20));
        } else {
            enemyHealthBar = '🟥'.repeat(Math.ceil(enemyHealthPercent / 20));
        }

        embed.addFields({
            name: `👾 ${enemy.name} ${index + 1}`,
            value: `Health: ${enemy.hp} \n${enemyHealthBar}\nAttack: ${enemy.attack}`,
            inline: true
        });
    });

    embed.setFooter({ text: 'Choose your action below...' });

    return embed;
}

// Handle player attack
async function handlePlayerAttack(message, combatState, adventureMsg) {
    if (combatState.enemies.length === 0) return;

    // Select target
    let targetEnemy;
    let targetMsg;

    if (combatState.enemies.length === 1) {
        // Only one enemy, target it
        targetEnemy = combatState.enemies[0];
    } else {
        // Multiple enemies, let player choose
        const targetButtons = new ActionRowBuilder();

        for (let i = 0; i < Math.min(5, combatState.enemies.length); i++) {
            targetButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`target_${i}`)
                    .setLabel(`Attack ${combatState.enemies[i].name} ${i+1}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        targetMsg = await message.channel.send({
            content: 'Choose your target:',
            components: [targetButtons]
        });

        // Wait for player action
        const filter = i => (i.customId.startsWith('combat_') || i.customId.startsWith('target_')) && i.user.id === message.author.id;

        try {
            const collected = await message.channel.awaitMessageComponent({ filter, time: 30000 });
            await collected.deferUpdate();

            if (collected.customId.startsWith('target_')) {
                const targetIndex = parseInt(collected.customId.split('_')[1]);
                targetEnemy = combatState.enemies[targetIndex];
            } else {
                // For single enemy, use the first one
                targetEnemy = combatState.enemies[0];
            }

            // Clean up target message if it exists
            if (targetMsg) {
                await targetMsg.delete().catch(() => {});
            }
        } catch (error) {
            // Timeout - select random target
            const randomIndex = helpers.getRandomInt(0, combatState.enemies.length - 1);
            targetEnemy = combatState.enemies[randomIndex];

            if (targetMsg) {
                await targetMsg.edit({
                    content: `You hesitated! Attacking ${targetEnemy.name} randomly.`,
                    components: []
                });

                // Delete the message after a delay
                setTimeout(() => targetMsg.delete().catch(() => {}), 2000);
            }
        }
    }

    // Calculate damage
    let baseDamage = combatState.playerStrength * (0.8 + Math.random() * 0.4); // ±20% variance

    // Critical hit chance (10% + 0.5% per level)
    const critChance = 0.1 + (playerData.level * 0.005);
    let isCritical = Math.random() < critChance;

    if (isCritical) {
        baseDamage *= 1.5; // 50% more damage on critical hit
    }

    // Enemy defense reduces damage (but always deal at least 1 damage)
    const enemyDefense = targetEnemy.defense || 0;
    const damageReduction = enemyDefense / (enemyDefense + 50); // Defense formula

    const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction)));

    // Apply damage to enemy
    targetEnemy.hp -= finalDamage;

    // Record max HP if not set
    if (!targetEnemy.maxHp) {
        targetEnemy.maxHp = targetEnemy.hp + finalDamage;
    }

    // Send attack message
    let attackMessage = `You attack ${targetEnemy.name} for ${finalDamage} damage`;
    if (isCritical) {
        attackMessage += " (Critical Hit!)";
    }
    await message.channel.send(attackMessage);

    // Check if enemy is defeated
    if (targetEnemy.hp <= 0) {
        await message.channel.send(`You defeated ${targetEnemy.name}!`);

        // Add to defeated enemies list
        combatState.defeatedEnemies.push(targetEnemy);

        // Remove from active enemies
        combatState.enemies = combatState.enemies.filter(e => e.id !== targetEnemy.id);
    }

    // If enemies remain, they attack
    if (combatState.enemies.length > 0) {
        await handleEnemyAttacks(message, combatState, adventureMsg);
    }
}

// Handle enemy attacks
async function handleEnemyAttacks(message, combatState, adventureMsg) {
    // Each enemy attacks
    for (const enemy of combatState.enemies) {
        // Skip if player already defeated
        if (combatState.playerHealth <= 0) break;

        // Calculate enemy damage
        let enemyDamage = enemy.attack * (0.8 + Math.random() * 0.4); // ±20% variance

        // Player defense reduces damage
        const defenseReduction = combatState.playerDefense / (combatState.playerDefense + 50);
        enemyDamage = Math.max(1, Math.floor(enemyDamage * (1 - defenseReduction)));

        // Apply damage to player
        combatState.playerHealth -= enemyDamage;

        // Send attack message
        await message.channel.send(`${enemy.name} attacks you for ${enemyDamage} damage!`);

        // Check if player is defeated
        if (combatState.playerHealth <= 0) {
            combatState.playerHealth = 0;
            combatState.defeated = true;
            await message.channel.send('You have been defeated!');
            break;
        }
    }

    // Update combat embed after all attacks
    const updatedEmbed = createCombatEmbed(combatState);
    await adventureMsg.edit({ embeds: [updatedEmbed] });
}

// Handle player using a healing potion
async function handlePlayerHeal(message, playerData, combatState, adventureMsg) {
    // Check if player has a health potion
    if (!playerData.inventory['health_potion'] || playerData.inventory['health_potion'] <= 0) {
        await message.channel.send("You don't have any health potions!");
        return;
    }

    // Remove potion from inventory
    require('../index').removeItemFromInventory(playerData, 'health_potion');

    // Get potion healing amount
    const potion = require('../data/items')['health_potion'];
    const healAmount = potion.power;

    // Apply healing
    const oldHealth = combatState.playerHealth;
    combatState.playerHealth = Math.min(combatState.playerMaxHealth, combatState.playerHealth + healAmount);
    const actualHeal = combatState.playerHealth - oldHealth;

    await message.channel.send(`You used a health potion and restored ${actualHeal} health!`);

    // Enemies still get to attack after healing
    await handleEnemyAttacks(message, combatState, adventureMsg);
}

module.exports = {
    runAdventure,
    runCombat
};