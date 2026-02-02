'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeaponStat } from '@/lib/types';

interface WeaponMetaChartProps {
    weaponStats: WeaponStat[];
}

export default function WeaponMetaChart({ weaponStats }: WeaponMetaChartProps) {
    // Create gradient colors for bars
    const colors = ['#00ff88', '#00dd77', '#00bb66', '#ff6b35', '#ff8c42', '#ffaa00', '#ffcc00'];

    return (
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-6 hover:border-orange-500/50 transition-all">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Weapon Meta Analysis</h2>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={weaponStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                    <XAxis
                        dataKey="weapon"
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        label={{ value: 'Avg Kills per Match', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1f2e',
                            border: '1px solid #00ff88',
                            borderRadius: '8px',
                            color: '#e5e7eb',
                        }}
                        labelStyle={{ color: '#00ff88', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'avgKills') return [value.toFixed(2), 'Avg Kills'];
                            return [value, name];
                        }}
                    />
                    <Bar dataKey="avgKills" radius={[8, 8, 0, 0]}>
                        {weaponStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Stats summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {weaponStats.slice(0, 4).map((stat) => (
                    <div key={stat.weapon} className="bg-gray-900/50 rounded p-2 border border-gray-700">
                        <div className="text-orange-400 font-bold">{stat.weapon}</div>
                        <div className="text-gray-400">
                            {stat.avgKills.toFixed(1)} avg kills
                        </div>
                        <div className="text-gray-500 text-xs">
                            {stat.usage} matches
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
