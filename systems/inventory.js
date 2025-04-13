const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ApplicationCommandType } = require('discord.js');
const ITEMS = require('../data/items');
const { CLASSES } = require('../data/classes');

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
    if (!args.length) {
        // Create category buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_weapons')
                    .setLabel('⚔️ Weapons')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_armor')
                    .setLabel('🛡️ Armor')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_consumables')
                    .setLabel('🧪 Consumables')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_pets')
                    .setLabel('🐾 Pet Items')
                    .setStyle(ButtonStyle.Primary)
            );

        // Display shop items based on player's class
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor('#7289DA')
            .setDescription(`Welcome to the shop! You have ${playerData.gold} 🪙\n\nSelect a category to view items.`);

        // Filter and group items by category and class requirements
        const categories = {
            Weapons: [],
            Armor: [],
            Consumables: [],
            Pets: []
        };

        for (const [itemId, item] of Object.entries(ITEMS)) {
            if (!item.value) continue; // Skip items that can't be bought

            // Check class restrictions if they exist
            if (item.classRestrictions && !item.classRestrictions.includes(playerData.class)) {
                continue;
            }

            let itemText = `**${item.name}** - ${item.description}\nPrice: ${item.value} 🪙\n`;

            if (item.requirements) {
                itemText += `Level Required: ${item.requirements.level}\n`;
            }

            if (item.type === 'weapon') {
                itemText += `Attack: +${item.power}\n`;
                categories.Weapons.push(itemText);
            } else if (item.type === 'armor') {
                itemText += `Defense: +${item.defense}\n`;
                categories.Armor.push(itemText);
            } else if (item.type === 'consumable') {
                if (item.effect) {
                    itemText += `Effect: ${item.effect} (+${item.power})\n`;
                }
                categories.Consumables.push(itemText);
            } else if (item.type === 'pet') {
                categories.Pets.push(itemText);
            }
        }

        // Add categories to embed
        for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
                shopEmbed.addFields({
                    name: `📦 ${category}`,
                    value: items.join('\n').slice(0, 1024),
                    inline: false
                });
            }
        }

        const msg = await message.channel.send({
            embeds: [shopEmbed],
            components: [row]
        });

        // Create collector for button interactions
        const collector = msg.createMessageComponentCollector({
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: 'Only the command user can use these buttons!', ephemeral: true });
            }

            const category = i.customId.split('_')[1];
            const filteredItems = filterItemsByCategory(category, playerData);
            const categoryEmbed = createCategoryEmbed(category, playerData, filteredItems);

            await i.update({
                embeds: [categoryEmbed],
                components: createItemButtons(filteredItems)
            });
        });

        return;
    }

    // Handle buy/sell commands
    const action = args[0].toLowerCase();
    if (action === 'buy') {
        if (!args[1]) {
            return message.reply('Please specify an item to buy. Use `!shop` to see available items.');
        }

        const itemId = args[1].toLowerCase();
        const item = ITEMS[itemId];

        if (!item || !item.value) {
            return message.reply('That item is not available in the shop.');
        }

        // Check class restrictions
        if (item.classRestrictions && !item.classRestrictions.includes(playerData.class)) {
            return message.reply('Your class cannot use this item.');
        }

        // Check level requirement
        if (item.requirements && playerData.level < item.requirements.level) {
            return message.reply(`You need to be level ${item.requirements.level} to purchase this item.`);
        }

        // Check if player has enough gold
        if (playerData.gold < item.value) {
            return message.reply(`You don't have enough gold to buy ${item.name}.`);
        }

        // Process purchase
        playerData.gold -= item.value;
        addItemToInventory(playerData, itemId);
        return message.reply(`You purchased ${item.name} for ${item.value} 🪙.`);
    }

    if (action === 'sell') {
        if (!args[1]) {
            return message.reply('Please specify an item to sell.');
        }

        const itemId = args[1].toLowerCase();
        const quantity = args[2] ? parseInt(args[2]) : 1;

        if (!playerData.inventory[itemId] || playerData.inventory[itemId] < quantity) {
            return message.reply(`You don't have enough of this item to sell.`);
        }

        const item = ITEMS[itemId];
        const sellValue = Math.floor(item.value * 0.6) * quantity;

        // Process sale
        removeItemFromInventory(playerData, itemId, quantity);
        playerData.gold += sellValue;
        return message.reply(`You sold ${quantity}x ${item.name} for ${sellValue} 🪙.`);
    }
}

function filterItemsByCategory(category, playerData) {
    return Object.entries(ITEMS).filter(([id, item]) => {
        if (!item.value) return false;
        if (item.classRestrictions && !item.classRestrictions.includes(playerData.class)) return false;

        switch (category) {
            case 'weapons': return item.type === 'weapon';
            case 'armor': return item.type === 'armor';
            case 'consumables': return item.type === 'consumable';
            case 'pets': return item.type === 'pet';
            default: return false;
        }
    });
}

function createCategoryEmbed(category, playerData, items) {
    return new EmbedBuilder()
        .setTitle(`🛒 ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        .setColor('#7289DA')
        .setDescription(`Your gold: ${playerData.gold} 🪙\nClick an item to purchase it.`)
        .addFields(
            items.map(([id, item]) => ({
                name: item.name,
                value: `Price: ${item.value} 🪙\n${item.description}`,
                inline: true
            }))
        );
}

function createItemButtons(items) {
    const rows = [];
    let currentRow = new ActionRowBuilder();
    let buttonCount = 0;

    items.forEach(([id, item]) => {
        if (buttonCount === 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonCount = 0;
        }

        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`buy_${id}`)
                .setLabel(`${item.name} (${item.value} 🪙)`)
                .setStyle(ButtonStyle.Secondary)
        );
        buttonCount++;
    });

    if (buttonCount > 0) {
        rows.push(currentRow);
    }

    return rows;
}

function addItemToInventory(playerData, itemId) {
    playerData.inventory[itemId] = (playerData.inventory[itemId] || 0) + 1;
}


function removeItemFromInventory(playerData, itemId, quantity) {
    playerData.inventory[itemId] -= quantity;
    if (playerData.inventory[itemId] <= 0) {
        delete playerData.inventory[itemId];
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