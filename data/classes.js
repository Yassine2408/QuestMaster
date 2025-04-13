
// Class definitions for RPG Discord bot

const CLASSES = {
  warrior: {
    name: 'Warrior',
    description: 'Masters of combat who rely on strength and heavy armor',
    lore: 'Warriors are descendants of the ancient Ironheart clan, who defended the realm during the Age of Chaos. Their unwavering spirit and combat mastery have been passed down through generations.',
    baseStats: {
      strength: 8,
      defense: 7,
      maxHealth: 120,
      criticalChance: 0.05
    },
    advantages: [
      'Higher base health and defense',
      'Bonus damage with heavy weapons',
      'Reduced damage taken from physical attacks'
    ],
    disadvantages: [
      'Lower mobility',
      'Weak against magical attacks',
      'Higher potion cooldown'
    ],
    abilities: {
      battleCry: {
        name: 'Battle Cry',
        description: 'Increases strength by 20% for 3 turns',
        unlockLevel: 5,
        cooldown: 4
      },
      shieldWall: {
        name: 'Shield Wall',
        description: 'Reduces incoming damage by 50% for 1 turn',
        unlockLevel: 10,
        cooldown: 5
      }
    }
  },
  ranger: {
    name: 'Ranger',
    description: 'Swift hunters who excel at ranged combat and evasion',
    lore: 'Rangers trace their origins to the Shadowleaf tribes, who mastered the art of surviving in the harsh wilderness. Their connection to nature grants them unique abilities in combat and exploration.',
    baseStats: {
      strength: 6,
      defense: 5,
      maxHealth: 100,
      criticalChance: 0.15
    },
    advantages: [
      'Higher critical hit chance',
      'Better rewards from hunting',
      'Chance to dodge attacks'
    ],
    disadvantages: [
      'Lower base defense',
      'Less effective with heavy weapons',
      'Reduced gold from selling items'
    ],
    abilities: {
      preciseShot: {
        name: 'Precise Shot',
        description: 'Guaranteed critical hit with 150% damage',
        unlockLevel: 5,
        cooldown: 3
      },
      swiftShadow: {
        name: 'Swift Shadow',
        description: '75% chance to dodge next attack',
        unlockLevel: 10,
        cooldown: 4
      }
    }
  },
  mage: {
    name: 'Mage',
    description: 'Spellcasters who harness arcane power for devastating attacks',
    lore: 'Mages belong to the ancient Order of the Crystalline Mind, scholars who unlocked the secrets of magic through decades of study. Their power comes at the cost of physical fragility.',
    baseStats: {
      strength: 4,
      defense: 4,
      maxHealth: 90,
      magicPower: 10
    },
    advantages: [
      'High magical damage',
      'Better potion effectiveness',
      'Bonus experience gain'
    ],
    disadvantages: [
      'Lower health and defense',
      'Weak physical attacks',
      'Higher ability cooldowns'
    ],
    abilities: {
      arcaneBlast: {
        name: 'Arcane Blast',
        description: 'Deals 200% magic damage, ignoring defense',
        unlockLevel: 5,
        cooldown: 3
      },
      manaBurst: {
        name: 'Mana Burst',
        description: 'Converts 20% of max health to double damage for 2 turns',
        unlockLevel: 10,
        cooldown: 6
      }
    }
  }
};

module.exports = {
  CLASSES
};
