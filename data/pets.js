// Pets data for RPG Discord bot

// Define all pets that can be obtained in the game
const PETS = [
  {
    type: 'dog',
    name: 'Dog',
    description: 'A loyal companion that helps find items',
    rarity: 'common',
    emoji: '🐕',
    abilities: [
      {
        name: 'Keen Nose',
        description: 'Increases chance of finding rare items when farming',
        level: 3,
        type: 'passive',
        effect: 'farming_bonus'
      },
      {
        name: 'Loyal Guardian',
        description: 'Reduces damage taken in combat by 5%',
        level: 8,
        type: 'passive',
        effect: 'defense_bonus'
      },
      {
        name: 'Helpful Bark',
        description: 'Has a chance to scare enemies at the start of combat',
        level: 15,
        type: 'combat_start',
        effect: 'damage',
        power: 5
      }
    ]
  },
  {
    type: 'cat',
    name: 'Cat',
    description: 'A nimble pet that improves hunting',
    rarity: 'common',
    emoji: '🐈',
    abilities: [
      {
        name: 'Stealth',
        description: 'Increases rewards from hunting',
        level: 3,
        type: 'passive',
        effect: 'hunting_bonus'
      },
      {
        name: 'Quick Reflexes',
        description: 'Increases your dodge chance in combat',
        level: 8,
        type: 'passive',
        effect: 'dodge_bonus'
      },
      {
        name: 'Pounce',
        description: 'Attacks an enemy at the start of combat',
        level: 15,
        type: 'combat_start',
        effect: 'damage',
        power: 8
      }
    ]
  },
  {
    type: 'bird',
    name: 'Falcon',
    description: 'A hawk-eyed pet that helps in exploration',
    rarity: 'common',
    emoji: '🦅',
    abilities: [
      {
        name: 'Scout Ahead',
        description: 'Occasionally finds additional rewards during adventures',
        level: 3,
        type: 'passive',
        effect: 'adventure_bonus'
      },
      {
        name: 'Aerial Surveillance',
        description: 'Increases chance of escaping combat',
        level: 8,
        type: 'passive',
        effect: 'escape_bonus'
      },
      {
        name: 'Dive Attack',
        description: 'Swoops down to attack an enemy at the start of combat',
        level: 15,
        type: 'combat_start',
        effect: 'damage',
        power: 10
      }
    ]
  },
  {
    type: 'rabbit',
    name: 'Rabbit',
    description: 'A lucky pet that increases gold finds',
    rarity: 'common',
    emoji: '🐇',
    abilities: [
      {
        name: 'Lucky Foot',
        description: 'Increases gold found from all sources',
        level: 3,
        type: 'passive',
        effect: 'gold_bonus'
      },
      {
        name: 'Quick Escape',
        description: 'Greatly increases chance of escaping combat',
        level: 8,
        type: 'passive',
        effect: 'escape_bonus'
      },
      {
        name: 'Carrot Power',
        description: 'Occasionally heals you during combat',
        level: 15,
        type: 'passive',
        effect: 'healing',
        power: 5
      }
    ]
  },
  {
    type: 'fox',
    name: 'Fox',
    description: 'A crafty pet that improves farming and scavenging',
    rarity: 'uncommon',
    emoji: '🦊',
    abilities: [
      {
        name: 'Resourceful',
        description: 'Increases resources gained from farming',
        level: 3,
        type: 'passive',
        effect: 'farming_bonus'
      },
      {
        name: 'Cunning',
        description: 'Occasionally finds extra items during adventures',
        level: 8,
        type: 'passive',
        effect: 'loot_bonus'
      },
      {
        name: 'Sneak Attack',
        description: 'Attacks with surprise at the start of combat',
        level: 12,
        type: 'combat_start',
        effect: 'damage',
        power: 12
      }
    ]
  },
  {
    type: 'wolf',
    name: 'Wolf',
    description: 'A fierce companion that excels in combat',
    rarity: 'uncommon',
    emoji: '🐺',
    abilities: [
      {
        name: 'Pack Tactics',
        description: 'Increases your strength in combat',
        level: 3,
        type: 'passive',
        effect: 'strength_bonus'
      },
      {
        name: 'Howl',
        description: 'Occasionally frightens enemies, reducing their attack',
        level: 8,
        type: 'passive',
        effect: 'enemy_debuff'
      },
      {
        name: 'Ferocious Bite',
        description: 'Deals significant damage to an enemy at the start of combat',
        level: 12,
        type: 'combat_start',
        effect: 'damage',
        power: 15
      }
    ]
  },
  {
    type: 'owl',
    name: 'Owl',
    description: 'A wise pet that increases experience gains',
    rarity: 'uncommon',
    emoji: '🦉',
    abilities: [
      {
        name: 'Wisdom',
        description: 'Increases experience gained from all sources',
        level: 3,
        type: 'passive',
        effect: 'xp_bonus'
      },
      {
        name: 'Night Vision',
        description: 'Improves chance of finding rare items at night',
        level: 8,
        type: 'passive',
        effect: 'rare_find_bonus'
      },
      {
        name: 'Silent Strike',
        description: 'Surprises an enemy with a powerful attack',
        level: 12,
        type: 'combat_start',
        effect: 'damage',
        power: 14
      }
    ]
  },
  {
    type: 'turtle',
    name: 'Turtle',
    description: 'A resilient pet that increases defense',
    rarity: 'uncommon',
    emoji: '🐢',
    abilities: [
      {
        name: 'Hard Shell',
        description: 'Increases your defense in combat',
        level: 3,
        type: 'passive',
        effect: 'defense_bonus'
      },
      {
        name: 'Withdraw',
        description: 'Occasionally blocks all damage from an attack',
        level: 8,
        type: 'passive',
        effect: 'block_damage'
      },
      {
        name: 'Shell Slam',
        description: 'Attacks an enemy with a powerful shell strike',
        level: 12,
        type: 'combat_start',
        effect: 'damage',
        power: 10
      }
    ]
  },
  {
    type: 'dragon',
    name: 'Baby Dragon',
    description: 'A rare and powerful pet with fire abilities',
    rarity: 'rare',
    emoji: '🐉',
    abilities: [
      {
        name: 'Dragon Scales',
        description: 'Significantly increases your defense',
        level: 3,
        type: 'passive',
        effect: 'defense_bonus'
      },
      {
        name: 'Fire Breath',
        description: 'Deals fire damage to enemies at the start of combat',
        level: 5,
        type: 'combat_start',
        effect: 'damage',
        power: 18
      },
      {
        name: 'Treasure Sense',
        description: 'Greatly increases chance of finding rare items',
        level: 10,
        type: 'passive',
        effect: 'rare_find_bonus'
      },
      {
        name: 'Dragon Fury',
        description: 'Occasionally attacks all enemies during combat',
        level: 15,
        type: 'passive',
        effect: 'aoe_damage',
        power: 20
      }
    ]
  },
  {
    type: 'phoenix',
    name: 'Phoenix',
    description: 'A legendary pet with resurrection powers',
    rarity: 'rare',
    emoji: '🔥',
    abilities: [
      {
        name: 'Rebirth',
        description: 'Has a chance to revive you if defeated in combat',
        level: 3,
        type: 'passive',
        effect: 'revive'
      },
      {
        name: 'Flame Wings',
        description: 'Deals fire damage to all enemies at the start of combat',
        level: 5,
        type: 'combat_start',
        effect: 'damage',
        power: 15
      },
      {
        name: 'Blazing Aura',
        description: 'Increases all your stats during combat',
        level: 10,
        type: 'passive',
        effect: 'stat_boost'
      },
      {
        name: 'Phoenix Tears',
        description: 'Occasionally heals you during combat',
        level: 15,
        type: 'passive',
        effect: 'healing',
        power: 25
      }
    ]
  },
  {
    type: 'griffin',
    name: 'Griffin',
    description: 'A majestic creature with incredible strength and speed',
    rarity: 'rare',
    emoji: '🦅',
    abilities: [
      {
        name: 'Mighty Talons',
        description: 'Significantly increases your strength',
        level: 3,
        type: 'passive',
        effect: 'strength_bonus'
      },
      {
        name: 'Sky Dive',
        description: 'Deals heavy damage to an enemy at the start of combat',
        level: 5,
        type: 'combat_start',
        effect: 'damage',
        power: 20
      },
      {
        name: 'Eagle Eye',
        description: 'Greatly increases chance of finding rare items during adventures',
        level: 10,
        type: 'passive',
        effect: 'rare_find_bonus'
      },
      {
        name: 'Windstorm',
        description: 'Occasionally reduces all enemy attacks in combat',
        level: 15,
        type: 'passive',
        effect: 'enemy_debuff'
      }
    ]
  },
  {
    type: 'unicorn',
    name: 'Unicorn',
    description: 'A mythical creature with healing powers',
    rarity: 'legendary',
    emoji: '🦄',
    abilities: [
      {
        name: 'Healing Horn',
        description: 'Occasionally heals you during combat',
        level: 3,
        type: 'passive',
        effect: 'healing',
        power: 20
      },
      {
        name: 'Purifying Light',
        description: 'Reduces all damage taken in combat',
        level: 5,
        type: 'passive',
        effect: 'damage_reduction'
      },
      {
        name: 'Magic Aura',
        description: 'Increases all experience gained',
        level: 10,
        type: 'passive',
        effect: 'xp_bonus'
      },
      {
        name: 'Rainbow Charge',
        description: 'Powerful attack that damages all enemies at the start of combat',
        level: 15,
        type: 'combat_start',
        effect: 'damage',
        power: 25
      }
    ]
  },
  {
    type: 'kraken',
    name: 'Baby Kraken',
    description: 'A legendary sea creature with immense power',
    rarity: 'legendary',
    emoji: '🐙',
    abilities: [
      {
        name: 'Tentacle Grab',
        description: 'Occasionally immobilizes enemies in combat',
        level: 3,
        type: 'passive',
        effect: 'enemy_stun'
      },
      {
        name: 'Ink Cloud',
        description: 'Reduces enemy accuracy in combat',
        level: 5,
        type: 'passive',
        effect: 'enemy_debuff'
      },
      {
        name: 'Crushing Grip',
        description: 'Deals massive damage to an enemy at the start of combat',
        level: 10,
        type: 'combat_start',
        effect: 'damage',
        power: 30
      },
      {
        name: 'Deep Sea Strength',
        description: 'Greatly increases all your combat stats',
        level: 15,
        type: 'passive',
        effect: 'stat_boost'
      }
    ]
  }
];

module.exports = PETS;
