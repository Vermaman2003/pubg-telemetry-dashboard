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
        console.log('🎯 DataSourceSelector: handleSelect called with:', sourceId);
        console.log('   Current source:', currentSource);
        console.log('   Calling onSourceChange...');

        // SIMPLIFIED: Just call the callback and close
        onSourceChange(sourceId);

        // Save preference to localStorage
        try {
            localStorage.setItem('pubg_data_source', sourceId);
            console.log('   ✅ Saved to localStorage:', sourceId);
        } catch (err) {
            console.log('   ⚠️ Could not save preference:', err);
        }

        // Close the dropdown AFTER updating
        setTimeout(() => {
            setIsOpen(false);
            console.log('   🎯 handleSelect complete, dropdown closed');
        }, 100);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-dropdown-container]')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative w-full sm:w-auto z-[100]" data-dropdown-container>
            {/* Trigger Button */}
            <button
                onClick={() => {
                    console.log('📍 Dropdown button clicked, current isOpen:', isOpen);
                    setIsOpen(!isOpen);
                }}
                type="button"
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

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-full sm:w-80 lg:w-96
                        bg-gray-900/98 backdrop-blur-xl 
                        border border-gray-700/50 
                        rounded-xl 
                        shadow-2xl z-[102] overflow-hidden 
                        max-h-[500px]
                        flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 
                        border-b border-gray-700/50 flex-shrink-0">
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            Select Data Source
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                            Switch between live and historical data
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="px-4 py-8 flex items-center justify-center gap-2 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading snapshots...</span>
                        </div>
                    )}

                    {/* Source List */}
                    {!isLoading && (
                        <div className="overflow-y-auto flex-1">
                            {sources.map((source) => {
                                const isActive = source.id === currentSource;
                                const isLive = source.id === 'live';
                                const isDemo = source.id === 'mock';

                                return (
                                    <button
                                        key={source.id}
                                        onClick={() => {
                                            console.log('🖱️  Clicked on source:', source.id);
                                            handleSelect(source.id);
                                        }}
                                        type="button"
                                        className={`w-full px-4 py-3 sm:py-3.5 text-left transition-all 
                                            border-b border-gray-800/50
                                            hover:bg-gray-800/50 active:bg-gray-800/70
                                            cursor-pointer
                                            ${isActive
                                                ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-l-4 border-l-purple-500'
                                                : ''
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
                                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                                    {source.description}
                                                </p>
                                                {!isDemo && source.date && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {isLive ? 'Updated: ' : 'Archived: '}
                                                        {new Date(source.date).toLocaleString()}
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
                            💡 <span className="hidden sm:inline">Click any option to switch data source</span>
                            <span className="sm:hidden">Click to switch</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
