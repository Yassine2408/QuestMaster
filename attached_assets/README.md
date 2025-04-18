# QuestForge Discord RPG Bot

A Discord RPG game bot where users can farm resources, gain XP, level up, and trade items using Discord commands.

## Features

- Resource gathering (farming, mining, hunting, fishing)
- Character leveling system
- Inventory management
- Economy system with shop for buying and selling items
- Crafting system
- Equipment system
- Adventure mode with combat
- Party system for cooperative adventures
- Leaderboard system
- Automatic data backup system

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
- `!adventure [location]` - Go on a solo adventure
- `!heal` - Heal your character (costs gold)
- `!leaderboard` - View the player leaderboard

### Party System
- `!party` or `!party status` - View your party status
- `!party invite @player` - Invite a player to your party (must be within 3 levels)
- `!party accept @player` - Accept a party invitation
- `!party leave` - Leave your current party
- `!party adventure [location]` - Go on an adventure with your party

## Data Persistence

The bot automatically saves player data to a file named `rpg_data.json` every 5 minutes. This ensures player progress is preserved even if the bot restarts.

## Notes

- Players start with 100 gold
- Resources can be gathered periodically with cooldown timers between attempts
- Items can be crafted using gathered resources
- Players can equip weapons and armor to improve their combat abilities
- Adventures have level requirements and feature combat against enemies
- Party system allows 2 players to team up and adventure together
- Party members share rewards and have improved chances of loot
- Party members must be within 3 levels of each other
- The bot automatically backs up player data to protect against data loss

## Keeping the Bot Online 24/7

This bot includes a simple web server that can be pinged by UptimeRobot to keep it running continuously, even on a free Replit account:

1. Sign up for a free account at [UptimeRobot](https://uptimerobot.com/)
2. Create a new monitor with these settings:
   - Monitor Type: HTTP(s)
   - Friendly Name: QuestForge Discord Bot (or your preferred name)
   - URL: Your Replit URL (e.g., https://your-bot-name.your-username.repl.co)
   - Monitoring Interval: 5 minutes

This will keep your bot online by pinging it every 5 minutes, preventing it from going to sleep.
