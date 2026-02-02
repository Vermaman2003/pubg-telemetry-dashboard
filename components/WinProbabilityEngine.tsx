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

    const getRiskLevel = (avgSurvival: number) => {
        if (avgSurvival < 5) return { label: '🔴 EXTREME RISK', color: 'red', percent: 90 };
        if (avgSurvival < 10) return { label: '🟠 HIGH RISK', color: 'orange', percent: 60 };
        if (avgSurvival < 15) return { label: '🟡 MEDIUM RISK', color: 'yellow', percent: 40 };
        return { label: '🟢 LOW RISK', color: 'green', percent: 20 };
    };

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-green-500/30 rounded-2xl p-8 hover:border-green-500/60 transition-all duration-500 shadow-2xl hover:shadow-green-500/20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-green-400 mb-1 tracking-tight">PROBABILITY ENGINE</h2>
                    <p className="text-sm text-gray-400">Predictive Win Rate Calculator</p>
                </div>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-xs text-green-400 uppercase tracking-wider">AI Powered</div>
                    <div className="text-lg font-bold text-white">Live</div>
                </div>
            </div>

            <div className="mb-8">
                <label className="block text-gray-300 mb-3 font-bold text-sm uppercase tracking-wider">
                    Select Landing Zone:
                </label>
                <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-green-500/50 rounded-xl px-6 py-4 text-white text-lg font-semibold focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all cursor-pointer hover:border-green-500/80 shadow-lg"
                >
                    {zoneStats.map((stat) => (
                        <option key={stat.zone} value={stat.zone} className="bg-gray-900">
                            {stat.zone} • {stat.totalMatches} drops
                        </option>
                    ))}
                </select>
            </div>

            {currentStat && (
                <div className="space-y-8">
                    {/* Win Probability Display */}
                    <div className="relative">
                        <div className="text-center bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl p-10 border-2 border-green-500/50 shadow-2xl shadow-green-500/20 overflow-hidden">
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>

                            <div className="relative z-10">
                                <div className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-3 font-bold">PREDICTED WIN RATE</div>
                                <div className="relative inline-block">
                                    <div className="text-8xl md:text-9xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-gradient-x">
                                        {currentStat.winRate.toFixed(1)}%
                                    </div>
                                    {/* Orbiting particles effect */}
                                    <div className="absolute -top-4 -right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                                <div className="text-gray-400 text-sm mt-4 font-medium">
                                    Based on <span className="text-green-400 font-bold">{currentStat.totalMatches}</span> historical engagements
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supporting Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-700/50 rounded-xl p-5 hover:border-orange-500/50 transition-all hover:scale-105 group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Survival Time</div>
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <div className="text-orange-400 text-lg">⏱️</div>
                                </div>
                            </div>
                            <div className="text-orange-400 text-4xl font-black">
                                {currentStat.avgSurvival.toFixed(1)}<span className="text-2xl">m</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">Average Duration</div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all hover:scale-105 group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Placement</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <div className="text-blue-400 text-lg">🏆</div>
                                </div>
                            </div>
                            <div className="text-blue-400 text-4xl font-black">
                                #{currentStat.avgPlacement.toFixed(0)}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">Avg. Finish</div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-700/50 rounded-xl p-5 hover:border-red-500/50 transition-all hover:scale-105 group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Eliminations</div>
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <div className="text-red-400 text-lg">💀</div>
                                </div>
                            </div>
                            <div className="text-red-400 text-4xl font-black">
                                {currentStat.avgKills.toFixed(1)}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">Avg. Kills</div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    {(() => {
                        const risk = getRiskLevel(currentStat.avgSurvival);
                        return (
                            <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border-2 border-gray-700/50 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-white font-bold text-lg">TACTICAL ASSESSMENT</div>
                                    <div className={`px-4 py-2 rounded-lg font-bold text-sm bg-${risk.color}-500/20 text-${risk.color}-400 border border-${risk.color}-500/50`}>
                                        {risk.label}
                                    </div>
                                </div>
                                <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${risk.color === 'red' ? 'from-red-600 to-red-500' :
                                                risk.color === 'orange' ? 'from-orange-600 to-orange-500' :
                                                    risk.color === 'yellow' ? 'from-yellow-600 to-yellow-500' :
                                                        'from-green-600 to-green-500'
                                            }`}
                                        style={{ width: `${Math.min((currentStat.avgSurvival / 25) * 100, 100)}%` }}
                                    >
                                        <div className="h-full w-full bg-gradient-to-r from-transparent to-white/30"></div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-400">
                                    Zone survivability index: {Math.min((currentStat.avgSurvival / 25) * 100, 100).toFixed(0)}%
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
