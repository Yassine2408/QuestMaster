// Backup script for RPG data
const fs = require('fs');
const path = require('path');

// Configuration
const DATA_FILE = 'rpg_data.json';
const BACKUP_DIR = './backups';
const MAX_BACKUPS = 10; // Maximum number of backup files to keep

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

function createBackup() {
  try {
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.log(`Data file ${DATA_FILE} does not exist yet. Nothing to backup.`);
      return;
    }

    // Create timestamp for backup filename
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
    const backupFileName = `backup_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Copy the data file to the backup location
    fs.copyFileSync(DATA_FILE, backupPath);
    console.log(`Created backup: ${backupFileName}`);
    
    // Clean up old backups if we have too many
    cleanupOldBackups();
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

function cleanupOldBackups() {
  try {
    // Get all backup files
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort newest to oldest
    
    // Remove oldest backups if we have more than MAX_BACKUPS
    if (backupFiles.length > MAX_BACKUPS) {
      const filesToRemove = backupFiles.slice(MAX_BACKUPS);
      filesToRemove.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Removed old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

// Create a backup immediately when script is run
createBackup();

// Export the backup function so it can be used in other files
module.exports = { createBackup };

console.log('Backup complete!');