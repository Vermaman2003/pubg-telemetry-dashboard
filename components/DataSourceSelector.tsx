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
        { id: 'live', label: '🟢 Live Data', color: 'emerald' },
        { id: 'dynamic', label: '🟣 Dynamic Mode', color: 'purple' },
        ...snapshots.map(s => ({ id: s.id, label: s.label, color: 'blue' })),
        { id: 'mock', label: '🟠 Demo Mode', color: 'orange' }
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-lg blur opacity-50 group-hover:opacity-70 transition duration-300"></div>

            <div className="relative backdrop-blur-glass border-2 border-emerald-500/30 rounded-lg p-4">
                <label className="flex flex-col gap-2">
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-2 tracking-wider uppercase">
                        <Database className="w-4 h-4 text-emerald-400" />
                        Data Source
                        <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                    </span>

                    <div className="relative">
                        <select
                            value={currentSource}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pr-10
                                bg-gradient-to-br from-emerald-950/50 to-teal-950/50
                                backdrop-blur-sm
                                border-2 border-emerald-500/40
                                rounded-md
                                text-sm font-bold text-emerald-100
                                hover:border-emerald-400/60 hover:shadow-glow-green
                                focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400
                                transition-all duration-200
                                cursor-pointer
                                min-w-[220px]
                                appearance-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300ff88' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'right 0.75rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.25em 1.25em',
                            }}
                        >
                            {sources.map(source => (
                                <option
                                    key={source.id}
                                    value={source.id}
                                    className="bg-[#0a1e1e] text-emerald-100 py-2"
                                >
                                    {source.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>

                {lastUpdated && (
                    <div className="text-xs text-teal-400/80 mt-2 flex items-center gap-2 font-mono">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-glow-green"></div>
                        <span>UPDT: {new Date(lastUpdated).toLocaleString('en-US', {
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
