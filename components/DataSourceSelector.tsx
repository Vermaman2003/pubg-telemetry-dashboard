'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Database, Loader2 } from 'lucide-react';

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
    const [isOpen, setIsOpen] = useState(false);
    const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load available snapshots
    useEffect(() => {
        async function loadSnapshots() {
            try {
                const response = await fetch('/data/snapshots.json');
                if (response.ok) {
                    const data = await response.json();
                    setSnapshots(data);
                }
            } catch (err) {
                console.log('No historical snapshots available');
            } finally {
                setIsLoading(false);
            }
        }
        loadSnapshots();
    }, []);

    // Build complete source list
    const sources = [
        {
            id: 'live',
            label: '🟢 Live Data',
            date: lastUpdated || new Date().toISOString(),
            matches: 0,
            description: 'Real-time PUBG API data',
            source: 'real'
        },
        ...snapshots,
        {
            id: 'mock',
            label: '🟠 Demo Mode',
            date: '',
            matches: 500,
            description: 'Synthetic data for testing',
            source: 'mock'
        }
    ];

    const currentSourceData = sources.find(s => s.id === currentSource) || sources[0];

    const handleSelect = (sourceId: string) => {
        onSourceChange(sourceId);
        setIsOpen(false);

        // Save preference to localStorage
        try {
            localStorage.setItem('pubg_data_source', sourceId);
        } catch (err) {
            console.log('Could not save preference');
        }
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-800/80 to-gray-700/80 
                    border border-gray-600/50 rounded-xl hover:border-gray-500 transition-all hover:scale-[1.02]
                    backdrop-blur-md shadow-lg"
            >
                <Database className="w-4 h-4 text-purple-400" />
                <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-400 font-medium">Data Source</span>
                    <span className="text-sm font-bold text-white">{currentSourceData.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900/95 backdrop-blur-xl 
                        border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">

                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-700/50">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                Select Data Source
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Switch between live and historical data
                            </p>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="px-4 py-6 flex items-center justify-center gap-2 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading snapshots...</span>
                            </div>
                        )}

                        {/* Source List */}
                        {!isLoading && (
                            <div className="max-h-96 overflow-y-auto">
                                {sources.map((source) => {
                                    const isActive = source.id === currentSource;
                                    const isLive = source.id === 'live';
                                    const isDemo = source.id === 'mock';

                                    return (
                                        <button
                                            key={source.id}
                                            onClick={() => handleSelect(source.id)}
                                            className={`w-full px-4 py-3 text-left transition-all border-b border-gray-800/50
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-l-4 border-l-purple-500'
                                                    : 'hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white">
                                                            {source.label}
                                                        </span>
                                                        {isActive && (
                                                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 
                                                                rounded-full text-xs text-purple-300 font-bold">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {source.description}
                                                    </p>
                                                    {!isDemo && source.date && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {isLive ? 'Updated: ' : 'Archived: '}
                                                            {new Date(source.date).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-gray-300">
                                                        {source.matches > 0 ? source.matches : '—'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">matches</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700/50">
                            <p className="text-xs text-gray-500">
                                💡 Historical data allows comparison of meta changes over time
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
