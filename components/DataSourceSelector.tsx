'use client';

import React, { useState, useEffect } from 'react';
import { Database, Sparkles } from 'lucide-react';

interface DataSnapshot {
    id: string;
    label: string;
    date: string;
    matches: number;
    description: string;
    source: string;
}

interface DataSourceSelectorProps {
    currentSource: string;
    onSourceChange: (sourceId: string) => void;
    lastUpdated: string | null;
}

export default function DataSourceSelector({
    currentSource,
    onSourceChange,
    lastUpdated
}: DataSourceSelectorProps) {
    const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);

    useEffect(() => {
        fetch('/data/snapshots.json')
            .then(res => res.ok ? res.json() : [])
            .then(data => setSnapshots(data))
            .catch(() => setSnapshots([]));
    }, []);

    const sources = [
        { id: 'live', label: '🟢 Live Data', color: 'from-green-500/20 to-emerald-500/20 border-green-500/40' },
        { id: 'dynamic', label: '🟣 Dynamic Mode', color: 'from-purple-500/20 to-blue-500/20 border-purple-500/40' },
        ...snapshots.map(s => ({ id: s.id, label: s.label, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40' })),
        { id: 'mock', label: '🟠 Demo Mode', color: 'from-orange-500/20 to-red-500/20 border-orange-500/40' }
    ];

    const currentSourceData = sources.find(s => s.id === currentSource) || sources[0];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSource = e.target.value;
        console.log('📍 DataSourceSelector: Changing from', currentSource, 'to', newSource);
        onSourceChange(newSource);
        try {
            localStorage.setItem('pubg_data_source', newSource);
        } catch (err) {
            console.error('Failed to save preference:', err);
        }
    };

    return (
        <div className="relative group">
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${currentSourceData.color} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>

            <div className="relative">
                <label className="flex flex-col gap-2">
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-2 px-1">
                        <Database className="w-3.5 h-3.5 text-purple-400" />
                        Data Source
                        <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                    </span>

                    <div className="relative">
                        <select
                            value={currentSource}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pr-10
                                bg-gradient-to-br ${currentSourceData.color}
                                backdrop-blur-xl
                                border-2 ${currentSourceData.color.split(' ').pop()}
                                rounded-xl
                                text-sm font-bold text-white
                                hover:scale-[1.02] hover:shadow-lg
                                focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                transition-all duration-200
                                cursor-pointer
                                min-w-[220px]
                                appearance-none
                                shadow-lg
                                hover:brightness-110`}
                            style={{
                                backgroundImage: `linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)),
                                                 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'center, right 0.75rem center',
                                backgroundRepeat: 'no-repeat, no-repeat',
                                backgroundSize: 'cover, 1.25em 1.25em',
                            }}
                        >
                            {sources.map(source => (
                                <option
                                    key={source.id}
                                    value={source.id}
                                    className="bg-gray-900 text-white py-2"
                                >
                                    {source.label}
                                </option>
                            ))}
                        </select>

                        {/* Animated border */}
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent 
                            bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 
                            opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                padding: '2px'
                            }}
                        ></div>
                    </div>
                </label>

                {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-2 px-1 flex items-center gap-1.5 font-medium">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Updated: {new Date(lastUpdated).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
