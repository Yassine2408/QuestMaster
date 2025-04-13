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

    if (!args.length) {
        // Display shop items with buttons
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor(CONFIG.embedColor)
            .setDescription(`Your gold: ${playerData.gold} ${CONFIG.currency}`);

        // Group items by category with buttons
        const categories = {
            'Weapons': [],
            'Armor': [],
            'Consumables': [],
            'Pet Items': []
        };

        // Create button rows for each category
        const buttonRows = [];
        Object.entries(ITEMS).forEach(([itemId, item]) => {
            if (!item.value) return; // Skip items that can't be bought

            let category;
            if (item.type === 'weapon') category = 'Weapons';
            else if (item.type === 'armor') category = 'Armor';
            else if (item.type === 'consumable') category = 'Consumables';
            else if (item.type === 'pet') category = 'Pet Items';
            else return;

            let itemDesc = `${item.name} - ${item.value} ${CONFIG.currency}\n`;
            if (item.power) itemDesc += `Attack: +${item.power}\n`;
            if (item.defense) itemDesc += `Defense: +${item.defense}\n`;
            if (item.requirements) itemDesc += `Required Level: ${item.requirements.level}\n`;

            categories[category].push({
                desc: itemDesc,
                id: itemId
            });
        });

        // Add each category
        for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
                shopEmbed.addFields({ 
                    name: category, 
                    value: items.map(i => i.desc).join('\n'),
                    inline: false 
                });

                // Create button row for this category
                const row = new ActionRowBuilder();
                items.forEach(item => {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`buy_${item.id}`)
                            .setLabel(`Buy ${ITEMS[item.id].name}`)
                            .setStyle(ButtonStyle.Success)
                    );
                });
                buttonRows.push(row);
            }
        }

        // Send embed with buttons
        await message.channel.send({ 
            embeds: [shopEmbed],
            components: buttonRows.slice(0, 5) // Discord allows max 5 button rows
        });
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