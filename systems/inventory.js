const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ApplicationCommandType } = require('discord.js');

async function handleInventoryCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;

    if (Object.keys(playerData.inventory).length === 0) {
        return message.reply("Your inventory is empty.");
    }

    const categories = {
        weapon: [],
        armor: [],
        material: [],
        consumable: [],
        pet: [],
        special: []
    };

    let totalValue = 0;

    for (const [itemId, quantity] of Object.entries(playerData.inventory)) {
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

    const inventoryEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Inventory`)
        .setColor(CONFIG.embedColor)
        .setDescription(`You have ${Object.keys(playerData.inventory).length} unique items\nTotal value: ${totalValue} ${CONFIG.currency}`);

    if (playerData.equipped.weapon || playerData.equipped.armor) {
        let equippedText = '';
        if (playerData.equipped.weapon) {
            equippedText += `⚔️ **Weapon**: ${ITEMS[playerData.equipped.weapon].name} (+${ITEMS[playerData.equipped.weapon].power} ATK)\n`;
        }
        if (playerData.equipped.armor) {
            equippedText += `🛡️ **Armor**: ${ITEMS[playerData.equipped.armor].name} (+${ITEMS[playerData.equipped.armor].defense} DEF)`;
        }
        inventoryEmbed.addFields({ name: 'Equipped Items', value: equippedText });
    }

    for (const [category, items] of Object.entries(categories)) {
        if (items.length > 0) {
            items.sort((a, b) => b.value - a.value);
            let categoryText = '';
            items.forEach(item => {
                categoryText += `**${item.name}** (${item.quantity}x)\n`;
                categoryText += `┗ Worth: ${item.value} ${CONFIG.currency} each\n`;
            });

            if (categoryText) {
                const emoji = {
                    weapon: '⚔️',
                    armor: '🛡️',
                    material: '🪨',
                    consumable: '🧪',
                    pet: '🐾',
                    special: '✨'
                }[category] || '📦';

                inventoryEmbed.addFields({
                    name: `${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}s`,
                    value: categoryText
                });
            }
        }
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('sort_value')
                .setLabel('Sort by Value')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('sort_name')
                .setLabel('Sort by Name')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.channel.send({ embeds: [inventoryEmbed], components: [row] });
}

async function handleShopCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;
    const { saveData } = require('../index');

    if (!args.length) {
        // Display shop items with buttons
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor(CONFIG.embedColor)
            .setDescription(`Your gold: ${playerData.gold} ${CONFIG.currency}\n\nClick on items to view details and purchase!`);

        // Group items by category
        const categories = {
            'Weapons': [],
            'Armor': [],
            'Consumables': [],
            'Pet Items': []
        };

        // Sort items into categories
        Object.entries(ITEMS).forEach(([itemId, item]) => {
            if (!item.value) return; // Skip items that can't be bought

            let category;
            if (item.type === 'weapon') category = 'Weapons';
            else if (item.type === 'armor') category = 'Armor';
            else if (item.type === 'consumable') category = 'Consumables';
            else if (item.type === 'pet') category = 'Pet Items';
            else return;

            categories[category].push({
                id: itemId,
                ...item
            });
        });

        const rows = [];
        
        // Create select menus for each category
        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`shop_${category.toLowerCase()}`)
                    .setPlaceholder(`Browse ${category}`)
                    .addOptions(
                        items.map(item => ({
                            label: item.name,
                            description: `${item.value} ${CONFIG.currency}${item.requirements ? ` - Requires Level ${item.requirements.level}` : ''}`,
                            value: item.id
                        }))
                    );

                rows.push(new ActionRowBuilder().addComponents(selectMenu));
            }
        });

        // Add a close button
        const closeButton = new ButtonBuilder()
            .setCustomId('shop_close')
            .setLabel('Close Shop')
            .setStyle(ButtonStyle.Danger);

        rows.push(new ActionRowBuilder().addComponents(closeButton));

        const shopMessage = await message.channel.send({
            embeds: [shopEmbed],
            components: rows
        });

        // Create collector for interactions
        const collector = shopMessage.createMessageComponentCollector({
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (interaction) => {
            if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

            // Handle close button
            if (interaction.customId === 'shop_close') {
                collector.stop();
                await shopMessage.delete().catch(console.error);
                return;
            }

            // Handle category selection
            if (interaction.isStringSelectMenu()) {
                const selectedItemId = interaction.values[0];
                const item = ITEMS[selectedItemId];

                if (!item) return;

                // Check if player can afford the item
                if (playerData.gold < item.value) {
                    await interaction.reply({ 
                        content: `You don't have enough gold! You need ${item.value} ${CONFIG.currency}.`,
                        ephemeral: true 
                    });
                    return;
                }

                // Check level requirement
                if (item.requirements && playerData.level < item.requirements.level) {
                    await interaction.reply({ 
                        content: `You need to be level ${item.requirements.level} to buy this item!`,
                        ephemeral: true 
                    });
                    return;
                }

                // Create confirmation buttons
                const confirmRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_buy_${selectedItemId}`)
                            .setLabel('Confirm Purchase')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancel_buy')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );

                // Show confirmation message
                const confirmMsg = await interaction.reply({
                    content: `Are you sure you want to buy ${item.name} for ${item.value} ${CONFIG.currency}?`,
                    components: [confirmRow],
                    ephemeral: true
                });

                // Create collector for confirmation
                const confirmCollector = confirmMsg.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id,
                    time: 30000,
                    max: 1
                });

                confirmCollector.on('collect', async (confirmInteraction) => {
                    if (confirmInteraction.customId === `confirm_buy_${selectedItemId}`) {
                        // Process purchase
                        playerData.gold -= item.value;
                        require('../index').addItemToInventory(playerData, selectedItemId);
                        saveData();

                        await confirmInteraction.update({
                            content: `Successfully purchased ${item.name} for ${item.value} ${CONFIG.currency}!`,
                            components: []
                        });

                        // Update shop embed with new gold amount
                        shopEmbed.setDescription(`Your gold: ${playerData.gold} ${CONFIG.currency}\n\nClick on items to view details and purchase!`);
                        await shopMessage.edit({ embeds: [shopEmbed] });
                    } else {
                        await confirmInteraction.update({
                            content: 'Purchase cancelled.',
                            components: []
                        });
                    }
                });
            }
        });

        collector.on('end', async () => {
            if (!shopMessage.deleted) {
                await shopMessage.edit({ 
                    content: 'Shop closed.',
                    components: [] 
                });
            }
        });
    }
}
}


async function handleCraftCommand(message, playerData, args) {
    // Import recipes
    const RECIPES = require('../data/items').RECIPES;
    const ITEMS = require('../data/items');

    if (!args.length) {
        // Display available recipes with buttons
        const recipesEmbed = new EmbedBuilder()
            .setTitle('⚒️ Crafting Recipes')
            .setColor(CONFIG.embedColor)
            .setDescription('Click a button to craft an item:');

        const buttonRows = [];
        let currentRow = new ActionRowBuilder();
        let buttonCount = 0;

        for (const [recipeId, recipe] of Object.entries(RECIPES)) {
            const resultItem = ITEMS[recipe.result];

            // Add recipe description
            let recipeDesc = `**${resultItem.name}**\nRequires:\n`;
            for (const [materialId, quantity] of Object.entries(recipe.materials)) {
                recipeDesc += `- ${ITEMS[materialId].name}: ${quantity}\n`;
            }
            recipesEmbed.addFields({ 
                name: resultItem.name, 
                value: recipeDesc,
                inline: true 
            });

            // Add craft button
            currentRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`craft_${recipeId}`)
                    .setLabel(`Craft ${resultItem.name}`)
                    .setStyle(ButtonStyle.Primary)
            );

            buttonCount++;
            if (buttonCount === 5) { // Max 5 buttons per row
                buttonRows.push(currentRow);
                currentRow = new ActionRowBuilder();
                buttonCount = 0;
            }
        }

        // Add remaining buttons if any
        if (buttonCount > 0) {
            buttonRows.push(currentRow);
        }

        // Send embed with buttons
        await message.channel.send({ 
            embeds: [recipesEmbed],
            components: buttonRows
        });
    }
    //Handle crafting logic here.
}

module.exports = {
    handleInventoryCommand,
    handleShopCommand,
    handleCraftCommand
};