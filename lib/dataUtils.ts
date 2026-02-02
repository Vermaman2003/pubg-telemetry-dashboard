// Data processing utilities for PUBG Telemetry Analytics

import { Match, WeaponStat, ZoneStat, SurvivalCategory } from './types';

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

    // Sort by average kills descending
    return stats.sort((a, b) => b.avgKills - a.avgKills);
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

    // Group matches by zone
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
            avgSurvival: parseFloat((totalSurvival / zoneMatches.length / 60).toFixed(1)), // in minutes
            avgPlacement: parseFloat((totalPlacement / zoneMatches.length).toFixed(1)),
            avgKills: parseFloat((totalKills / zoneMatches.length).toFixed(2)),
            totalMatches: zoneMatches.length,
        });
    });

    // Sort by total matches descending
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

    // Sort by count descending
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
