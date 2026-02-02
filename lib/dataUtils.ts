// Data processing utilities for PUBG Telemetry Analytics v2.0

import { Match, WeaponStat, ZoneStat, SurvivalCategory, WeaponMetric, ArchetypeStats, PlayerArchetype, WeaponCategory } from './types';

/**
 * Calculate weapon statistics from match data
 */
export function calculateWeaponStats(matches: Match[]): WeaponStat[] {
    const weaponMap = new Map<string, { totalKills: number; count: number }>();

    matches.forEach((match) => {
        const weapon = match.weapon_used;
        const current = weaponMap.get(weapon) || { totalKills: 0, count: 0 };
        weaponMap.set(weapon, {
            totalKills: current.totalKills + match.kills,
            count: current.count + 1,
        });
    });

    const stats: WeaponStat[] = [];
    weaponMap.forEach((value, weapon) => {
        stats.push({
            weapon,
            avgKills: parseFloat((value.totalKills / value.count).toFixed(2)),
            usage: value.count,
            totalKills: value.totalKills,
        });
    });

    return stats.sort((a, b) => b.avgKills - a.avgKills);
}

/**
 * v2.0: Calculate weapon balance metrics for Game Balancing feature
 */
export function calculateWeaponMetrics(matches: Match[]): WeaponMetric[] {
    const weaponMap = new Map<string, {
        category: WeaponCategory;
        picks: number;
        wins: number;
        totalKills: number;
    }>();

    matches.forEach((match) => {
        const weapon = match.weapon_used;
        const current = weaponMap.get(weapon) || {
            category: match.weapon_category,
            picks: 0,
            wins: 0,
            totalKills: 0
        };

        weaponMap.set(weapon, {
            category: match.weapon_category,
            picks: current.picks + 1,
            wins: current.wins + (match.weapon_won ? 1 : 0),
            totalKills: current.totalKills + match.kills
        });
    });

    const metrics: WeaponMetric[] = [];
    weaponMap.forEach((value, weapon) => {
        metrics.push({
            weapon,
            category: value.category,
            pickRate: parseFloat(((value.picks / matches.length) * 100).toFixed(2)),
            winRate: parseFloat(((value.wins / value.picks) * 100).toFixed(1)),
            totalPicks: value.picks,
            totalWins: value.wins,
            avgKills: parseFloat((value.totalKills / value.picks).toFixed(2))
        });
    });

    return metrics.sort((a, b) => b.pickRate - a.pickRate);
}

/**
 * v2.0: Calculate player archetype statistics for Player Segmentation feature
 */
export function calculateArchetypeStats(matches: Match[]): ArchetypeStats[] {
    const archetypeMap = new Map<PlayerArchetype, Match[]>();

    matches.forEach((match) => {
        const archetype = match.player_archetype;
        const current = archetypeMap.get(archetype) || [];
        current.push(match);
        archetypeMap.set(archetype, current);
    });

    const stats: ArchetypeStats[] = [];
    archetypeMap.forEach((archetypeMatches, archetype) => {
        const count = archetypeMatches.length;
        const totalSurvival = archetypeMatches.reduce((sum, m) => sum + m.time_survived, 0);
        const totalKills = archetypeMatches.reduce((sum, m) => sum + m.kills, 0);
        const totalDamage = archetypeMatches.reduce((sum, m) => sum + m.damage_dealt, 0);
        const totalDeaths = archetypeMatches.filter(m => m.final_placement > 1).length;
        const wins = archetypeMatches.filter(m => m.final_placement === 1).length;
        const top10 = archetypeMatches.filter(m => m.final_placement <= 10).length;
        const totalMovement = archetypeMatches.reduce((sum, m) => sum + m.movement_distance, 0);
        const totalKillDist = archetypeMatches.reduce((sum, m) => sum + m.avg_kill_distance, 0);
        const totalHeadshot = archetypeMatches.reduce((sum, m) => sum + m.headshot_rate, 0);

        stats.push({
            archetype,
            count,
            avgSurvival: parseFloat((totalSurvival / count / 60).toFixed(1)), // minutes
            avgKills: parseFloat((totalKills / count).toFixed(2)),
            avgDamage: parseFloat((totalDamage / count).toFixed(0)),
            kdRatio: parseFloat((totalKills / Math.max(totalDeaths, 1)).toFixed(2)),
            top10Rate: parseFloat(((top10 / count) * 100).toFixed(1)),
            winRate: parseFloat(((wins / count) * 100).toFixed(1)),
            avgMovement: parseFloat((totalMovement / count).toFixed(0)),
            avgKillDistance: parseFloat((totalKillDist / count).toFixed(1)),
            avgHeadshotRate: parseFloat(((totalHeadshot / count) * 100).toFixed(1))
        });
    });

    return stats;
}

