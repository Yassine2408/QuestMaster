const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');

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
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Item Shop')
            .setColor(CONFIG.embedColor)
            .setDescription(`Your gold: ${playerData.gold} ${CONFIG.currency}`);

        const categories = {
            '⚔️ Weapons': [],
            '🛡️ Armor': [],
            '🧪 Consumables': [],
            '🐾 Pet Items': []
        };

        Object.entries(ITEMS).forEach(([id, item]) => {
            if (!item.value) return;

            let category;
            if (item.type === 'weapon') category = '⚔️ Weapons';
            else if (item.type === 'armor') category = '🛡️ Armor';
            else if (item.type === 'consumable') category = '🧪 Consumables';
            else if (item.type === 'pet') category = '🐾 Pet Items';
            else return;

            let itemDesc = `**${item.name}** - ${item.value} ${CONFIG.currency}\n`;
            if (item.power) itemDesc += `Attack: +${item.power}\n`;
            if (item.defense) itemDesc += `Defense: +${item.defense}\n`;
            if (item.requirements) itemDesc += `Required Level: ${item.requirements.level}\n`;
            itemDesc += `${item.description}\n`;

            categories[category].push(itemDesc);
        });

        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                shopEmbed.addFields({
                    name: category,
                    value: items.join('\n') || 'No items available',
                    inline: false
                });
            }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('shop_category')
                    .setPlaceholder('Select category to view')
                    .addOptions([
                        { label: 'Weapons', value: 'weapon', emoji: '⚔️' },
                        { label: 'Armor', value: 'armor', emoji: '🛡️' },
                        { label: 'Consumables', value: 'consumable', emoji: '🧪' },
                        { label: 'Pet Items', value: 'pet', emoji: '🐾' }
                    ])
            );

        return message.channel.send({ embeds: [shopEmbed], components: [row] });
    }

    // Handle buy/sell commands here...
}

module.exports = {
    handleInventoryCommand,
    handleShopCommand
};