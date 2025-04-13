// Helper utility functions for RPG Discord bot

// Get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate XP required for a given level
function getXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Format relative time, e.g. "3 hours ago"
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
}

// Format time duration, e.g. "2h 15m"
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Get party ID for a player
function getPartyIdForPlayer(parties, playerId) {
    for (const [partyId, party] of Object.entries(parties)) {
        if (party.members.includes(playerId)) {
            return partyId;
        }
    }
    return null;
}

// Generate a unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Chunk an array into smaller arrays
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

// Capitalize first letter of a string
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Safely parse JSON with fallback
function safeJSONParse(data, fallback = {}) {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return fallback;
    }
}

// Deep copy an object
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Get progress bar string
function getProgressBar(current, max, length = 10, filled = '█', empty = '░') {
    const percentage = current / max;
    const filledLength = Math.round(length * percentage);
    const emptyLength = length - filledLength;
    
    return filled.repeat(filledLength) + empty.repeat(emptyLength);
}

// Convert milliseconds to a readable cooldown string
function formatCooldown(ms) {
    if (ms <= 0) return 'Ready now';
    
    const seconds = Math.ceil(ms / 1000);
    
    if (seconds < 60) {
        return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
}

// Filter sensitive data from object for debug logs
function filterSensitiveData(obj) {
    const filtered = { ...obj };
    
    // Remove any fields that might contain tokens or passwords
    const sensitiveFields = ['token', 'password', 'secret', 'auth', 'key'];
    
    for (const field of sensitiveFields) {
        if (filtered[field]) {
            filtered[field] = '[REDACTED]';
        }
    }
    
    return filtered;
}

// Convert a command name to a normalized format
function normalizeCommand(cmd) {
    cmd = cmd.toLowerCase().trim();
    
    // Map common abbreviations to full commands
    const commandMap = {
        'inv': 'inventory',
        'adv': 'adventure',
        'bal': 'balance',
        'lb': 'leaderboard',
        'notifs': 'notifications'
    };
    
    return commandMap[cmd] || cmd;
}

// Determine if two players can form a party (level check)
function canFormParty(player1, player2, maxLevelDifference = 5) {
    return Math.abs(player1.level - player2.level) <= maxLevelDifference;
}

// Calculate sell value for an item
function getSellValue(item) {
    return Math.floor(item.value * 0.6); // 60% of buy value
}

module.exports = {
    getRandomInt,
    getXpForLevel,
    formatTimeAgo,
    formatDuration,
    getPartyIdForPlayer,
    generateId,
    chunkArray,
    capitalizeFirst,
    safeJSONParse,
    deepCopy,
    getProgressBar,
    formatCooldown,
    filterSensitiveData,
    normalizeCommand,
    canFormParty,
    getSellValue
};
