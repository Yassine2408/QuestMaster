// Inventory management system for RPG Discord bot
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');

// Handle inventory command
async function handleInventoryCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;

    // If no arguments, show full inventory
    if (!args.length) {
        const inventory = playerData.inventory;

        if (Object.keys(inventory).length === 0) {
            return message.reply("Your inventory is empty.");
        }

        // Group items by category for better organization
        const categories = {
            weapon: [],
            armor: [],
            material: [],
            consumable: [],
            pet: [],
            special: []
        };

        // Calculate total inventory value
        let totalValue = 0;

        for (const [itemId, quantity] of Object.entries(inventory)) {
            if (ITEMS[itemId]) {
                const item = ITEMS[itemId];
                const category = item.type || 'special';
                const value = item.value * quantity;
                totalValue += value;

                categories[category].push({
                    id: itemId,
                    name: item.name,
                    description: item.description,
                    quantity: quantity,
                    value: item.value,
                    totalValue: value
                });
            }
        }

        // Create inventory embed
        const inventoryEmbed = new EmbedBuilder()
            .setTitle(`${message.author.username}'s Inventory`)
            .setColor(CONFIG.embedColor)
            .setDescription(`You have ${Object.keys(inventory).length} unique items, worth approximately ${totalValue} ${CONFIG.currency} in total.`);

        // Add equipped items section
        let equippedText = '';
        if (playerData.equipped.weapon) {
            equippedText += `**Weapon**: ${ITEMS[playerData.equipped.weapon].name} (+${ITEMS[playerData.equipped.weapon].power} ATK)\n`;
        }
        if (playerData.equipped.armor) {
            equippedText += `**Armor**: ${ITEMS[playerData.equipped.armor].name} (+${ITEMS[playerData.equipped.armor].defense} DEF)\n`;
        }

        if (equippedText) {
            inventoryEmbed.addField('🔱 Currently Equipped', equippedText);
        }

        // Add categories to embed
        for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
                // Sort items by value
                items.sort((a, b) => b.value - a.value);

                let categoryText = '';
                for (const item of items) {
                    categoryText += `**${item.name}** (${item.quantity}x) - ${item.description}\n`;
                    categoryText += `Worth: ${item.value} ${CONFIG.currency} each (${item.totalValue} total)\n`;

                    if (category === 'weapon' && ITEMS[item.id].power) {
                        categoryText += `Attack: +${ITEMS[item.id].power}\n`;
                    } else if (category === 'armor' && ITEMS[item.id].defense) {
                        categoryText += `Defense: +${ITEMS[item.id].defense}\n`;
                    }

                    categoryText += '\n';
                }

                if (categoryText) {
                    // Capitalize first letter of category
                    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1) + 's';
                    inventoryEmbed.addField(`📦 ${categoryTitle}`, categoryText.slice(0, 1024)); // Ensure it fits in field limit
                }
            }
        }

        // Add inventory management help text
        inventoryEmbed.setFooter({ text: 'Use !inventory sort to sort items, !inventory search <term> to find items' });

        // Show inventory
        await message.channel.send({ embeds: [inventoryEmbed] });
        return;
    }

    // Handle subcommands
    const subcommand = args[0].toLowerCase();

    // Sort inventory
    if (subcommand === 'sort') {
        return message.reply("Inventory sorting feature coming soon!");
    }

    // Search inventory
    if (subcommand === 'search' || subcommand === 'find') {
        if (!args[1]) {
            return message.reply("Please specify a search term. Example: `!inventory search sword`");
        }

        const searchTerm = args.slice(1).join(' ').toLowerCase();
        const inventory = playerData.inventory;

        // Find matching items
        const matchingItems = [];

        for (const [itemId, quantity] of Object.entries(inventory)) {
            if (ITEMS[itemId]) {
                const item = ITEMS[itemId];

                // Check if item name or description contains search term
                if (item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    itemId.includes(searchTerm)) {

                    matchingItems.push({
                        id: itemId,
                        name: item.name,
                        description: item.description,
                        quantity: quantity,
                        value: item.value,
                        totalValue: item.value * quantity,
                        type: item.type
                    });
                }
            }
        }

        if (matchingItems.length === 0) {
            return message.reply(`No items found matching "${searchTerm}"`);
        }

        // Create search results embed
        const searchEmbed = new MessageEmbed()
            .setTitle(`🔍 Search Results: "${searchTerm}"`)
            .setColor(CONFIG.embedColor)
            .setDescription(`Found ${matchingItems.length} matching items in your inventory:`);

        // Add items to embed
        matchingItems.forEach(item => {
            let itemText = `${item.quantity}x ${item.name}\n${item.description}\nValue: ${item.value} ${CONFIG.currency} each (${item.totalValue} total)`;

            if (item.type === 'weapon' && ITEMS[item.id].power) {
                itemText += `\nAttack: +${ITEMS[item.id].power}`;
            } else if (item.type === 'armor' && ITEMS[item.id].defense) {
                itemText += `\nDefense: +${ITEMS[item.id].defense}`;
            }

            searchEmbed.addField(item.name, itemText, false);
        });

        await message.channel.send({ embeds: [searchEmbed] });
        return;
    }

    // Use item
    if (subcommand === 'use') {
        if (!args[1]) {
            return message.reply("Please specify an item to use. Example: `!inventory use health_potion`");
        }

        const itemId = args[1].toLowerCase();

        // Check if item exists
        if (!ITEMS[itemId]) {
            return message.reply(`Item "${itemId}" doesn't exist.`);
        }

        // Check if player has the item
        if (!playerData.inventory[itemId] || playerData.inventory[itemId] <= 0) {
            return message.reply(`You don't have any ${ITEMS[itemId].name} in your inventory.`);
        }

        // Forward to the use command handler
        const useArgs = [itemId];
        await require('../index').handleUseCommand(message, playerData, useArgs);
        return;
    }

    // Inspect item
    if (subcommand === 'inspect' || subcommand === 'examine') {
        if (!args[1]) {
            return message.reply("Please specify an item to inspect. Example: `!inventory inspect iron_sword`");
        }

        const itemId = args[1].toLowerCase();

        // Check if item exists in global items
        if (!ITEMS[itemId]) {
            return message.reply(`Item "${itemId}" doesn't exist.`);
        }

        const item = ITEMS[itemId];

        // Check if player owns the item
        const quantityOwned = playerData.inventory[itemId] || 0;
        const isEquipped = playerData.equipped.weapon === itemId || playerData.equipped.armor === itemId;

        // Create item inspection embed
        const itemEmbed = new MessageEmbed()
            .setTitle(`📋 Item: ${item.name}`)
            .setColor(CONFIG.embedColor)
            .setDescription(item.description)
            .addField('Type', item.type || 'Special', true)
            .addField('Value', `${item.value} ${CONFIG.currency}`, true);

        if (quantityOwned > 0) {
            itemEmbed.addField('Quantity Owned', `${quantityOwned}x`, true);
        }

        if (isEquipped) {
            itemEmbed.addField('Status', '✅ Currently Equipped', true);
        }

        // Add type-specific information
        if (item.type === 'weapon') {
            itemEmbed.addField('Attack Power', `+${item.power}`, true);

            if (item.requirements) {
                itemEmbed.addField('Required Level', item.requirements.level.toString(), true);
            }
        } else if (item.type === 'armor') {
            itemEmbed.addField('Defense', `+${item.defense}`, true);

            if (item.requirements) {
                itemEmbed.addField('Required Level', item.requirements.level.toString(), true);
            }
        } else if (item.type === 'consumable') {
            itemEmbed.addField('Effect', item.effect, true);
            itemEmbed.addField('Power', item.power.toString(), true);
        }

        // Add crafting info if this item can be crafted
        const RECIPES = require('../data/items').RECIPES;
        const recipe = RECIPES[itemId];

        if (recipe) {
            let materialsText = '';
            for (const [materialId, quantity] of Object.entries(recipe.materials)) {
                const material = ITEMS[materialId];
                materialsText += `${material.name}: ${quantity}x\n`;
            }

            if (materialsText) {
                itemEmbed.addField('Crafting Materials', materialsText, false);
            }
        }

        // Show where the item is used as ingredient
        const usedInRecipes = [];

        for (const [recipeId, recipeData] of Object.entries(RECIPES)) {
            if (recipeData.materials[itemId]) {
                usedInRecipes.push({
                    name: ITEMS[recipeData.result].name,
                    quantity: recipeData.materials[itemId]
                });
            }
        }

        if (usedInRecipes.length > 0) {
            let usedInText = '';
            for (const recipe of usedInRecipes) {
                usedInText += `${recipe.name} (${recipe.quantity}x needed)\n`;
            }

            itemEmbed.addField('Used In Crafting', usedInText, false);
        }

        // Add action buttons if player has the item
        let actionRow = null;

        if (quantityOwned > 0) {
            actionRow = new MessageActionRow();

            // Add appropriate buttons based on item type
            if (item.type === 'weapon' || item.type === 'armor') {
                if (!isEquipped) {
                    actionRow.addComponents(
                        new MessageButton()
                            .setCustomId('item_equip')
                            .setLabel('Equip Item')
                            .setStyle('PRIMARY')
                    );
                } else {
                    actionRow.addComponents(
                        new MessageButton()
                            .setCustomId('item_unequip')
                            .setLabel('Unequip Item')
                            .setStyle('SECONDARY')
                    );
                }
            }

            if (item.type === 'consumable') {
                actionRow.addComponents(
                    new MessageButton()
                        .setCustomId('item_use')
                        .setLabel('Use Item')
                        .setStyle('SUCCESS')
                );
            }

            // Sell button for all items
            actionRow.addComponents(
                new MessageButton()
                    .setCustomId('item_sell')
                    .setLabel(`Sell (${Math.floor(item.value * 0.6)} gold)`)
                    .setStyle('DANGER')
            );
        }

        // Send the embed with optional buttons
        const response = { embeds: [itemEmbed] };

        if (actionRow && actionRow.components.length > 0) {
            response.components = [actionRow];
        }

        const itemMsg = await message.channel.send(response);

        // If we have buttons, set up interaction handler
        if (actionRow && actionRow.components.length > 0) {
            const filter = i => i.customId.startsWith('item_') && i.user.id === message.author.id;
            const collector = itemMsg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                await i.deferUpdate();

                if (i.customId === 'item_equip') {
                    // Forward to equip command
                    const equipArgs = [itemId];
                    await require('../index').handleEquipCommand(message, playerData, equipArgs);
                    collector.stop();
                } else if (i.customId === 'item_unequip') {
                    // Forward to unequip command
                    const slotType = item.type; // 'weapon' or 'armor'
                    const unequipArgs = [slotType];
                    await require('../index').handleUnequipCommand(message, playerData, unequipArgs);
                    collector.stop();
                } else if (i.customId === 'item_use') {
                    // Forward to use command
                    const useArgs = [itemId];
                    await require('../index').handleUseCommand(message, playerData, useArgs);
                    collector.stop();
                } else if (i.customId === 'item_sell') {
                    // Create confirmation for selling
                    const confirmRow = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('confirm_sell')
                                .setLabel(`Sell 1x ${item.name}`)
                                .setStyle('SUCCESS'),
                            new MessageButton()
                                .setCustomId('cancel_sell')
                                .setLabel('Cancel')
                                .setStyle('SECONDARY')
                        );

                    // If player has multiple, add sell all option
                    if (quantityOwned > 1) {
                        confirmRow.addComponents(
                            new MessageButton()
                                .setCustomId('sell_all')
                                .setLabel(`Sell All (${quantityOwned}x)`)
                                .setStyle('DANGER')
                        );
                    }

                    await i.followUp({
                        content: `Are you sure you want to sell ${item.name}? You'll receive ${Math.floor(item.value * 0.6)} gold per item.`,
                        components: [confirmRow],
                        ephemeral: true
                    });

                    // Handle sell confirmation
                    const sellFilter = i => ['confirm_sell', 'cancel_sell', 'sell_all'].includes(i.customId) && i.user.id === message.author.id;

                    try {
                        const sellResponse = await i.channel.awaitMessageComponent({ filter: sellFilter, time: 30000 });

                        if (sellResponse.customId === 'confirm_sell') {
                            // Sell one item
                            const sellValue = Math.floor(item.value * 0.6);

                            // Remove from inventory
                            if (require('../index').removeItemFromInventory(playerData, itemId, 1)) {
                                // Add gold
                                playerData.gold += sellValue;

                                // Save
                                require('../index').saveData();

                                await sellResponse.update({
                                    content: `You sold 1x ${item.name} for ${sellValue} gold. You now have ${playerData.gold} gold.`,
                                    components: []
                                });
                            } else {
                                await sellResponse.update({
                                    content: `Error: You no longer have this item in your inventory.`,
                                    components: []
                                });
                            }
                        } else if (sellResponse.customId === 'sell_all') {
                            // Sell all of this item
                            const sellValue = Math.floor(item.value * 0.6) * quantityOwned;

                            // Remove from inventory
                            if (require('../index').removeItemFromInventory(playerData, itemId, quantityOwned)) {
                                // Add gold
                                playerData.gold += sellValue;

                                // Save
                                require('../index').saveData();

                                await sellResponse.update({
                                    content: `You sold ${quantityOwned}x ${item.name} for ${sellValue} gold. You now have ${playerData.gold} gold.`,
                                    components: []
                                });
                            } else {
                                await sellResponse.update({
                                    content: `Error: You no longer have this item in your inventory.`,
                                    components: []
                                });
                            }
                        } else {
                            // Cancel
                            await sellResponse.update({
                                content: 'Sale cancelled.',
                                components: []
                            });
                        }
                    } catch (err) {
                        // Timeout
                        await i.editReply({
                            content: 'Sale cancelled due to timeout.',
                            components: []
                        });
                    }

                    collector.stop();
                }
            });

            collector.on('end', collected => {
                // Remove buttons when collector ends
                itemMsg.edit({ components: [] }).catch(() => {});
            });
        }

        return;
    }

    // Unknown subcommand
    message.reply("Invalid inventory command. Available commands: `!inventory`, `!inventory search <term>`, `!inventory inspect <item>`, `!inventory use <item>`");
}

