const express = require('express');
const app = express();

// Import your Discord bot
require('./index.js');

// Basic route to show the bot is running
app.get('/', (req, res) => {
    res.send('Discord bot is running!');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app; 