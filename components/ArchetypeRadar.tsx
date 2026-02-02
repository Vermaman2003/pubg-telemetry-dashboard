'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { ArchetypeStats } from '@/lib/types';
import { Users, Target, Shield } from 'lucide-react';

interface ArchetypeRadarProps {
    archetypeStats: ArchetypeStats[];
}

export default function ArchetypeRadar({ archetypeStats }: ArchetypeRadarProps) {
    // Normalize stats to 0-100 scale for radar chart
    const normalizeStats = () => {
        const maxValues = {
            avgSurvival: Math.max(...archetypeStats.map(s => s.avgSurvival)),
            kdRatio: Math.max(...archetypeStats.map(s => s.kdRatio)),
            top10Rate: 100,
            avgMovement: Math.max(...archetypeStats.map(s => s.avgMovement)),
            avgHeadshotRate: 100
        };

        return archetypeStats.map(stat => {
            const archetypeData = [
                {
                    metric: 'Survival',
                    [stat.archetype]: (stat.avgSurvival / maxValues.avgSurvival) * 100,
                    fullMark: 100
                },
                {
                    metric: 'K/D Ratio',
                    [stat.archetype]: (stat.kdRatio / maxValues.kdRatio) * 100,
                    fullMark: 100
                },
                {
                    metric: 'Top 10%',
                    [stat.archetype]: stat.top10Rate,
                    fullMark: 100
                },
                {
                    metric: 'Movement',
                    [stat.archetype]: (stat.avgMovement / maxValues.avgMovement) * 100,
                    fullMark: 100
                },
                {
                    metric: 'Headshot%',
                    [stat.archetype]: stat.avgHeadshotRate,
                    fullMark: 100
                }
            ];
            return { archetype: stat.archetype, data: archetypeData };
        });
    };

    const normalizedData = normalizeStats();

    // Merge all archetype data into single array for radar chart
    const mergedData = normalizedData[0].data.map((item, index) => {
        const merged: any = { metric: item.metric, fullMark: 100 };
        normalizedData.forEach(({ archetype, data }) => {
            merged[archetype] = data[index][archetype];
        });
        return merged;
    });

    const archetypeColors = {
        'Rusher': '#ff1744',
        'Sniper': '#2196f3',
        'Camper': '#00e676'
    };

    const archetypeIcons = {
        'Rusher': Target,
        'Sniper': Target,
        'Camper': Shield
    };

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/60 transition-all duration-500 shadow-2xl hover:shadow-blue-500/20 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-blue-400 mb-1 tracking-tight">PLAYER ARCHETYPES</h2>
                    <p className="text-sm text-gray-400">Behavioral Segmentation Analysis</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Users size={14} />
                        Segments
                    </div>
                    <div className="text-lg font-bold text-white">{archetypeStats.length}</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={450}>
                <RadarChart data={mergedData}>
                    <defs>
                        {archetypeStats.map((stat, index) => (
                            <linearGradient key={index} id={`archetype-gradient-${stat.archetype}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={archetypeColors[stat.archetype]} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={archetypeColors[stat.archetype]} stopOpacity={0.3} />
                            </linearGradient>
                        ))}
                    </defs>

                    <PolarGrid stroke="#2a3f3f" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#9ca3af', fontWeight: 600, fontSize: 14 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />

                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const metric = payload[0].payload.metric;
                                return (
                                    <div className="bg-gray-900/95 backdrop-blur-md border-2 border-blue-500/80 rounded-xl p-4 shadow-2xl shadow-blue-500/40">
                                        <div className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wider">{metric}</div>
                                        <div className="space-y-1">
                                            {payload.map((entry: any, index: number) => (
                                                <div key={index} className="flex justify-between gap-4 text-sm">
                                                    <span className="text-gray-400">{entry.name}:</span>
                                                    <span className="font-bold" style={{ color: entry.stroke }}>
                                                        {entry.value.toFixed(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    {archetypeStats.map((stat) => (
                        <Radar
                            key={stat.archetype}
                            name={stat.archetype}
                            dataKey={stat.archetype}
                            stroke={archetypeColors[stat.archetype]}
                            fill={`url(#archetype-gradient-${stat.archetype})`}
                            fillOpacity={0.5}
                            strokeWidth={2}
                        />
                    ))}

                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={({ payload }) => (
                            <div className="flex justify-center gap-6 mt-4">
                                {payload?.map((entry: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                                        style={{
                                            borderColor: `${entry.color}50`,
                                            backgroundColor: `${entry.color}10`
                                        }}
                                    >
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                        <span className="text-sm font-bold" style={{ color: entry.color }}>
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Archetype Details */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {archetypeStats.map((stat) => {
                        const Icon = archetypeIcons[stat.archetype];
                        return (
                            <div
                                key={stat.archetype}
                                className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border-2 hover:scale-105 transition-all"
                                style={{ borderColor: `${archetypeColors[stat.archetype]}30` }}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full" style={{ backgroundColor: `${archetypeColors[stat.archetype]}10` }}></div>

                                <div className="relative flex items-center gap-3 mb-3">
                                    <Icon size={24} style={{ color: archetypeColors[stat.archetype] }} />
                                    <div>
                                        <div className="font-black text-lg" style={{ color: archetypeColors[stat.archetype] }}>
                                            {stat.archetype}
                                        </div>
                                        <div className="text-xs text-gray-500">{stat.count} players</div>
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Avg Survival:</span>
                                        <span className="text-white font-bold">{stat.avgSurvival}m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">K/D Ratio:</span>
                                        <span className="text-orange-400 font-bold">{stat.kdRatio}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Top 10 Rate:</span>
                                        <span className="text-green-400 font-bold">{stat.top10Rate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Movement:</span>
                                        <span className="text-blue-400 font-bold">{stat.avgMovement}m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Kill Distance:</span>
                                        <span className="text-purple-400 font-bold">{stat.avgKillDistance}m</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
