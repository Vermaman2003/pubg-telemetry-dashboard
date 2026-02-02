// Custom hook for v2.0 Telemetry Data Management
// Handles data loading, filtering, and computed analytics

import { useState, useMemo } from 'react';
import { Match, TelemetryData, WeaponStat, ZoneStat, WeaponMetric, ArchetypeStats } from '@/lib/types';
import {
    calculateWeaponStats,
    calculateZoneStats,
    calculateWeaponMetrics,
    calculateArchetypeStats
} from '@/lib/dataUtils';
import { useDataSource } from './useDataSource';

export interface UseTelemetryDataReturn {
    // Data
    matches: Match[];
    filteredMatches: Match[];

    // Computed Stats
    weaponStats: WeaponStat[];
    zoneStats: ZoneStat[];
    weaponMetrics: WeaponMetric[];
    archetypeStats: ArchetypeStats[];

    // Filter State
    selectedZone: string | null;
    setSelectedZone: (zone: string | null) => void;

    // Loading State
    isLoading: boolean;
    error: string | null;

    // Data Source Metadata
    dataSource: 'real' | 'mock';
    lastUpdated: string | null;

    // Refresh function (only available for dynamic mode)
    refreshData?: () => Promise<void>;
}

export function useTelemetryData(selectedSource: string = 'live'): UseTelemetryDataReturn {
    // Use data source hook for automatic real/mock fallback with source selection
    const { matches, isLoading, error, dataSource, lastUpdated, refreshData } = useDataSource(selectedSource);

    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Filtered matches based on selected zone
    const filteredMatches = useMemo(() => {
        if (!selectedZone) {
            return matches;
        }
        return matches.filter(m => m.landing_zone.zone_name === selectedZone);
    }, [matches, selectedZone]);

    // Computed statistics (memoized for performance)
    const weaponStats = useMemo(() => {
        return calculateWeaponStats(filteredMatches);
    }, [filteredMatches]);

    const zoneStats = useMemo(() => {
        return calculateZoneStats(filteredMatches);
    }, [filteredMatches]);

    const weaponMetrics = useMemo(() => {
        return calculateWeaponMetrics(filteredMatches);
    }, [filteredMatches]);

    const archetypeStats = useMemo(() => {
        return calculateArchetypeStats(filteredMatches);
    }, [filteredMatches]);

    return {
        matches,
        filteredMatches,
        weaponStats,
        zoneStats,
        weaponMetrics,
        archetypeStats,
        selectedZone,
        setSelectedZone,
        isLoading,
        error,
        dataSource,
        lastUpdated,
        refreshData
    };
}
