'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeaponStat } from '@/lib/types';

interface WeaponMetaChartProps {
    weaponStats: WeaponStat[];
}

export default function WeaponMetaChart({ weaponStats }: WeaponMetaChartProps) {
    const colors = ['#00ff88', '#00e676', '#00d16a', '#ff6b35', '#ff8c42', '#ffaa00', '#ffc107'];

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-orange-500/30 rounded-2xl p-8 hover:border-orange-500/60 transition-all duration-500 shadow-2xl hover:shadow-orange-500/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-orange-400 mb-1 tracking-tight">WEAPON META</h2>
                    <p className="text-sm text-gray-400">Kill Efficiency Analysis</p>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="text-xs text-orange-400 uppercase tracking-wider">Avg Kills</div>
                    <div className="text-lg font-bold text-white">Per Match</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={weaponStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                    <defs>
                        {weaponStats.map((entry, index) => (
                            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.6} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3f3f" opacity={0.3} />
                    <XAxis
                        dataKey="weapon"
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: '#9ca3af', fontWeight: 600 }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        label={{ value: 'Average Kills', angle: -90, position: 'insideLeft', fill: '#ff6b35', fontWeight: 'bold' }}
                        tick={{ fill: '#9ca3af', fontWeight: 600 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(10, 14, 20, 0.95)',
                            border: '2px solid #ff6b35',
                            borderRadius: '12px',
                            color: '#e5e7eb',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 0 30px rgba(255, 107, 53, 0.3)',
                        }}
                        labelStyle={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '16px' }}
                        formatter={(value: number | undefined, name: string | undefined) => {
                            if (value === undefined || name === undefined) return ['N/A', 'Unknown'];
                            if (name === 'avgKills') return [value.toFixed(2), 'Avg Kills'];
                            return [value, name];
                        }}
                    />
                    <Bar dataKey="avgKills" radius={[12, 12, 0, 0]} maxBarSize={80}>
                        {weaponStats.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${index})`}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Enhanced stats summary */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weaponStats.slice(0, 4).map((stat, index) => (
                        <div key={stat.weapon} className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/10 rounded-bl-full"></div>
                            <div className="text-orange-400 font-black text-xl mb-1 font-mono">{stat.weapon}</div>
                            <div className="text-white text-2xl font-bold mb-1">
                                {stat.avgKills.toFixed(1)}
                            </div>
                            <div className="text-gray-500 text-xs uppercase tracking-wider">
                                {stat.usage} matches
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
