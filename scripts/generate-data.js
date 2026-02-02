// PUBG Telemetry Data Generator v2.0
// Enhanced with Player Archetypes and Weapon Balance Metrics
// For Krafton Interview - Game Analytics Demo

const fs = require('fs');
const path = require('path');

const MAP_SIZE = 8000;

// Hot drop zones with enhanced metadata
const HOT_DROPS = [
    { name: 'Pochinki', x: 4800, y: 4800, radius: 400, tier: 'extreme' },
    { name: 'School', x: 3500, y: 2800, radius: 300, tier: 'extreme' },
    { name: 'Military Base', x: 6500, y: 2000, radius: 500, tier: 'high' },
    { name: 'Georgopol', x: 1500, y: 6500, radius: 400, tier: 'high' },
    { name: 'Rozhok', x: 4200, y: 5200, radius: 300, tier: 'medium' },
];

// Player Archetypes with behavioral patterns
const ARCHETYPES = [
    {
        type: 'Rusher',
        weight: 40, // 40% of players
        preferredWeapons: ['UMP45', 'Vector', 'M416'], // SMG/AR preference
        movementRange: [3000, 5000], // High movement in meters
        killDistanceRange: [5, 25], // Close quarters
        survivalModifier: 0.7, // Lower survival due to aggression
        headshotRate: 0.15
    },
    {
        type: 'Sniper',
        weight: 30, // 30% of players
        preferredWeapons: ['Kar98k', 'AWM', 'M416'], // SR/DMR preference
        movementRange: [800, 1800], // Low movement
        killDistanceRange: [120, 300], // Long range
        survivalModifier: 1.2, // Better survival (stay hidden)
        headshotRate: 0.35 // High headshot rate
    },
    {
        type: 'Camper',
        weight: 30, // 30% of players
        preferredWeapons: ['M416', 'SCAR-L', 'AKM'], // AR preference
        movementRange: [400, 1200], // Very low movement
        killDistanceRange: [30, 100], // Medium range
        survivalModifier: 1.5, // Highest survival (avoid fights)
        headshotRate: 0.20
    }
];

// Weapon Balance Database (for Game Balancing feature)
const WEAPONS = [
    // Balanced meta weapon: high pick, balanced win
    { name: 'M416', weight: 35, avgKillRate: 2.5, winRateModifier: 0.50, category: 'AR' },

    // Needs buff: high pick, low win
    { name: 'UMP45', weight: 15, avgKillRate: 1.8, winRateModifier: 0.30, category: 'SMG' },

    // Balanced
    { name: 'SCAR-L', weight: 20, avgKillRate: 2.1, winRateModifier: 0.45, category: 'AR' },

    // Technical weapon: moderate pick, good win
    { name: 'AKM', weight: 7, avgKillRate: 2.3, winRateModifier: 0.55, category: 'AR' },

    // Strong sniper: low pick, high win
    { name: 'Kar98k', weight: 10, avgKillRate: 3.2, winRateModifier: 0.60, category: 'SR' },

    // Needs buff: low pick, low win
    { name: 'Vector', weight: 8, avgKillRate: 1.6, winRateModifier: 0.25, category: 'SMG' },

    // OP crate weapon: very low pick (rare), very high win
    { name: 'AWM', weight: 5, avgKillRate: 4.5, winRateModifier: 0.80, category: 'SR' }
];

// Helper functions
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function isHotDrop(x, y) {
    for (const zone of HOT_DROPS) {
        const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
        if (distance <= zone.radius) {
            return zone.name;
        }
    }
    return null;
}

function getNearestZone(x, y) {
    let nearest = 'Safe Zone';
    let minDistance = Infinity;

    for (const zone of HOT_DROPS) {
        const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearest = zone.name;
        }
    }

    if (minDistance > 1000) {
        return 'Safe Zone';
    }

    return nearest;
}

// Select player archetype based on weighted distribution
function selectArchetype() {
    const totalWeight = ARCHETYPES.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;

    for (const archetype of ARCHETYPES) {
        random -= archetype.weight;
        if (random <= 0) {
            return archetype;
        }
    }

    return ARCHETYPES[0];
}

// Select weapon based on archetype preference and overall distribution
function selectWeapon(archetype) {
    // 70% chance to pick from archetype preferred weapons
    if (Math.random() < 0.7 && archetype.preferredWeapons.length > 0) {
        const weaponName = archetype.preferredWeapons[randomInRange(0, archetype.preferredWeapons.length - 1)];
        return WEAPONS.find(w => w.name === weaponName) || WEAPONS[0];
    }

    // Otherwise pick from general pool
    const totalWeight = WEAPONS.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const weapon of WEAPONS) {
        random -= weapon.weight;
        if (random <= 0) {
            return weapon;
        }
    }

    return WEAPONS[0];
}

function generateLandingZone() {
    const isHot = Math.random() < 0.4;

    if (isHot) {
        const zone = HOT_DROPS[randomInRange(0, HOT_DROPS.length - 1)];
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * zone.radius;
        return {
            x: Math.round(zone.x + radius * Math.cos(angle)),
            y: Math.round(zone.y + radius * Math.sin(angle)),
            zone: zone.name
        };
    } else {
        return {
            x: randomInRange(0, MAP_SIZE),
            y: randomInRange(0, MAP_SIZE),
            zone: null
        };
    }
}

