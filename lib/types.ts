// TypeScript interfaces for PUBG Telemetry Data v2.0

export type PlayerArchetype = 'Rusher' | 'Sniper' | 'Camper';
export type WeaponCategory = 'AR' | 'SMG' | 'SR' | 'DMR';

export interface LandingZone {
    x: number;
    y: number;
    zone_name: string;
}

export interface Match {
    match_id: string;
    landing_zone: LandingZone;
    weapon_used: string;
    weapon_category: WeaponCategory;
    final_placement: number;
    weapon_won: boolean;
    time_survived: number;
    damage_dealt: number;
    kills: number;
    // v2.0 fields
    player_archetype: PlayerArchetype;
    movement_distance: number;
    avg_kill_distance: number;
    headshot_rate: number;
}

export interface TelemetryData {
    matches: Match[];
    version?: string;
}

export interface WeaponStat {
    weapon: string;
    avgKills: number;
    usage: number;
    totalKills: number;
}

// v2.0: Game Balancing Metrics
export interface WeaponMetric {
    weapon: string;
    category: WeaponCategory;
    pickRate: number; // percentage
    winRate: number; // percentage
    totalPicks: number;
    totalWins: number;
    avgKills: number;
}

export interface ZoneStat {
    zone: string;
    winRate: number;
    avgSurvival: number;
    avgPlacement: number;
    avgKills: number;
    totalMatches: number;
}

// v2.0: Player Segmentation Metrics
export interface ArchetypeStats {
    archetype: PlayerArchetype;
    count: number;
    avgSurvival: number;
    avgKills: number;
    avgDamage: number;
    kdRatio: number;
    top10Rate: number;
    winRate: number;
    avgMovement: number;
    avgKillDistance: number;
    avgHeadshotRate: number;
}

export interface SurvivalCategory {
    category: string;
    count: number;
    percentage: number;
}
