'use client';

import React, { useState, useEffect } from 'react';
import { ZoneStat } from '@/lib/types';

interface WinProbabilityEngineProps {
    zoneStats: ZoneStat[];
}

export default function WinProbabilityEngine({ zoneStats }: WinProbabilityEngineProps) {
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [currentStat, setCurrentStat] = useState<ZoneStat | null>(null);

    useEffect(() => {
        if (zoneStats.length > 0 && !selectedZone) {
            setSelectedZone(zoneStats[0].zone);
        }
    }, [zoneStats, selectedZone]);

    useEffect(() => {
        const stat = zoneStats.find((s) => s.zone === selectedZone);
        setCurrentStat(stat || null);
    }, [selectedZone, zoneStats]);

    return (
        <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-all">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Win Probability Engine</h2>

            <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">Select Landing Zone:</label>
                <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-gray-900 border border-green-500/50 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer"
                >
                    {zoneStats.map((stat) => (
                        <option key={stat.zone} value={stat.zone}>
                            {stat.zone} ({stat.totalMatches} matches)
                        </option>
                    ))}
                </select>
            </div>

            {currentStat && (
                <div className="space-y-6">
                    {/* Win Probability Display */}
                    <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-lg p-8 border border-green-500/50 shadow-lg shadow-green-500/10">
                        <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Win Probability</div>
                        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-orange-400 animate-glow">
                            {currentStat.winRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 text-sm mt-2">
                            Based on {currentStat.totalMatches} historical matches
                        </div>
                    </div>

                    {/* Supporting Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-all">
                            <div className="text-orange-400 text-2xl font-bold">
                                {currentStat.avgSurvival.toFixed(1)}m
                            </div>
                            <div className="text-gray-400 text-sm mt-1">Avg. Survival Time</div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-all">
                            <div className="text-orange-400 text-2xl font-bold">
                                #{currentStat.avgPlacement.toFixed(0)}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">Avg. Placement</div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-all">
                            <div className="text-orange-400 text-2xl font-bold">
                                {currentStat.avgKills.toFixed(1)}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">Avg. Kills</div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <div className="text-gray-300 font-medium mb-2">Risk Assessment:</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${currentStat.avgSurvival < 5
                                            ? 'bg-red-500'
                                            : currentStat.avgSurvival < 10
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min((currentStat.avgSurvival / 25) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-gray-400 text-sm whitespace-nowrap">
                                {currentStat.avgSurvival < 5
                                    ? '🔴 High Risk'
                                    : currentStat.avgSurvival < 10
                                        ? '🟡 Medium Risk'
                                        : '🟢 Low Risk'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
