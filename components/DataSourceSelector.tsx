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
        {
            id: 'dynamic',
            label: '🟣 Dynamic Mode',
            date: new Date().toISOString(),
            matches: 500,
            description: 'On-demand generated matches',
            source: 'dynamic'
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
        <div className="relative w-full sm:w-auto z-[100]">
            {/* Trigger Button - Responsive */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 
                    bg-gradient-to-r from-gray-800/80 to-gray-700/80 
                    border border-gray-600/50 rounded-lg sm:rounded-xl 
                    hover:border-gray-500 transition-all hover:scale-[1.02]
                    backdrop-blur-md shadow-lg active:scale-95
                    min-h-[44px] touch-manipulation"
            >
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-xs text-gray-400 font-medium hidden sm:block">Data Source</span>
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-none">
                            {currentSourceData.label}
                        </span>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Responsive Positioning */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[101] bg-black/20 sm:bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu - Mobile: Full width bottom sheet, Desktop: Dropdown */}
                    <div className="fixed sm:absolute 
                        left-0 right-0 bottom-0 sm:left-auto sm:right-0 sm:bottom-auto sm:top-full 
                        sm:mt-2 sm:w-80 lg:w-96
                        bg-gray-900/98 sm:bg-gray-900/95 backdrop-blur-xl 
                        border-t sm:border border-gray-700/50 
                        rounded-t-2xl sm:rounded-xl 
                        shadow-2xl z-[102] overflow-hidden 
                        animate-slide-up max-h-[85vh] sm:max-h-[600px]
                        flex flex-col">

                        {/* Header */}
                        <div className="px-4 py-3 sm:py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 
                            border-b border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        Select Data Source
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                                        Switch between live and historical data
                                    </p>
                                </div>
                                {/* Mobile close button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-2 hover:bg-gray-700/50 rounded-lg active:scale-95 touch-manipulation"
                                >
                                    <span className="text-gray-400 text-xl">×</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="px-4 py-8 flex items-center justify-center gap-2 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Loading snapshots...</span>
                            </div>
                        )}

                        {/* Source List - Scrollable */}
                        {!isLoading && (
                            <div className="overflow-y-auto flex-1 overscroll-contain">
                                {sources.map((source) => {
                                    const isActive = source.id === currentSource;
                                    const isLive = source.id === 'live';
                                    const isDemo = source.id === 'mock';

                                    return (
                                        <button
                                            key={source.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(source.id);
                                            }}
                                            type="button"
                                            className={`w-full px-4 py-3 sm:py-3.5 text-left transition-all 
                                                border-b border-gray-800/50
                                                active:scale-[0.98] touch-manipulation
                                                min-h-[60px] sm:min-h-0
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-l-4 border-l-purple-500'
                                                    : 'hover:bg-gray-800/50 active:bg-gray-800/70'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm sm:text-base font-bold text-white break-words">
                                                            {source.label}
                                                        </span>
                                                        {isActive && (
                                                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 
                                                                rounded-full text-xs text-purple-300 font-bold whitespace-nowrap">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                                                        {source.description}
                                                    </p>
                                                    {!isDemo && source.date && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {isLive ? 'Updated: ' : 'Archived: '}
                                                            <span className="hidden sm:inline">
                                                                {new Date(source.date).toLocaleString()}
                                                            </span>
                                                            <span className="sm:hidden">
                                                                {new Date(source.date).toLocaleDateString()}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-sm sm:text-base font-bold text-gray-300">
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
                        <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700/50 flex-shrink-0">
                            <p className="text-xs text-gray-500 text-center sm:text-left">
                                💡 <span className="hidden sm:inline">Historical data allows comparison of meta changes over time</span>
                                <span className="sm:hidden">Compare data over time</span>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