// Handle shop command
async function handleShopCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;
    const SHOP_ITEMS = require('../data/shop'); // Assuming a shop.js file exists

    if (!args.length) {
        // Display shop items
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor(CONFIG.embedColor)
            .setDescription(`Welcome to the shop! You have ${playerData.gold} ${CONFIG.currency}\n\nUse \`!shop buy <item>\` to purchase an item.\nUse \`!shop sell <item> [quantity]\` to sell items.`);

        // Group items by category for better organization
        const categories = {
            Weapons: [],
            Armor: [],
            Consumables: [],
            Pets: []
        };

        // Sort items into categories
        for (const itemId of SHOP_ITEMS) {
            const item = ITEMS[itemId];
            if (!item) continue;

            let itemInfo = `**${item.name}** - ${item.value} ${CONFIG.currency}\n`;
            if (item.type === 'weapon') categories.Weapons.push(itemInfo);
            else if (item.type === 'armor') categories.Armor.push(itemInfo);
            else if (item.type === 'consumable') categories.Consumables.push(itemInfo);
            else if (item.type === 'pet') categories.Pets.push(itemInfo);
        }

        // Add each category to the embed
        for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
                shopEmbed.addFields({
                    name: `📦 ${category}`,
                    value: items.join(''),
                    inline: false
                });
            }
        }

        return message.channel.send({ embeds: [shopEmbed] });
    }


    const subcommand = args[0].toLowerCase();

    if (subcommand === 'buy') {
        // BUY ITEM LOGIC HERE
    } else if (subcommand === 'sell') {
        // SELL ITEM LOGIC HERE
    } else {
        message.reply("Invalid shop command. Use '!shop' to view the shop, '!shop buy <item>' to buy, and '!shop sell <item> [quantity]' to sell.");
    }
}


module.exports = {
    handleInventoryCommand,
    handleShopCommand
};