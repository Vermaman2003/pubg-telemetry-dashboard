'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { WeaponStat } from '@/lib/types';

interface WeaponMetaChartProps {
    weaponStats: WeaponStat[];
}

export default function WeaponMetaChart({ weaponStats }: WeaponMetaChartProps) {
    // Enhanced color palette with better contrast and visibility
    const colors = [
        '#00ff88', // Bright Cyan-Green
        '#ff6b35', // Vibrant Orange
        '#ffc107', // Golden Yellow
        '#2196f3', // Bright Blue
        '#e91e63', // Pink
        '#9c27b0', // Purple
        '#00e676', // Light Green
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
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <defs>
                        {weaponStats.map((entry, index) => (
                            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.5} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3f3f" opacity={0.3} />
                    <XAxis
                        dataKey="weapon"
                        stroke="#9ca3af"
                        tick={{ fill: '#e5e7eb', fontWeight: 700, fontSize: 14 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        height={60}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        label={{
                            value: 'Average Kills per Match',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#ff8c42',
                            fontWeight: 'bold',
                            fontSize: 14
                        }}
                        tick={{ fill: '#e5e7eb', fontWeight: 600, fontSize: 13 }}
                        tickLine={{ stroke: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(10, 14, 20, 0.98)',
                            border: '2px solid #ff6b35',
                            borderRadius: '16px',
                            color: '#e5e7eb',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)',
                            padding: '12px 16px'
                        }}
                        labelStyle={{ color: '#ff8c42', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}
                        formatter={(value: number | undefined, name: string | undefined) => {
                            if (value === undefined || name === undefined) return ['N/A', 'Unknown'];
                            if (name === 'avgKills') return [value.toFixed(2), 'Avg Kills'];
                            return [value, name];
                        }}
                        cursor={{ fill: 'rgba(255, 107, 53, 0.1)' }}
                    />
                    <Bar dataKey="avgKills" radius={[16, 16, 0, 0]} maxBarSize={90}>
                        {weaponStats.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${index})`}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                            />
                        ))}
                        <LabelList
                            dataKey="avgKills"
                            position="top"
                            formatter={(value: number) => value.toFixed(1)}
                            style={{
                                fill: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                textShadow: '0 0 8px rgba(0, 0, 0, 0.8)'
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
                            className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border-2 hover:border-opacity-100 transition-all hover:scale-105 hover:shadow-lg"
                            style={{
                                borderColor: `${colors[index % colors.length]}30`,
                            }}
                        >
                            <div
                                className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <div
                                className="text-xl font-black mb-2 font-mono"
                                style={{ color: colors[index % colors.length] }}
                            >
                                {stat.weapon}
                            </div>
                            <div className="text-white text-3xl font-bold mb-1">
                                {stat.avgKills.toFixed(2)}
                            </div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider">
                                {stat.usage} matches • {stat.totalKills} kills
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
