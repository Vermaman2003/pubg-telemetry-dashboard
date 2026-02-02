// TypeScript interfaces for PUBG Telemetry Data

export interface LandingZone {
    x: number;
    y: number;
    zone_name: string;
}

export interface Match {
    match_id: string;
    landing_zone: LandingZone;
    weapon_used: string;
    final_placement: number;
    time_survived: number;
    damage_dealt: number;
    kills: number;
}

export interface TelemetryData {
    matches: Match[];
}

export interface WeaponStat {
    weapon: string;
    avgKills: number;
    usage: number;
    totalKills: number;
}

export interface ZoneStat {
    zone: string;
    winRate: number;
    avgSurvival: number;
    avgPlacement: number;
    avgKills: number;
    totalMatches: number;
}

export interface SurvivalCategory {
    category: string;
    count: number;
    percentage: number;
}
