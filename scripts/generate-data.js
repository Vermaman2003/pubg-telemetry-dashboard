// Synthetic PUBG Telemetry Data Generator
// Generates 500 matches with realistic correlations between hot drops and survival rates

const fs = require('fs');
const path = require('path');

// Erangel map is 8000x8000 units
const MAP_SIZE = 8000;

// Known hot drop coordinates (approximate)
const HOT_DROPS = [
    { name: 'Pochinki', x: 4800, y: 4800, radius: 400 },
    { name: 'School', x: 3500, y: 2800, radius: 300 },
    { name: 'Military Base', x: 6500, y: 2000, radius: 500 },
    { name: 'Georgopol', x: 1500, y: 6500, radius: 400 },
    { name: 'Rozhok', x: 4200, y: 5200, radius: 300 },
];

// Weapon pool with realistic usage distribution
const WEAPONS = [
    { name: 'M416', weight: 30, avgKillRate: 2.5 },
    { name: 'AKM', weight: 28, avgKillRate: 2.3 },
    { name: 'SCAR-L', weight: 15, avgKillRate: 2.1 },
    { name: 'UMP45', weight: 12, avgKillRate: 1.8 },
    { name: 'Vector', weight: 8, avgKillRate: 1.6 },
    { name: 'Kar98k', weight: 5, avgKillRate: 3.2 },
    { name: 'AWM', weight: 2, avgKillRate: 4.5 },
];

// Helper function to generate random number in range
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random float
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Check if coordinates are near a hot drop zone
function isHotDrop(x, y) {
    for (const zone of HOT_DROPS) {
        const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
        if (distance <= zone.radius) {
            return zone.name;
        }
    }
    return null;
}

// Get nearest hot drop zone for win probability calculations
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

    // If far from all hot drops, it's a safe zone
    if (minDistance > 1000) {
        return 'Safe Zone';
    }

    return nearest;
}

// Select weapon based on weighted distribution
function selectWeapon() {
    const totalWeight = WEAPONS.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const weapon of WEAPONS) {
        random -= weapon.weight;
        if (random <= 0) {
            return weapon;
        }
    }

    return WEAPONS[0]; // Fallback
}

// Generate landing coordinates with 40% hot drop rate
function generateLandingZone() {
    const isHot = Math.random() < 0.4;

    if (isHot) {
        // Select random hot drop
        const zone = HOT_DROPS[randomInRange(0, HOT_DROPS.length - 1)];
        // Add some randomness within the zone
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * zone.radius;
        return {
            x: Math.round(zone.x + radius * Math.cos(angle)),
            y: Math.round(zone.y + radius * Math.sin(angle)),
            zone: zone.name
        };
    } else {
        // Random safe zone
        return {
            x: randomInRange(0, MAP_SIZE),
            y: randomInRange(0, MAP_SIZE),
            zone: null
        };
    }
}

// Generate survival time with correlation to landing zone
function generateSurvivalTime(landingZone) {
    const hotDrop = isHotDrop(landingZone.x, landingZone.y);

    if (hotDrop) {
        // Hot drops: 70% die within 2 minutes (120 seconds)
        if (Math.random() < 0.70) {
            return randomInRange(10, 120); // Die very early
        } else {
            // Survivors from hot drops tend to be good players
            return randomInRange(300, 1800); // 5-30 minutes
        }
    } else {
        // Safe zones: only 15% die early
        if (Math.random() < 0.15) {
            return randomInRange(10, 120);
        } else {
            // More likely to survive longer
            return randomInRange(180, 1800); // 3-30 minutes
        }
    }
}

// Generate final placement based on survival time
function generatePlacement(survivalTime) {
    if (survivalTime < 120) {
        return randomInRange(60, 100); // Died early
    } else if (survivalTime < 600) {
        return randomInRange(20, 60); // Mid game
    } else if (survivalTime < 1200) {
        return randomInRange(5, 25); // Late game
    } else {
        return randomInRange(1, 10); // Very late / winner
    }
}

// Generate kills based on weapon and survival time
function generateKills(weapon, survivalTime) {
    const baseKills = weapon.avgKillRate;
    const timeFactor = Math.min(survivalTime / 600, 2); // Longer survival = more kills
    const randomFactor = randomFloat(0.5, 1.5);

    return Math.max(0, Math.round(baseKills * timeFactor * randomFactor));
}

// Generate damage dealt
function generateDamage(kills, survivalTime) {
    const basePerKill = 400;
    const extraDamage = randomInRange(0, survivalTime * 0.5);
    return Math.round(kills * basePerKill + extraDamage);
}

// Main generation function
function generateMatches(count = 500) {
    const matches = [];

    for (let i = 1; i <= count; i++) {
        const landingZone = generateLandingZone();
        const weapon = selectWeapon();
        const timeSurvived = generateSurvivalTime(landingZone);
        const finalPlacement = generatePlacement(timeSurvived);
        const kills = generateKills(weapon, timeSurvived);
        const damageDealt = generateDamage(kills, timeSurvived);

        matches.push({
            match_id: `match_${String(i).padStart(3, '0')}`,
            landing_zone: {
                x: landingZone.x,
                y: landingZone.y,
                zone_name: landingZone.zone || getNearestZone(landingZone.x, landingZone.y)
            },
            weapon_used: weapon.name,
            final_placement: finalPlacement,
            time_survived: timeSurvived,
            damage_dealt: damageDealt,
            kills: kills
        });
    }

    return matches;
}

// Generate and save data
console.log('🎮 Generating PUBG Telemetry Data...');
const matches = generateMatches(500);

const outputPath = path.join(__dirname, '..', 'public', 'mock_telemetry.json');
const data = { matches };

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`✅ Successfully generated ${matches.length} matches!`);
console.log(`📊 Data saved to: ${outputPath}`);

// Print some statistics
const hotDrops = matches.filter(m => m.landing_zone.zone_name !== 'Safe Zone').length;
const earlyDeaths = matches.filter(m => m.time_survived < 120).length;
const hotDropEarlyDeaths = matches.filter(m =>
    m.landing_zone.zone_name !== 'Safe Zone' && m.time_survived < 120
).length;

console.log('\n📈 Data Statistics:');
console.log(`   Hot Drop Landings: ${hotDrops} (${(hotDrops / matches.length * 100).toFixed(1)}%)`);
console.log(`   Early Deaths (<2min): ${earlyDeaths} (${(earlyDeaths / matches.length * 100).toFixed(1)}%)`);
console.log(`   Hot Drop Early Death Rate: ${(hotDropEarlyDeaths / hotDrops * 100).toFixed(1)}%`);
console.log(`   Safe Zone Early Death Rate: ${((earlyDeaths - hotDropEarlyDeaths) / (matches.length - hotDrops) * 100).toFixed(1)}%`);
