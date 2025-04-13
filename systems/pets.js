// Pet system for RPG Discord bot
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const PETS = require('../data/pets');

// Feed pet with food items
function feedPet(playerData, foodItem) {
    if (!playerData.pet) {
        return { success: false, message: "You don't have a pet to feed!" };
    }
    
    // Calculate hunger restoration based on food quality
    let hungerRestored = 0;
    switch (foodItem) {
        case 'pet_food':
            hungerRestored = 30;
            break;
        case 'pet_treat':
            hungerRestored = 15;
            break;
        default:
            return { success: false, message: "That item cannot be fed to your pet." };
    }
    
    // Apply hunger restoration
    const oldHunger = playerData.petStats.hunger;
    playerData.petStats.hunger = Math.min(100, oldHunger + hungerRestored);
    
    // Happiness bonus from feeding
    playerData.petStats.happiness = Math.min(100, playerData.petStats.happiness + 5);
    
    return {
        success: true,
        message: `You fed your pet ${playerData.petStats.name}. Hunger: ${oldHunger} → ${playerData.petStats.hunger}`,
        hungerRestored: playerData.petStats.hunger - oldHunger
    };
}

// Play with pet to increase happiness
function playWithPet(playerData, toyItem) {
    if (!playerData.pet) {
        return { success: false, message: "You don't have a pet to play with!" };
    }
    
    // Calculate happiness boost based on toy
    let happinessBoost = 0;
    switch (toyItem) {
        case 'pet_toy':
            happinessBoost = 25;
            break;
        default:
            return { success: false, message: "Your pet isn't interested in that item." };
    }
    
    // Apply happiness boost
    const oldHappiness = playerData.petStats.happiness;
    playerData.petStats.happiness = Math.min(100, oldHappiness + happinessBoost);
    
    // Small hunger decrease from playing
    playerData.petStats.hunger = Math.max(0, playerData.petStats.hunger - 5);
    
    return {
        success: true,
        message: `You played with your pet ${playerData.petStats.name}. Happiness: ${oldHappiness} → ${playerData.petStats.happiness}`,
        happinessBoost: playerData.petStats.happiness - oldHappiness
    };
}

// Award XP to pet
function awardPetXP(playerData, xpAmount) {
    if (!playerData.pet) return 0;
    
    // Apply happiness/hunger modifiers to XP gain
    const happinessModifier = playerData.petStats.happiness / 100;
    const hungerModifier = playerData.petStats.hunger / 100;
    
    const modifiedXP = Math.floor(xpAmount * happinessModifier * hungerModifier);
    playerData.petStats.xp += modifiedXP;
    
    // Check for level up
    let levelsGained = 0;
    const maxPetLevel = require('../index').CONFIG.maxPetLevel;
    
    while (playerData.petStats.xp >= getPetXpForLevel(playerData.petStats.level) && 
           playerData.petStats.level < maxPetLevel) {
        playerData.petStats.xp -= getPetXpForLevel(playerData.petStats.level);
        playerData.petStats.level++;
        levelsGained++;
        
        // Add notification for pet level up
        require('../index').addNotification(
            playerData,
            `🐾 Your pet ${playerData.petStats.name} leveled up to level ${playerData.petStats.level}!`
        );
        
        // Check for pet level achievements
        if (playerData.petStats.level >= 10 && !playerData.achievements.includes('pet_master')) {
            playerData.achievements.push('pet_master');
            require('../index').addItemToInventory(playerData, 'rare_pet_egg', 1);
            require('../index').addNotification(
                playerData,
                "🏆 Achievement Unlocked: Pet Master! Received Rare Pet Egg."
            );
        }
    }
    
    return {
        xpGained: modifiedXP,
        levelsGained: levelsGained
    };
}

// Calculate XP required for pet level
function getPetXpForLevel(level) {
    return Math.floor(75 * Math.pow(1.4, level - 1));
}

