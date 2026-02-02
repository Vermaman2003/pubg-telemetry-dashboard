'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { WeaponStat } from '@/lib/types';

interface WeaponMetaChartProps {
    weaponStats: WeaponStat[];
}

export default function WeaponMetaChart({ weaponStats }: WeaponMetaChartProps) {
    // High-contrast vibrant colors
    const colors = [
        '#00ff88', // Neon Green
        '#ff1744', // Neon Red
        '#ffea00', // Neon Yellow
        '#00e5ff', // Neon Cyan
        '#e040fb', // Neon Purple
        '#ff6d00', // Neon Orange
        '#76ff03', // Lime Green
    ];

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-orange-500/30 rounded-2xl p-8 hover:border-orange-500/60 transition-all duration-500 shadow-2xl hover:shadow-orange-500/20 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-orange-400 mb-1 tracking-tight">WEAPON PERFORMANCE</h2>
                    <p className="text-sm text-gray-400">Kill Efficiency by Weapon Type</p>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="text-xs text-orange-400 uppercase tracking-wider">Total Weapons</div>
                    <div className="text-lg font-bold text-white">{weaponStats.length}</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={450}>
                <BarChart
                    data={weaponStats}
                    margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                >
                    <defs>
                        {weaponStats.map((entry, index) => (
                            <React.Fragment key={index}>
                                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.6} />
                                </linearGradient>
                                <filter id={`glow-${index}`}>
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </React.Fragment>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3f3f" opacity={0.3} />
                    <XAxis
                        dataKey="weapon"
                        stroke="#9ca3af"
                        tick={{
                            fill: '#ffffff',
                            fontWeight: 900,
                            fontSize: 16,
                            fontFamily: 'monospace'
                        }}
                        tickLine={{ stroke: '#9ca3af' }}
                        height={60}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        label={{
                            value: 'Average Kills per Match',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#ffaa00',
                            fontWeight: 'bold',
                            fontSize: 15
                        }}
                        tick={{ fill: '#ffffff', fontWeight: 700, fontSize: 14 }}
                        tickLine={{ stroke: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                            border: '3px solid #ff6b35',
                            borderRadius: '16px',
                            color: '#ffffff',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)',
                            padding: '16px 20px'
                        }}
                        labelStyle={{
                            color: '#ffaa00',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            marginBottom: '8px'
                        }}
                        formatter={(value: number | undefined, name: string | undefined) => {
                            if (value === undefined || name === undefined) return ['N/A', 'Unknown'];
                            if (name === 'avgKills') return [value.toFixed(2), 'Avg Kills'];
                            return [value, name];
                        }}
                        cursor={{ fill: 'rgba(255, 107, 53, 0.15)' }}
                    />
                    <Bar dataKey="avgKills" radius={[16, 16, 0, 0]} maxBarSize={90}>
                        {weaponStats.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${index})`}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                filter={`url(#glow-${index})`}
                            />
                        ))}
                        <LabelList
                            dataKey="avgKills"
                            position="top"
                            formatter={(value: string | number | boolean | undefined | null) => typeof value === 'number' ? value.toFixed(1) : ''}
                            style={{
                                fill: '#ffffff',
                                fontWeight: 900,
                                fontSize: '18px',
                                textShadow: '0 0 12px rgba(0, 0, 0, 1), 0 0 24px rgba(0, 0, 0, 0.8)',
                                fontFamily: 'monospace',
                                stroke: '#000000',
                                strokeWidth: 0.5,
                                paintOrder: 'stroke fill'
                            }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Enhanced stats summary */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="text-sm text-gray-300 font-bold mb-3 uppercase tracking-wider">Top Performers:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weaponStats.slice(0, 4).map((stat, index) => (
                        <div
                            key={stat.weapon}
                            className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-5 border-2 hover:border-opacity-100 transition-all hover:scale-105 hover:shadow-xl"
                            style={{
                                borderColor: colors[index % colors.length],
                                boxShadow: `0 0 20px ${colors[index % colors.length]}30`
                            }}
                        >
                            <div
                                className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-30"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <div
                                className="text-xl font-black mb-2 font-mono"
                                style={{
                                    color: colors[index % colors.length],
                                    textShadow: `0 0 10px ${colors[index % colors.length]}80`
                                }}
                            >
                                {stat.weapon}
                            </div>
                            <div className="text-white text-3xl font-black mb-1" style={{
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                            }}>
                                {stat.avgKills.toFixed(2)}
                            </div>
                            <div className="text-gray-300 text-xs uppercase tracking-wider font-semibold">
                                {stat.usage} matches • {stat.totalKills} kills
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
