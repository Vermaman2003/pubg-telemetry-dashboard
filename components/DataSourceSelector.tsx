'use client';

import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

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
        { id: 'live', label: '🟢 Live Data' },
        { id: 'dynamic', label: '🟣 Dynamic Mode' },
        ...snapshots.map(s => ({ id: s.id, label: s.label })),
        { id: 'mock', label: '🟠 Demo Mode' }
    ];

    const currentLabel = sources.find(s => s.id === currentSource)?.label || '🟢 Live Data';

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
        <div className="relative">
            <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    Data Source
                </span>
                <select
                    value={currentSource}
                    onChange={handleChange}
                    className="px-4 py-2.5 pr-10
                        bg-gradient-to-r from-gray-800/80 to-gray-700/80 
                        border border-gray-600/50 rounded-xl
                        text-sm font-bold text-white
                        hover:border-gray-500 
                        focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50
                        transition-all
                        cursor-pointer
                        min-w-[200px]
                        appearance-none
                        backdrop-blur-md"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em'
                    }}
                >
                    {sources.map(source => (
                        <option key={source.id} value={source.id}>
                            {source.label}
                        </option>
                    ))}
                </select>
            </label>
            {lastUpdated && (
                <div className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(lastUpdated).toLocaleString()}
                </div>
            )}
        </div>
    );
}
