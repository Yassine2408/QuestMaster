module.exports = {
    // Bot Configuration
    prefix: '!',
    defaultCooldown: 300, // 5 minutes in seconds
    maxPartySize: 4,
    
    // Economy Settings
    startingGold: 100,
    dailyReward: 50,
    maxGold: 1000000,
    
    // XP Settings
    baseXP: 100,
    xpMultiplier: 1.5,
    maxLevel: 100,
    
    // Combat Settings
    baseHealth: 100,
    healthPerLevel: 10,
    baseDamage: 10,
    damagePerLevel: 2,
    
    // Resource Settings
    resourceCooldowns: {
        farm: 300,    // 5 minutes
        mine: 300,    // 5 minutes
        hunt: 300,    // 5 minutes
        fish: 300,    // 5 minutes
        adventure: 600 // 10 minutes
    },
    
    // Backup Settings
    backupInterval: 300000, // 5 minutes in milliseconds
    maxBackups: 10,
    
    // Achievement Settings
    achievements: {
        firstAdventure: { name: "First Adventure", reward: 100 },
        level10: { name: "Level 10", reward: 500 },
        level25: { name: "Level 25", reward: 1000 },
        level50: { name: "Level 50", reward: 5000 },
        rich: { name: "Rich!", reward: 10000, condition: "gold >= 100000" }
    }
}; 