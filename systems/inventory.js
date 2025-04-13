const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');

// Handle inventory command
async function handleInventoryCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;

    // If no arguments, show full inventory
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

    // Create category filter menu
    const filterMenu = new StringSelectMenuBuilder()
        .setCustomId('inv_filter')
        .setPlaceholder('Filter by category')
        .addOptions([
            { label: 'All Items', value: 'all', emoji: '📦' },
            { label: 'Weapons', value: 'weapon', emoji: '⚔️' },
            { label: 'Armor', value: 'armor', emoji: '🛡️' },
            { label: 'Consumables', value: 'consumable', emoji: '🧪' },
            { label: 'Materials', value: 'material', emoji: '🪨' }
        ]);

    const searchRow = new ActionRowBuilder().addComponents(filterMenu);


    // Add inventory management help text
    inventoryEmbed.setFooter({ text: 'Use !inventory sort to sort items, !inventory search <term> to find items' });

    // Show inventory
    await message.channel.send({ embeds: [inventoryEmbed], components: [searchRow] });
    return;

}


// Handle shop command
async function handleShopCommand(message, playerData, args) {
    const ITEMS = require('../data/items');
    const CONFIG = require('../index').CONFIG;
    const SHOP_ITEMS = require('../data/shop'); // Assuming a shop.js file exists

    if (!args.length) {
        // Display shop items with interactive buttons
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor(CONFIG.embedColor)
            .setDescription(`Welcome to the shop! You have ${playerData.gold} ${CONFIG.currency}`);

        // Create category select menu
        const categorySelect = new StringSelectMenuBuilder()
            .setCustomId('shop_category')
            .setPlaceholder('Select category to view')
            .addOptions([
                { label: 'Weapons', value: 'weapon', emoji: '⚔️' },
                { label: 'Armor', value: 'armor', emoji: '🛡️' },
                { label: 'Consumables', value: 'consumable', emoji: '🧪' },
                { label: 'Pet Items', value: 'pet', emoji: '🐾' }
            ]);

        const selectRow = new ActionRowBuilder().addComponents(categorySelect);
        const msg = await message.channel.send({
            embeds: [shopEmbed],
            components: [selectRow]
        });

        // Handle category selection
        const filter = i => i.customId === 'shop_category' && i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            const category = i.values[0];
            const items = Object.values(ITEMS)
                .filter(item => item.type === category && SHOP_ITEMS.includes(item.id));

            const buttons = new ActionRowBuilder();
            items.slice(0, 5).forEach(item => {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`buy_${item.id}`)
                        .setLabel(`${item.name} (${item.value} 🪙)`)
                        .setStyle(ButtonStyle.Primary)
                );
            });

            await i.update({
                embeds: [shopEmbed.setDescription(`${category.charAt(0).toUpperCase() + category.slice(1)}s:\n` +
                    items.map(item => `${item.name}: ${item.value} 🪙`).join('\n'))],
                components: [selectRow, buttons]
            });

            // Add buy button interaction handling here.  This is incomplete in original changes.
            const buyFilter = (interaction) => interaction.customId.startsWith('buy_') && interaction.user.id === message.author.id;
            const buyCollector = msg.createMessageComponentCollector({ filter: buyFilter, time: 30000 });

            buyCollector.on('collect', async interaction => {
                const itemId = interaction.customId.substring(4);
                const item = ITEMS[itemId];
                if (playerData.gold >= item.value) {
                    playerData.gold -= item.value;
                    playerData.inventory[itemId] = (playerData.inventory[itemId] || 0) + 1;
                    // Save player data
                    require('../index').saveData();
                    await interaction.update({ content: `Purchased ${item.name}!`, components: [] });
                } else {
                    await interaction.update({ content: "Insufficient gold!", ephemeral: true });
                }
            });
        });
    } else {
        //Handle other shop commands (buy, sell)  -  Implementation left as an exercise
        message.reply("Other shop commands not yet implemented.");
    }
}


module.exports = {
    handleInventoryCommand,
    handleShopCommand
};