/**
 * Categorize matches by survival time
 */
export function categorizeSurvivalRate(matches: Match[]): SurvivalCategory[] {
    const categories = {
        'Died <2min': 0,
        'Survived 2-15min': 0,
        'Survived 15-25min': 0,
        'Survived >25min': 0,
    };

    matches.forEach((match) => {
        const minutes = match.time_survived / 60;
        if (minutes < 2) {
            categories['Died <2min']++;
        } else if (minutes < 15) {
            categories['Survived 2-15min']++;
        } else if (minutes < 25) {
            categories['Survived 15-25min']++;
        } else {
            categories['Survived >25min']++;
        }
    });

    const total = matches.length;
    return Object.entries(categories).map(([category, count]) => ({
        category,
        count,
        percentage: parseFloat(((count / total) * 100).toFixed(1)),
    }));
}

/**
 * Calculate win probability and stats for each landing zone
 */
export function calculateZoneStats(matches: Match[]): ZoneStat[] {
    const zoneMap = new Map<string, Match[]>();

    matches.forEach((match) => {
        const zone = match.landing_zone.zone_name;
        const zoneMatches = zoneMap.get(zone) || [];
        zoneMatches.push(match);
        zoneMap.set(zone, zoneMatches);
    });

    const stats: ZoneStat[] = [];
    zoneMap.forEach((zoneMatches, zone) => {
        const wins = zoneMatches.filter((m) => m.final_placement === 1).length;
        const totalSurvival = zoneMatches.reduce((sum, m) => sum + m.time_survived, 0);
        const totalPlacement = zoneMatches.reduce((sum, m) => sum + m.final_placement, 0);
        const totalKills = zoneMatches.reduce((sum, m) => sum + m.kills, 0);

        stats.push({
            zone,
            winRate: parseFloat(((wins / zoneMatches.length) * 100).toFixed(2)),
            avgSurvival: parseFloat((totalSurvival / zoneMatches.length / 60).toFixed(1)),
            avgPlacement: parseFloat((totalPlacement / zoneMatches.length).toFixed(1)),
            avgKills: parseFloat((totalKills / zoneMatches.length).toFixed(2)),
            totalMatches: zoneMatches.length,
        });
    });

    return stats.sort((a, b) => b.totalMatches - a.totalMatches);
}

/**
 * Get unique landing zones sorted by frequency
 */
export function getLandingZones(matches: Match[]): string[] {
    const zoneCounts = new Map<string, number>();

    matches.forEach((match) => {
        const zone = match.landing_zone.zone_name;
        zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    });

    return Array.from(zoneCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([zone]) => zone);
}

/**
 * Identify hot drop zones (>10% of matches)
 */
export function getHotDropZones(matches: Match[]): string[] {
    const zoneCounts = new Map<string, number>();

    matches.forEach((match) => {
        const zone = match.landing_zone.zone_name;
        zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    });

    const threshold = matches.length * 0.1;
    const hotDrops: string[] = [];

    zoneCounts.forEach((count, zone) => {
        if (count >= threshold && zone !== 'Safe Zone') {
            hotDrops.push(zone);
        }
    });

    return hotDrops;
}