// Decrease pet stats over time
function updatePetStats(playerData, timePassed) {
    if (!playerData.pet) return;
    
    // Convert to hours
    const hoursPassed = timePassed / (1000 * 60 * 60);
    
    // Decrease hunger by 5 per hour, minimum 0
    playerData.petStats.hunger = Math.max(0, playerData.petStats.hunger - (5 * hoursPassed));
    
    // Decrease happiness by 3 per hour, minimum 0
    playerData.petStats.happiness = Math.max(0, playerData.petStats.happiness - (3 * hoursPassed));
    
    // If hunger is very low, happiness decreases faster
    if (playerData.petStats.hunger < 20) {
        playerData.petStats.happiness = Math.max(0, playerData.petStats.happiness - (5 * hoursPassed));
    }
}

// Handle pet command
async function handlePetCommand(message, playerData, args, CONFIG) {
    // No arguments - show pet status
    if (!args.length) {
        if (!playerData.pet) {
            return message.reply("You don't have a pet yet! Use `!pet adopt` to adopt one.");
        }
        
        const petEmbed = new MessageEmbed()
            .setTitle(`🐾 ${playerData.petStats.name} (${playerData.petStats.type})`)
            .setColor(CONFIG.embedColor)
            .setDescription(`Your level ${playerData.petStats.level} pet companion!`);
        
        // Add pet stats
        petEmbed.addField('Level', `${playerData.petStats.level} (${playerData.petStats.xp}/${getPetXpForLevel(playerData.petStats.level)} XP)`, true);
        petEmbed.addField('Hunger', `${playerData.petStats.hunger}/100`, true);
        petEmbed.addField('Happiness', `${playerData.petStats.happiness}/100`, true);
        
        // Add pet bonuses
        const petBonus = Math.floor(playerData.petStats.level / 2);
        petEmbed.addField('Bonuses', 
            `+${petBonus} Strength\n` +
            `+${petBonus} Defense\n` +
            `+${petBonus * 5} Max Health`, 
            false
        );
        
        // Status indicators
        let statusMessage = '';
        if (playerData.petStats.hunger < 20) {
            statusMessage += '😫 Your pet is very hungry! Feed it with `!pet feed`.\n';
        } else if (playerData.petStats.hunger < 50) {
            statusMessage += '🍽️ Your pet is getting hungry. Consider feeding it soon.\n';
        }
        
        if (playerData.petStats.happiness < 20) {
            statusMessage += '😢 Your pet is unhappy! Play with it using `!pet play`.\n';
        } else if (playerData.petStats.happiness < 50) {
            statusMessage += '😐 Your pet would appreciate some playtime soon.\n';
        }
        
        if (statusMessage) {
            petEmbed.addField('Status', statusMessage, false);
        }
        
        // Pet abilities
        const petData = PETS.find(pet => pet.type === playerData.petStats.type);
        if (petData && petData.abilities) {
            const abilities = petData.abilities
                .filter(ability => ability.level <= playerData.petStats.level)
                .map(ability => `${ability.name}: ${ability.description}`);
            
            if (abilities.length > 0) {
                petEmbed.addField('Abilities', abilities.join('\n'), false);
            }
        }
        
        // Add tips
        petEmbed.setFooter({ text: 'Use !pet feed or !pet play to care for your pet' });
        
        return message.channel.send({ embeds: [petEmbed] });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'adopt') {
        // Check if player already has a pet
        if (playerData.pet) {
            return message.reply(`You already have a pet named ${playerData.petStats.name}. Use \`!pet release\` first if you want to adopt a new one.`);
        }
        
        // Check if player has a pet egg
        if (!playerData.inventory['pet_egg'] && !playerData.inventory['rare_pet_egg']) {
            return message.reply("You need a Pet Egg to adopt a pet. You can get one from the shop or as a reward!");
        }
        
        // Determine egg type
        const eggType = playerData.inventory['rare_pet_egg'] ? 'rare_pet_egg' : 'pet_egg';
        const isRare = eggType === 'rare_pet_egg';
        
        // Filter available pets by rarity
        const availablePets = PETS.filter(pet => isRare ? pet.rarity !== 'common' : true);
        
        // Create select menu with available pets
        const selectRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select_pet')
                    .setPlaceholder('Choose a pet to adopt')
                    .addOptions(availablePets.slice(0, 10).map(pet => ({
                        label: `${pet.name} (${pet.type})`,
                        description: pet.description,
                        value: pet.type,
                        emoji: pet.emoji || '🐾'
                    })))
            );
        
        // Create adopt embed
        const adoptEmbed = new MessageEmbed()
            .setTitle('🥚 Pet Adoption')
            .setColor(CONFIG.embedColor)
            .setDescription(`You're about to hatch a ${isRare ? 'Rare ' : ''}Pet Egg! Choose your new companion wisely.`)
            .setFooter({ text: 'Your pet will accompany you on adventures and provide stat bonuses.' });
        
        // Add a brief description of each pet
        availablePets.slice(0, 10).forEach(pet => {
            adoptEmbed.addField(
                `${pet.emoji || '🐾'} ${pet.name} (${pet.rarity})`,
                pet.description,
                true
            );
        });
        
        const adoptMsg = await message.channel.send({
            embeds: [adoptEmbed],
            components: [selectRow]
        });
        
        // Create collector for select menu interactions
        const filter = i => i.customId === 'select_pet' && i.user.id === message.author.id;
        const collector = adoptMsg.createMessageComponentCollector({ filter, time: 60000 });
        
        collector.on('collect', async i => {
            await i.deferUpdate();
            
            const selectedPetType = i.values[0];
            const selectedPet = PETS.find(pet => pet.type === selectedPetType);
            
            if (!selectedPet) {
                return await i.followUp({ content: 'Error: Selected pet not found.', ephemeral: true });
            }
            
            // Remove egg from inventory
            if (!require('../index').removeItemFromInventory(playerData, eggType)) {
                return await i.followUp({ content: 'Error: Pet egg not found in inventory.', ephemeral: true });
            }
            
            // Create name input prompt
            const nameEmbed = new MessageEmbed()
                .setTitle('🐾 Name Your Pet')
                .setColor(CONFIG.embedColor)
                .setDescription(`You've selected a ${selectedPet.name}! What would you like to name your new pet?`)
                .setFooter({ text: 'Reply with a name (15 characters max)' });
            
            await adoptMsg.edit({
                embeds: [nameEmbed],
                components: []
            });
            
            // Collect name response
            const nameFilter = m => m.author.id === message.author.id;
            const nameCollector = message.channel.createMessageCollector({ filter: nameFilter, time: 60000, max: 1 });
            
            nameCollector.on('collect', async m => {
                // Validate name length
                let petName = m.content.trim();
                
                if (petName.length > 15) {
                    petName = petName.substring(0, 15);
                    await message.channel.send("That name was too long, so I've shortened it.");
                }
                
                // Assign pet to player
                playerData.pet = selectedPetType;
                playerData.petStats = {
                    name: petName,
                    type: selectedPetType,
                    level: 1,
                    xp: 0,
                    happiness: 100,
                    hunger: 100
                };
                
                // Create success embed
                const successEmbed = new MessageEmbed()
                    .setTitle('🐾 Pet Adopted!')
                    .setColor(CONFIG.embedColor)
                    .setDescription(`Congratulations! ${petName} is now your loyal pet companion.`)
                    .addField('Type', selectedPet.name, true)
                    .addField('Rarity', selectedPet.rarity, true)
                    .addField('Next Steps', 'Use `!pet` to check your pet\'s status, and `!pet feed` or `!pet play` to care for it.')
                    .setFooter({ text: 'Your pet will grow stronger as it levels up!' });
                
                // Add notification
                require('../index').addNotification(
                    playerData,
                    `You adopted a new pet: ${petName} the ${selectedPet.name}!`
                );
                
                // Save changes
                require('../index').saveData();
                
                await message.channel.send({ embeds: [successEmbed] });
            });
            
            nameCollector.on('end', collected => {
                if (collected.size === 0) {
                    message.channel.send('Pet naming timed out. Try adopting again when you\'re ready to name your pet.');
                }
            });
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                adoptMsg.edit({
                    content: 'Pet adoption timed out. Try again when you\'re ready!',
                    components: [],
                    embeds: []
                });
            }
        });
        
        return;
    } else if (action === 'feed') {
        // Check if player has a pet
        if (!playerData.pet) {
            return message.reply("You don't have a pet to feed. Use `!pet adopt` to get one first!");
        }
        
        // Check if pet is already full
        if (playerData.petStats.hunger >= 100) {
            return message.reply(`${playerData.petStats.name} is already full and doesn't want to eat right now.`);
        }
        
        // Check if player has pet food items
        const hasFood = playerData.inventory['pet_food'] > 0;
        const hasTreats = playerData.inventory['pet_treat'] > 0;
        
        if (!hasFood && !hasTreats) {
            return message.reply("You don't have any pet food. Purchase some from the shop with `!shop buy pet_food` or `!shop buy pet_treat`.");
        }
        
        // Create feed options
        const feedRow = new MessageActionRow();
        
        if (hasFood) {
            feedRow.addComponents(
                new MessageButton()
                    .setCustomId('feed_pet_food')
                    .setLabel('Pet Food (+30 Hunger)')
                    .setStyle('PRIMARY')
            );
        }
        
        if (hasTreats) {
            feedRow.addComponents(
                new MessageButton()
                    .setCustomId('feed_pet_treat')
                    .setLabel('Pet Treat (+15 Hunger)')
                    .setStyle('SECONDARY')
            );
        }
        
        // Add cancel button
        feedRow.addComponents(
            new MessageButton()
                .setCustomId('cancel_feed')
                .setLabel('Cancel')
                .setStyle('DANGER')
        );
        
        // Create feed embed
        const feedEmbed = new MessageEmbed()
            .setTitle('🍽️ Feed Your Pet')
            .setColor(CONFIG.embedColor)
            .setDescription(`What would you like to feed ${playerData.petStats.name}?`)
            .addField('Current Hunger', `${playerData.petStats.hunger}/100`, true)
            .addField('Inventory', 
                `Pet Food: ${playerData.inventory['pet_food'] || 0}x\n` +
                `Pet Treat: ${playerData.inventory['pet_treat'] || 0}x`, 
                true
            );
        
        const feedMsg = await message.channel.send({
            embeds: [feedEmbed],
            components: [feedRow]
        });
        
        // Create collector for button interactions
        const filter = i => i.customId.startsWith('feed_') || i.customId === 'cancel_feed';
        const collector = feedMsg.createMessageComponentCollector({ filter, time: 30000 });
        
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "This isn't your pet!", ephemeral: true });
            }
            
            await i.deferUpdate();
            
            if (i.customId === 'cancel_feed') {
                await feedMsg.edit({
                    content: 'Feeding cancelled.',
                    embeds: [],
                    components: []
                });
                return collector.stop();
            }
            
            // Get food type
            const foodType = i.customId === 'feed_pet_food' ? 'pet_food' : 'pet_treat';
            
            // Try to remove food from inventory
            if (!require('../index').removeItemFromInventory(playerData, foodType)) {
                return await i.followUp({ content: `You don't have any ${foodType.replace('_', ' ')} left!`, ephemeral: true });
            }
            
            // Feed the pet
            const feedResult = feedPet(playerData, foodType);
            
            // Update UI
            const resultEmbed = new MessageEmbed()
                .setTitle('🍽️ Pet Fed')
                .setColor(CONFIG.embedColor)
                .setDescription(feedResult.message)
                .addField('Current Status', 
                    `Hunger: ${playerData.petStats.hunger}/100\n` +
                    `Happiness: ${playerData.petStats.happiness}/100`, 
                    false
                );
            
            await feedMsg.edit({
                embeds: [resultEmbed],
                components: []
            });
            
            // Save changes
            require('../index').saveData();
            
            collector.stop();
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                feedMsg.edit({
                    content: 'Feeding timed out.',
                    embeds: [],
                    components: []
                });
            }
        });
        
        return;
    } else if (action === 'play') {
        // Check if player has a pet
        if (!playerData.pet) {
            return message.reply("You don't have a pet to play with. Use `!pet adopt` to get one first!");
        }
        
        // Check if pet is already very happy
        if (playerData.petStats.happiness >= 100) {
            return message.reply(`${playerData.petStats.name} is already very happy and needs some rest now.`);
        }
        
        // Check if player has pet toys
        if (!playerData.inventory['pet_toy']) {
            return message.reply("You don't have any pet toys. Purchase some from the shop with `!shop buy pet_toy`.");
        }
        
        // Create play button
        const playRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('play_with_pet')
                    .setLabel('Play with Pet (+25 Happiness)')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('cancel_play')
                    .setLabel('Cancel')
                    .setStyle('SECONDARY')
            );
        
        // Create play embed
        const playEmbed = new MessageEmbed()
            .setTitle('🎾 Play With Your Pet')
            .setColor(CONFIG.embedColor)
            .setDescription(`Would you like to play with ${playerData.petStats.name}?`)
            .addField('Current Happiness', `${playerData.petStats.happiness}/100`, true)
            .addField('Toys Available', `Pet Toy: ${playerData.inventory['pet_toy']}x`, true);
        
        const playMsg = await message.channel.send({
            embeds: [playEmbed],
            components: [playRow]
        });
        
        // Create collector for button interactions
        const filter = i => ['play_with_pet', 'cancel_play'].includes(i.customId);
        const collector = playMsg.createMessageComponentCollector({ filter, time: 30000 });
        
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "This isn't your pet!", ephemeral: true });
            }
            
            await i.deferUpdate();
            
            if (i.customId === 'cancel_play') {
                await playMsg.edit({
                    content: 'Playtime cancelled.',
                    embeds: [],
                    components: []
                });
                return collector.stop();
            }
            
            // Try to remove toy from inventory
            if (!require('../index').removeItemFromInventory(playerData, 'pet_toy')) {
                return await i.followUp({ content: "You don't have any pet toys left!", ephemeral: true });
            }
            
            // Play with the pet
            const playResult = playWithPet(playerData, 'pet_toy');
            
            // Update UI
            const resultEmbed = new MessageEmbed()
                .setTitle('🎾 Playtime!')
                .setColor(CONFIG.embedColor)
                .setDescription(`You played with ${playerData.petStats.name}! They look so happy!`)
                .addField('Current Status', 
                    `Happiness: ${playerData.petStats.happiness}/100\n` +
                    `Hunger: ${playerData.petStats.hunger}/100 (Playing made your pet a bit hungry)`, 
                    false
                );
            
            await playMsg.edit({
                embeds: [resultEmbed],
                components: []
            });
            
            // Save changes
            require('../index').saveData();
            
            collector.stop();
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                playMsg.edit({
                    content: 'Playtime timed out.',
                    embeds: [],
                    components: []
                });
            }
        });
        
        return;
    } else if (action === 'rename') {
        // Check if player has a pet
        if (!playerData.pet) {
            return message.reply("You don't have a pet to rename. Use `!pet adopt` to get one first!");
        }
        
        // Create rename embed
        const renameEmbed = new MessageEmbed()
            .setTitle('✏️ Rename Your Pet')
            .setColor(CONFIG.embedColor)
            .setDescription(`What would you like to rename ${playerData.petStats.name} to?`)
            .setFooter({ text: 'Reply with a new name (15 characters max)' });
        
        const renameMsg = await message.channel.send({
            embeds: [renameEmbed]
        });
        
        // Collect name response
        const nameFilter = m => m.author.id === message.author.id;
        const nameCollector = message.channel.createMessageCollector({ filter: nameFilter, time: 60000, max: 1 });
        
        nameCollector.on('collect', async m => {
            // Validate name length
            let newName = m.content.trim();
            
            if (newName.length > 15) {
                newName = newName.substring(0, 15);
                await message.channel.send("That name was too long, so I've shortened it.");
            }
            
            const oldName = playerData.petStats.name;
            playerData.petStats.name = newName;
            
            // Create success embed
            const successEmbed = new MessageEmbed()
                .setTitle('✏️ Pet Renamed!')
                .setColor(CONFIG.embedColor)
                .setDescription(`Your pet has been renamed from ${oldName} to ${newName}!`);
            
            // Save changes
            require('../index').saveData();
            
            await message.channel.send({ embeds: [successEmbed] });
        });
        
        nameCollector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send('Pet renaming timed out. Try again when you\'re ready.');
            }
        });
        
        return;
    } else if (action === 'release') {
        // Check if player has a pet
        if (!playerData.pet) {
            return message.reply("You don't have a pet to release.");
        }
        
        // Create confirmation message
        const confirmEmbed = new MessageEmbed()
            .setTitle('⚠️ Release Pet?')
            .setColor('RED')
            .setDescription(`Are you sure you want to release ${playerData.petStats.name}? This action cannot be undone!`);
        
        const confirmRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm_release')
                    .setLabel('Release Pet')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('cancel_release')
                    .setLabel('Keep Pet')
                    .setStyle('SECONDARY')
            );
        
        const confirmMsg = await message.channel.send({
            embeds: [confirmEmbed],
            components: [confirmRow]
        });
        
        // Create collector for button interactions
        const filter = i => ['confirm_release', 'cancel_release'].includes(i.customId);
        const collector = confirmMsg.createMessageComponentCollector({ filter, time: 30000 });
        
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "This isn't your pet!", ephemeral: true });
            }
            
            await i.deferUpdate();
            
            if (i.customId === 'confirm_release') {
                const petName = playerData.petStats.name;
                
                // Release the pet
                playerData.pet = null;
                playerData.petStats = {
                    name: null,
                    type: null,
                    level: 1,
                    xp: 0,
                    happiness: 100,
                    hunger: 100
                };
                
                // Update player stats since pet bonuses are gone
                require('../index').updatePlayerStats(playerData);
                
                // Create release embed
                const releaseEmbed = new MessageEmbed()
                    .setTitle('🕊️ Pet Released')
                    .setColor(CONFIG.embedColor)
                    .setDescription(`You've released ${petName} back into the wild. They'll always remember you.`);
                
                await confirmMsg.edit({
                    embeds: [releaseEmbed],
                    components: []
                });
                
                // Save changes
                require('../index').saveData();
            } else {
                await confirmMsg.edit({
                    content: `You decided to keep ${playerData.petStats.name} with you. They look happy about it!`,
                    embeds: [],
                    components: []
                });
            }
            
            collector.stop();
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                confirmMsg.edit({
                    content: 'Pet release cancelled due to timeout.',
                    embeds: [],
                    components: []
                });
            }
        });
        
        return;
    }
    
    // Invalid command
    message.reply("Invalid pet command. Available commands: `!pet`, `!pet adopt`, `!pet feed`, `!pet play`, `!pet rename`, `!pet release`");
}

module.exports = {
    handlePetCommand,
    feedPet,
    playWithPet,
    awardPetXP,
    updatePetStats,
    getPetXpForLevel
};
