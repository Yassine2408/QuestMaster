#!/bin/bash
# Script to download all QuestForge Discord RPG Bot files

echo "Creating download directory..."
mkdir -p questforge_discord_bot

echo "Downloading main bot files..."
cp index.js questforge_discord_bot/
cp backup.js questforge_discord_bot/
cp README.md questforge_discord_bot/
cp package.json questforge_discord_bot/
cp package-lock.json questforge_discord_bot/

echo "Creating backup directory..."
mkdir -p questforge_discord_bot/backups

echo "Downloading any existing backup files..."
cp backups/* questforge_discord_bot/backups/ 2>/dev/null || echo "No backup files found (this is normal if you just started the bot)"

echo "Creating empty data file for initial setup..."
echo '{"players":{}}' > questforge_discord_bot/rpg_data.json

echo "Creating .gitignore file..."
echo "# Dependency directories
node_modules/

# Environment variables
.env

# Optional: Exclude player data if you don't want to share it publicly
# rpg_data.json" > questforge_discord_bot/.gitignore

echo "Done! All files have been copied to the 'questforge_discord_bot' directory."
echo "You can now upload these files to your GitHub repository."
echo ""
echo "To upload to GitHub, you'll need to:"
echo "1. Create a new repository on GitHub"
echo "2. Clone it to your computer"
echo "3. Copy these files into the cloned repository"
echo "4. Add, commit, and push the files to GitHub"