import { useState, useEffect } from 'react';
import { Match, TelemetryData } from '@/lib/types';

interface UseDataSourceReturn {
    matches: Match[];
    isLoading: boolean;
    error: string | null;
    dataSource: 'real' | 'mock';
    lastUpdated: string | null;
}

/**
 * Custom hook to load telemetry data with automatic fallback
 * Supports multiple data sources: live, historical snapshots, and demo
 * @param selectedSource - Source ID ('live', date string, or 'mock')
 */
export function useDataSource(selectedSource: string = 'live'): UseDataSourceReturn {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'real' | 'mock'>('mock');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);

            // Determine file path based on selected source
            let dataPath = '/mock_telemetry.json'; // Default fallback

            if (selectedSource === 'live') {
                dataPath = '/real_telemetry.json';
            } else if (selectedSource === 'mock') {
                dataPath = '/mock_telemetry.json';
            } else {
                // Historical snapshot (date-based ID)
                dataPath = `/data/archive/${selectedSource}.json`;
            }

            try {
                console.log(`🔍 Attempting to load: ${dataPath}`);
                const response = await fetch(dataPath);

                if (response.ok) {
                    const data = await response.json();

                    if (data.matches && data.matches.length > 0) {
                        console.log(`✅ Loaded ${dataPath}:`, data.matches.length, 'matches');
                        setMatches(data.matches);
                        setDataSource(data.metadata?.source || (selectedSource === 'mock' ? 'mock' : 'real'));
                        setLastUpdated(data.metadata?.fetched_at || null);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log(`⚠️  ${dataPath} exists but is empty`);
                    }
                } else {
                    console.log(`⚠️  ${dataPath} not found (${response.status})`);
                }
            } catch (err) {
                console.log(`⚠️  Error loading ${dataPath}:`, err);
            }

            // Fallback to demo data if selected source fails
            try {
                console.log('📦 Falling back to demo data...');
                const mockResponse = await fetch('/mock_telemetry.json');

                if (!mockResponse.ok) {
                    throw new Error('Failed to load demo data');
                }

                const mockData = await mockResponse.json();
                console.log('✅ Demo data loaded:', mockData.matches.length, 'matches');

                setMatches(mockData.matches);
                setDataSource('mock');
                setLastUpdated(null);
            } catch (err) {
                console.error('❌ Failed to load any data:', err);
                setError('Failed to load telemetry data');
                setMatches([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [selectedSource]); // Re-load when source changes

    return {
        matches,
        isLoading,
        error,
        dataSource,
        lastUpdated
    };
}
