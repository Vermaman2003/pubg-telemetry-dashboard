// PUBG Telemetry API Route - Dynamic Data Generation
// Phase 2: Next.js API Route for on-demand telemetry data

import { NextResponse } from 'next/server';

const MAP_SIZE = 8000;

// Hot drop zones
const HOT_DROPS = [
    { name: 'Pochinki', x: 4800, y: 4800, radius: 400, tier: 'extreme' },
    { name: 'School', x: 3500, y: 2800, radius: 300, tier: 'extreme' },
    { name: 'Military Base', x: 6500, y: 2000, radius: 500, tier: 'high' },
    { name: 'Georgopol', x: 1500, y: 6500, radius: 400, tier: 'high' },
    { name: 'Rozhok', x: 4200, y: 5200, radius: 300, tier: 'medium' },
];

// Player Archetypes
const ARCHETYPES = [
    {
        type: 'Rusher',
        weight: 40,
        preferredWeapons: ['UMP45', 'Vector', 'M416'],
        movementRange: [3000, 5000],
        killDistanceRange: [5, 25],
        survivalModifier: 0.7,
        headshotRate: 0.15
    },
    {
        type: 'Sniper',
        weight: 30,
        preferredWeapons: ['Kar98k', 'AWM', 'M416'],
        movementRange: [800, 1800],
        killDistanceRange: [120, 300],
        survivalModifier: 1.2,
        headshotRate: 0.35
    },
    {
        type: 'Camper',
        weight: 30,
        preferredWeapons: ['M416', 'SCAR-L', 'AKM'],
        movementRange: [400, 1200],
        killDistanceRange: [30, 100],
        survivalModifier: 1.5,
        headshotRate: 0.20
    }
];

// Weapons Database
const WEAPONS = [
    { name: 'M416', weight: 35, avgKillRate: 2.5, winRateModifier: 0.50, category: 'AR' },
    { name: 'UMP45', weight: 15, avgKillRate: 1.8, winRateModifier: 0.30, category: 'SMG' },
    { name: 'SCAR-L', weight: 20, avgKillRate: 2.1, winRateModifier: 0.45, category: 'AR' },
    { name: 'AKM', weight: 7, avgKillRate: 2.3, winRateModifier: 0.55, category: 'AR' },
    { name: 'Kar98k', weight: 10, avgKillRate: 3.2, winRateModifier: 0.60, category: 'SR' },
    { name: 'Vector', weight: 8, avgKillRate: 1.6, winRateModifier: 0.25, category: 'SMG' },
    { name: 'AWM', weight: 5, avgKillRate: 4.5, winRateModifier: 0.80, category: 'SR' }
];

// Helper functions
function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function isHotDrop(x: number, y: number): string | null {
    for (const zone of HOT_DROPS) {
        const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
        if (distance <= zone.radius) {
            return zone.name;
        }
    }
    return null;
}

function getNearestZone(x: number, y: number): string {
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

function selectWeapon(archetype: any) {
    if (Math.random() < 0.7 && archetype.preferredWeapons.length > 0) {
        const weaponName = archetype.preferredWeapons[randomInRange(0, archetype.preferredWeapons.length - 1)];
        return WEAPONS.find(w => w.name === weaponName) || WEAPONS[0];
    }

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

function generateSurvivalTime(landingZone: any, archetype: any) {
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

    return Math.round(baseSurvival * archetype.survivalModifier);
}

function generatePlacement(survivalTime: number, weapon: any) {
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

    const placement = randomInRange(...baseRange as [number, number]);
    const won = placement === 1 || (Math.random() < weapon.winRateModifier / 3 && placement <= 5);

    return { placement: won ? 1 : placement, won };
}

function generateKills(weapon: any, survivalTime: number, archetype: any) {
    const baseKills = weapon.avgKillRate;
    const timeFactor = Math.min(survivalTime / 600, 2);
    const randomFactor = randomFloat(0.5, 1.5);
    const archetypeBonus = archetype.type === 'Rusher' ? 1.3 : archetype.type === 'Camper' ? 0.7 : 1.0;

    return Math.max(0, Math.round(baseKills * timeFactor * randomFactor * archetypeBonus));
}

function generateDamage(kills: number, survivalTime: number) {
    const basePerKill = 400;
    const extraDamage = randomInRange(0, survivalTime * 0.5);
    return Math.round(kills * basePerKill + extraDamage);
}

function generateMovementDistance(archetype: any) {
    return randomInRange(...archetype.movementRange as [number, number]);
}

function generateKillDistance(archetype: any) {
    return Math.round(randomFloat(...archetype.killDistanceRange as [number, number]));
}

// Main generation function
function generateMatches(count: number = 500) {
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
        const headshotRate = archetype.headshotRate + randomFloat(-0.1, 0.1);

        const zoneName = landingZone.zone || getNearestZone(landingZone.x, landingZone.y);

        matches.push({
            match_id: `dynamic-${Date.now()}-${i}`,
            landing_zone: {
                x: landingZone.x,
                y: landingZone.y,
                zone_name: zoneName
            },
            weapon_used: weapon.name,
            weapon_category: weapon.category,
            final_placement: placementResult.placement,
            weapon_won: placementResult.won,
            time_survived: timeSurvived,
            damage_dealt: damageDealt,
            kills,
            player_archetype: archetype.type,
            movement_distance: movementDistance,
            avg_kill_distance: avgKillDistance,
            headshot_rate: Math.max(0, Math.min(1, headshotRate))
        });
    }

    return matches;
}

// API Route Handler
export async function GET(request: Request) {
    console.log('🎮 API Route: Generating dynamic telemetry data...');

    // Security check for PUBG API token
    const apiToken = process.env.PUBG_API_TOKEN;
    if (!apiToken) {
        console.warn('⚠️  PUBG_API_TOKEN not found in environment variables');
        console.warn('   This is expected for dynamic mock data generation');
    } else {
        console.log('✅ PUBG_API_TOKEN found (for future real API integration)');
    }

    try {
        const matches = generateMatches(500);

        console.log(`✅ Generated ${matches.length} matches dynamically`);
        console.log(`   Archetypes: ${matches.filter(m => m.player_archetype === 'Rusher').length} Rushers, ${matches.filter(m => m.player_archetype === 'Sniper').length} Snipers, ${matches.filter(m => m.player_archetype === 'Camper').length} Campers`);

        return NextResponse.json({
            matches,
            metadata: {
                source: 'dynamic',
                generated_at: new Date().toISOString(),
                match_count: matches.length,
                api_version: 'v2.0'
            }
        });
    } catch (error) {
        console.error('❌ Error generating telemetry data:', error);
        return NextResponse.json(
            { error: 'Failed to generate telemetry data' },
            { status: 500 }
        );
    }
}
