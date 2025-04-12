# Discord RPG Bot

A Discord RPG game bot where users can farm resources, gain XP, level up, and trade items using Discord commands.

## Features

- Resource gathering (farming, mining, hunting, fishing)
- Character leveling system
- Inventory management
- Economy system with shop for buying and selling items
- Crafting system
- Equipment system
- Adventure mode with combat
- Leaderboard system

## Setup Instructions

### Prerequisites

- Node.js installed
- A Discord bot token ([How to create a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html))

### Setup on Replit

1. Create a new Replit project
2. Upload the `index.js` file to your Replit project
3. Add your Discord bot token as an environment variable:
   - Click on the padlock icon (Secrets) in the Tools panel
   - Add a new secret with key `DISCORD_TOKEN` and your bot token as the value
4. Click the Run button to start your bot
5. Invite your bot to your Discord server with the necessary permissions

### Required Permissions

When creating the invite link for your bot, make sure to grant the following permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Read Message History

## Commands

### Basic Commands
- `!profile` - View your character profile
- `!inventory` - View your inventory
- `!balance` - Check your gold balance
- `!help` - Show help message

### Resource Gathering
- `!farm` - Gather wood and herbs
- `!mine` - Mine for stones and minerals
- `!hunt` - Hunt for leather and fur
- `!fish` - Fish for... fish!

### Economy
- `!shop` - View the item shop
- `!shop buy <item>` - Buy an item
- `!shop sell <item> [quantity]` - Sell an item

### Crafting
- `!craft` - View available crafting recipes
- `!craft <item>` - Craft an item

### Equipment
- `!equip <item>` - Equip a weapon or armor
- `!unequip <weapon|armor>` - Unequip an item
- `!use <item>` - Use a consumable item

### Adventure
- `!adventure [location]` - Go on an adventure
- `!heal` - Heal your character (costs gold)
- `!leaderboard` - View the player leaderboard

## Data Persistence

The bot automatically saves player data to a file named `rpg_data.json` every 5 minutes. This ensures player progress is preserved even if the bot restarts.

## Notes

- Players start with 100 gold
- Resources can be gathered periodically with cooldown timers between attempts
- Items can be crafted using gathered resources
- Players can equip weapons and armor to improve their combat abilities
- Adventures have level requirements and feature combat against enemies
