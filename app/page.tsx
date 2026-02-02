'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import HotDropHeatmap from '@/components/HotDropHeatmap';
import WeaponMetaChart from '@/components/WeaponMetaChart';
import WinProbabilityEngine from '@/components/WinProbabilityEngine';
import { TelemetryData } from '@/lib/types';
import { calculateWeaponStats, calculateZoneStats } from '@/lib/dataUtils';

export default function Home() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/mock_telemetry.json')
      .then((res) => res.json())
      .then((data: TelemetryData) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading telemetry data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-green-400 text-xl font-bold">Loading Telemetry Data...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl font-bold">Error loading data. Please check console.</div>
      </div>
    );
  }

  const weaponStats = calculateWeaponStats(data.matches);
  const zoneStats = calculateZoneStats(data.matches);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <HotDropHeatmap matches={data.matches} />
          <WeaponMetaChart weaponStats={weaponStats} />
        </div>

        <div className="mb-8">
          <WinProbabilityEngine zoneStats={zoneStats} />
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12 pb-8 border-t border-gray-800 pt-8">
          <p className="mb-2">Project Alpha: PUBG Telemetry Analytics Dashboard</p>
          <p>Built with Next.js 14 + TypeScript + Tailwind CSS + Recharts</p>
          <p className="mt-2">Analysis based on {data.matches.length} synthetic matches</p>
        </div>
      </div>
    </main>
  );
}
