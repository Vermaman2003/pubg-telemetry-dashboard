'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { WeaponMetric } from '@/lib/types';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

interface WeaponMetaMatrixProps {
    weaponMetrics: WeaponMetric[];
}

export default function WeaponMetaMatrix({ weaponMetrics }: WeaponMetaMatrixProps) {
    // Determine recommendation based on quadrant
    const getRecommendation = (pickRate: number, winRate: number) => {
        if (pickRate >= 20 && winRate >= 50) {
            return { label: 'NERF CANDIDATE', color: '#ff1744', icon: TrendingDown };
        } else if (pickRate < 15 && winRate >= 60) {
            return { label: 'OP BUT RARE', color: '#ff9800', icon: Target };
        } else if (pickRate >= 20 && winRate < 45) {
            return { label: 'NEEDS BUFF', color: '#2196f3', icon: TrendingUp };
        } else if (pickRate < 15 && winRate < 40) {
            return { label: 'BUFF CANDIDATE', color: '#00bcd4', icon: TrendingUp };
        } else {
            return { label: 'BALANCED', color: '#00e676', icon: null };
        }
    };

    // Category colors
    const categoryColors: Record<string, string> = {
        'AR': '#00ff88',
        'SMG': '#ffc107',
        'SR': '#ff6b35',
        'DMR': '#9c27b0'
    };

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-purple-400 mb-1 tracking-tight">WEAPON META MATRIX</h2>
                    <p className="text-sm text-gray-400">Game Balance Analysis • Nerf/Buff Identification</p>
                </div>
                <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="text-xs text-purple-400 uppercase tracking-wider">Balance</div>
                    <div className="text-lg font-bold text-white">Analysis</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 60 }}>
                    <defs>
                        {weaponMetrics.map((metric, index) => (
                            <radialGradient key={index} id={`weapon-gradient-${index}`}>
                                <stop offset="0%" stopColor={categoryColors[metric.category]} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={categoryColors[metric.category]} stopOpacity={0.4} />
                            </radialGradient>
                        ))}
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3f3f" opacity={0.3} />

                    {/* Reference lines for quadrants */}
                    <ReferenceLine y={50} stroke="#ff6b35" strokeDasharray="5 5" strokeWidth={2} opacity={0.5}>
                        <Label value="50% Win Rate" position="right" fill="#ff6b35" fontSize={12} />
                    </ReferenceLine>
                    <ReferenceLine x={20} stroke="#00ff88" strokeDasharray="5 5" strokeWidth={2} opacity={0.5}>
                        <Label value="20% Pick" position="top" fill="#00ff88" fontSize={12} />
                    </ReferenceLine>

                    <XAxis
                        type="number"
                        dataKey="pickRate"
                        name="Pick Rate"
                        unit="%"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontWeight: 600 }}
                        label={{ value: 'Pick Rate (%)', position: 'bottom', fill: '#9ca3af', offset: 30, fontWeight: 'bold' }}
                        domain={[0, 40]}
                    />
                    <YAxis
                        type="number"
                        dataKey="winRate"
                        name="Win Rate"
                        unit="%"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontWeight: 600 }}
                        label={{ value: 'Win Rate (%)', angle: -90, position: 'left', fill: '#9ca3af', offset: 40, fontWeight: 'bold' }}
                        domain={[0, 100]}
                    />

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                                const data = payload[0].payload as WeaponMetric;
                                const rec = getRecommendation(data.pickRate, data.winRate);
                                const Icon = rec.icon;

                                return (
                                    <div className="bg-gray-900/95 backdrop-blur-md border-2 border-purple-500/80 rounded-xl p-4 shadow-2xl shadow-purple-500/40">
                                        <div className="text-purple-400 font-bold text-lg mb-2 flex items-center gap-2">
                                            <Target size={18} />
                                            {data.weapon}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-400">Category:</span>
                                                <span className="font-semibold" style={{ color: categoryColors[data.category] }}>{data.category}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-400">Pick Rate:</span>
                                                <span className="text-white font-bold">{data.pickRate}%</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-400">Win Rate:</span>
                                                <span className="text-white font-bold">{data.winRate}%</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-400">Avg Kills:</span>
                                                <span className="text-orange-400">{data.avgKills}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-400">Total Picks:</span>
                                                <span className="text-blue-400">{data.totalPicks}</span>
                                            </div>
                                            <div className="pt-2 mt-2 border-t border-gray-700">
                                                <div className="flex items-center gap-2 justify-center">
                                                    {Icon && <Icon size={16} />}
                                                    <span className="font-bold text-sm uppercase tracking-wider" style={{ color: rec.color }}>
                                                        {rec.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <Scatter name="Weapons" data={weaponMetrics}>
                        {weaponMetrics.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#weapon-gradient-${index})`}
                                stroke={categoryColors[entry.category]}
                                strokeWidth={2}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* Quadrant Legend */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="text-sm text-gray-300 font-bold mb-3 uppercase tracking-wider">Balancing Decision Matrix:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                        <TrendingDown size={16} className="text-red-500" />
                        <span className="text-xs text-red-400 font-medium">Nerf (High Pick + High Win)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
                        <Target size={16} className="text-orange-500" />
                        <span className="text-xs text-orange-400 font-medium">OP Rare (Low Pick + High Win)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <span className="text-xs text-blue-400 font-medium">Buff (High Pick + Low Win)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-xs text-green-400 font-medium">Balanced</span>
                    </div>
                </div>

                {/* Category Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    {Object.entries(categoryColors).map(([category, color]) => (
                        <div key={category} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="text-gray-400">{category}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
