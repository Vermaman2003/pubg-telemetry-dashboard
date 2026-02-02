'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import HotDropHeatmap from '@/components/HotDropHeatmap';
import WeaponMetaChart from '@/components/WeaponMetaChart';
import WinProbabilityEngine from '@/components/WinProbabilityEngine';
import WeaponMetaMatrix from '@/components/WeaponMetaMatrix';
import ArchetypeRadar from '@/components/ArchetypeRadar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import DataSourceSelector from '@/components/DataSourceSelector';
import { useTelemetryData } from '@/hooks/useTelemetryData';

export default function DashboardPage() {
  // Data source state with localStorage persistence
  const [selectedDataSource, setSelectedDataSource] = useState<string>('live');

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pubg_data_source');
      if (saved) setSelectedDataSource(saved);
    } catch (err) {
      console.log('Could not load saved preference');
    }
  }, []);

  const {
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
  } = useTelemetryData(selectedDataSource);

  // Track if we're in dynamic mode and currently refreshing
  const isDynamicMode = selectedDataSource === 'dynamic';
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Handle refresh for dynamic mode
  const handleRefresh = async () => {
    if (refreshData) {
      setIsRefreshing(true);
      try {
        await refreshData();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Hero and Data Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <HeroSection
              onRefreshData={isDynamicMode ? handleRefresh : undefined}
              isRefreshing={isRefreshing}
              showRefreshButton={isDynamicMode}
            />
          </div>
          <DataSourceSelector
            currentSource={selectedDataSource}
            onSourceChange={setSelectedDataSource}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Filter Indicator */}
        {selectedZone && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-xl p-4 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-white font-bold">
                Filtered by Zone: <span className="text-orange-400">{selectedZone}</span>
              </span>
              <span className="text-gray-400 text-sm">
                ({filteredMatches.length} matches)
              </span>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Heatmap */}
          <HotDropHeatmap
            matches={filteredMatches}
            selectedZone={selectedZone}
            onZoneClick={setSelectedZone}
          />

          {/* v2.0: Weapon Meta Matrix (Game Balancing) */}
          <WeaponMetaMatrix weaponMetrics={weaponMetrics} />
        </div>

        {/* Player Segmentation & Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* v2.0: Player Archetype Analysis */}
          <ArchetypeRadar archetypeStats={archetypeStats} />

          {/* Win Probability Engine */}
          <WinProbabilityEngine zoneStats={zoneStats} />
        </div>

        {/* Classic Weapon Stats */}
        <WeaponMetaChart weaponStats={weaponStats} />

        {/* Version Badge with Data Source Indicator */}
        <div className="flex justify-center gap-4 flex-wrap">
          {/* Data Source Badge */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 border rounded-full ${dataSource === 'real'
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40'
            : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/40'
            }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${dataSource === 'real' ? 'bg-green-400' : 'bg-orange-400'
              }`}></div>
            <span className="text-sm font-bold text-gray-200">
              {dataSource === 'real' ? '🟢 Live Data' : '🟠 Demo Mode'}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                • {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>

          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-300">
              Dashboard v2.0 • Game Balancing & Player Segmentation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
