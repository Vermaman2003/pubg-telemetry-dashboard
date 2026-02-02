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
 * Tries to load real_telemetry.json first, falls back to mock_telemetry.json
 */
export function useDataSource(): UseDataSourceReturn {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'real' | 'mock'>('mock');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);

            try {
                // Try real data first
                console.log('🔍 Attempting to load real PUBG data...');
                const realResponse = await fetch('/real_telemetry.json');

                if (realResponse.ok) {
                    const realData = await realResponse.json();

                    if (realData.matches && realData.matches.length > 0) {
                        console.log('✅ Real PUBG data loaded:', realData.matches.length, 'matches');
                        setMatches(realData.matches);
                        setDataSource('real');
                        setLastUpdated(realData.metadata?.fetched_at || null);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log('⚠️  Real data file exists but is empty');
                    }
                } else {
                    console.log('⚠️  Real data file not found (404)');
                }
            } catch (err) {
                console.log('⚠️  Error loading real data:', err);
            }

            // Fallback to mock data
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
    }, []);

    return {
        matches,
        isLoading,
        error,
        dataSource,
        lastUpdated
    };
}
