// Custom hook for v2.0 Telemetry Data Management
// Handles data loading, filtering, and computed analytics

import { useState, useEffect, useMemo } from 'react';
import { Match, TelemetryData, WeaponStat, ZoneStat, WeaponMetric, ArchetypeStats } from '@/lib/types';
import {
    calculateWeaponStats,
    calculateZoneStats,
    calculateWeaponMetrics,
    calculateArchetypeStats
} from '@/lib/dataUtils';

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
}

export function useTelemetryData(): UseTelemetryDataReturn {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                const response = await fetch('/mock_telemetry.json');

                if (!response.ok) {
                    throw new Error('Failed to load telemetry data');
                }

                const data: TelemetryData = await response.json();
                setMatches(data.matches);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                console.error('Error loading telemetry data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

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
        error
    };
}
