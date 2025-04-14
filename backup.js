<<<<<<< HEAD
// Enhanced backup script for RPG data
=======
// Backup script for RPG data
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
const fs = require('fs');
const path = require('path');

// Configuration
const DATA_FILE = 'rpg_data.json';
const BACKUP_DIR = './backups';
<<<<<<< HEAD
const MAX_BACKUPS = 15; // Increased maximum number of backup files to keep
const LOG_FILE = path.join(BACKUP_DIR, 'backup.log');
=======
const MAX_BACKUPS = 10; // Maximum number of backup files to keep
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

<<<<<<< HEAD
// Log function for backup events
function logBackupEvent(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Error writing to backup log:', error);
  }
  
  console.log(message);
}

=======
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
function createBackup() {
  try {
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
<<<<<<< HEAD
      logBackupEvent(`Data file ${DATA_FILE} does not exist yet. Nothing to backup.`);
      return false;
=======
      console.log(`Data file ${DATA_FILE} does not exist yet. Nothing to backup.`);
      return;
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
    }

    // Create timestamp for backup filename
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
    const backupFileName = `backup_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
<<<<<<< HEAD
    // Read the source file
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    
    // Validate JSON before backup
    try {
      JSON.parse(data);
    } catch (err) {
      logBackupEvent(`ERROR: Data file contains invalid JSON. Backup aborted.`);
      
      // Create corrupted file backup with different name pattern
      const corruptedBackupPath = path.join(BACKUP_DIR, `corrupted_${timestamp}.json`);
      fs.writeFileSync(corruptedBackupPath, data);
      logBackupEvent(`Saved corrupted data to ${corruptedBackupPath} for inspection`);
      
      return false;
    }
    
    // Copy the data file to the backup location
    fs.writeFileSync(backupPath, data);
    logBackupEvent(`Created backup: ${backupFileName}`);
    
    // Clean up old backups if we have too many
    cleanupOldBackups();
    
    return true;
  } catch (error) {
    logBackupEvent(`ERROR creating backup: ${error.message}`);
    return false;
=======
    // Copy the data file to the backup location
    fs.copyFileSync(DATA_FILE, backupPath);
    console.log(`Created backup: ${backupFileName}`);
    
    // Clean up old backups if we have too many
    cleanupOldBackups();
  } catch (error) {
    console.error('Error creating backup:', error);
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
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
<<<<<<< HEAD
        logBackupEvent(`Removed old backup: ${file.name}`);
      });
    }
  } catch (error) {
    logBackupEvent(`ERROR cleaning up old backups: ${error.message}`);
  }
}

function restoreBackup(backupFileName) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      logBackupEvent(`Backup file ${backupFileName} does not exist. Cannot restore.`);
      return false;
    }
    
    // Create backup of current data first
    createBackup();
    
    // Copy the backup file to the data location
    fs.copyFileSync(backupPath, DATA_FILE);
    logBackupEvent(`Restored from backup: ${backupFileName}`);
    
    return true;
  } catch (error) {
    logBackupEvent(`ERROR restoring backup: ${error.message}`);
    return false;
  }
}

function listBackups() {
  try {
    // Get all backup files
    return fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
        size: fs.statSync(path.join(BACKUP_DIR, file)).size
      }))
      .sort((a, b) => b.time - a.time); // Sort newest to oldest
  } catch (error) {
    logBackupEvent(`ERROR listing backups: ${error.message}`);
    return [];
  }
}

// Create a backup immediately when script is run directly
if (require.main === module) {
  logBackupEvent('Manual backup initiated');
  createBackup();
  logBackupEvent('Backup complete!');
}

// Export the backup functions so they can be used in other files
module.exports = { 
  createBackup,
  restoreBackup,
  listBackups
};
=======
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
>>>>>>> 4533471f96616676b5aa5f5449e6a9c3b372163c
