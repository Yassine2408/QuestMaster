
#!/bin/bash

# Create a zip file of the project
zip -r questforge_bot.zip \
    index.js \
    backup.js \
    package.json \
    package-lock.json \
    rpg_data.json \
    README.md \
    .gitignore \
    backups/

echo "Project has been zipped to questforge_bot.zip"