function generateSurvivalTime(landingZone, archetype) {
    const hotDrop = isHotDrop(landingZone.x, landingZone.y);
    let baseSurvival;

    if (hotDrop) {
        if (Math.random() < 0.70) {
            baseSurvival = randomInRange(10, 120);
        } else {
            baseSurvival = randomInRange(300, 1800);
        }
    } else {
        if (Math.random() < 0.15) {
            baseSurvival = randomInRange(10, 120);
        } else {
            baseSurvival = randomInRange(180, 1800);
        }
    }

    // Apply archetype modifier
    return Math.round(baseSurvival * archetype.survivalModifier);
}

function generatePlacement(survivalTime, weapon) {
    let baseRange;

    if (survivalTime < 120) {
        baseRange = [60, 100];
    } else if (survivalTime < 600) {
        baseRange = [20, 60];
    } else if (survivalTime < 1200) {
        baseRange = [5, 25];
    } else {
        baseRange = [1, 10];
    }

    const placement = randomInRange(...baseRange);

    // Determine if won (placement === 1)
    const won = placement === 1 || (Math.random() < weapon.winRateModifier / 3 && placement <= 5);

    return { placement: won ? 1 : placement, won };
}

function generateKills(weapon, survivalTime, archetype) {
    const baseKills = weapon.avgKillRate;
    const timeFactor = Math.min(survivalTime / 600, 2);
    const randomFactor = randomFloat(0.5, 1.5);

    // Rushers get more kills
    const archetypeBonus = archetype.type === 'Rusher' ? 1.3 : archetype.type === 'Camper' ? 0.7 : 1.0;

    return Math.max(0, Math.round(baseKills * timeFactor * randomFactor * archetypeBonus));
}

function generateDamage(kills, survivalTime) {
    const basePerKill = 400;
    const extraDamage = randomInRange(0, survivalTime * 0.5);
    return Math.round(kills * basePerKill + extraDamage);
}

function generateMovementDistance(archetype) {
    return randomInRange(...archetype.movementRange);
}

function generateKillDistance(archetype) {
    return Math.round(randomFloat(...archetype.killDistanceRange));
}

// Main generation function
function generateMatches(count = 500) {
    const matches = [];

    for (let i = 1; i <= count; i++) {
        const archetype = selectArchetype();
        const landingZone = generateLandingZone();
        const weapon = selectWeapon(archetype);
        const timeSurvived = generateSurvivalTime(landingZone, archetype);
        const placementResult = generatePlacement(timeSurvived, weapon);
        const kills = generateKills(weapon, timeSurvived, archetype);
        const damageDealt = generateDamage(kills, timeSurvived);
        const movementDistance = generateMovementDistance(archetype);
        const avgKillDistance = generateKillDistance(archetype);
        const headshotRate = archetype.headshotRate + randomFloat(-0.05, 0.05);

        matches.push({
            match_id: `match_${String(i).padStart(3, '0')}`,
            landing_zone: {
                x: landingZone.x,
                y: landingZone.y,
                zone_name: landingZone.zone || getNearestZone(landingZone.x, landingZone.y)
            },
            weapon_used: weapon.name,
            weapon_category: weapon.category,
            final_placement: placementResult.placement,
            weapon_won: placementResult.won,
            time_survived: timeSurvived,
            damage_dealt: damageDealt,
            kills: kills,
            // v2.0 New Fields
            player_archetype: archetype.type,
            movement_distance: movementDistance,
            avg_kill_distance: avgKillDistance,
            headshot_rate: Math.max(0, Math.min(1, headshotRate))
        });
    }

    return matches;
}

// Generate and save data
console.log('🎮 Generating PUBG Telemetry Data v2.0...');
console.log('📊 New Features: Player Archetypes, Weapon Balance Metrics');
const matches = generateMatches(500);

const outputPath = path.join(__dirname, '..', 'public', 'mock_telemetry.json');
const data = { matches, version: '2.0' };

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`✅ Successfully generated ${matches.length} matches!`);
console.log(`📊 Data saved to: ${outputPath}`);

// Enhanced statistics
const archetypeCounts = {};
const weaponStats = {};

matches.forEach(m => {
    archetypeCounts[m.player_archetype] = (archetypeCounts[m.player_archetype] || 0) + 1;

    if (!weaponStats[m.weapon_used]) {
        weaponStats[m.weapon_used] = { picks: 0, wins: 0 };
    }
    weaponStats[m.weapon_used].picks++;
    if (m.weapon_won) weaponStats[m.weapon_used].wins++;
});

console.log('\n🎯 Player Archetype Distribution:');
Object.entries(archetypeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} (${(count / matches.length * 100).toFixed(1)}%)`);
});

console.log('\n⚔️  Weapon Balance Metrics:');
Object.entries(weaponStats).sort((a, b) => b[1].picks - a[1].picks).forEach(([weapon, stats]) => {
    const pickRate = (stats.picks / matches.length * 100).toFixed(1);
    const winRate = (stats.wins / stats.picks * 100).toFixed(1);
    console.log(`   ${weapon.padEnd(10)} | Pick: ${pickRate}% | Win: ${winRate}%`);
});

const hotDrops = matches.filter(m => m.landing_zone.zone_name !== 'Safe Zone').length;
const earlyDeaths = matches.filter(m => m.time_survived < 120).length;

console.log('\n📈 Classic Statistics:');
console.log(`   Hot Drop Landings: ${hotDrops} (${(hotDrops / matches.length * 100).toFixed(1)}%)`);
console.log(`   Early Deaths (<2min): ${earlyDeaths} (${(earlyDeaths / matches.length * 100).toFixed(1)}%)`);
