'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeroSectionProps {
    onRefreshData?: () => Promise<void>;
    isRefreshing?: boolean;
    showRefreshButton?: boolean;
}

export default function HeroSection({ onRefreshData, isRefreshing = false, showRefreshButton = false }: HeroSectionProps) {
    return (
        <div className="relative overflow-hidden backdrop-blur-glass border-2 border-emerald-500/30 rounded-xl p-8 mb-6 shadow-glow-green">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 animate-pulse-bg"></div>

            {/* Diagonal tech lines */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #00ff88 0px, #00ff88 1px, transparent 1px, transparent 20px)',
            }}></div>

            {/* Glow orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10">
                {/* Header with title and refresh button */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-wider">
                            <span className="text-emerald-400 text-glow-green">PUBG TELEMETRY</span>
                        </h1>
                        <p className="text-lg text-emerald-300/80 font-medium tracking-wide">
                            Advanced Battle Royale Analytics
                        </p>
                    </div>

                    {/* Refresh Button - Only show in dynamic mode */}
                    {showRefreshButton && onRefreshData && (
                        <button
                            onClick={onRefreshData}
                            disabled={isRefreshing}
                            className="px-6 py-3 
                                bg-gradient-to-r from-emerald-600 to-teal-600 
                                hover:from-emerald-500 hover:to-teal-500
                                disabled:from-gray-600 disabled:to-gray-700
                                border-2 border-emerald-400/50
                                rounded-lg font-bold text-white
                                shadow-glow-green
                                transition-all duration-300
                                flex items-center gap-2
                                hover:scale-105
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <RefreshCw
                                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                            <span className="whitespace-nowrap">
                                {isRefreshing ? 'Generating...' : 'Simulate New Matches'}
                            </span>
                        </button>
                    )}
                </div>

                {/* Subtitle */}
                <div className="flex flex-wrap gap-3 items-center text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow-green"></div>
                        <span className="font-bold text-emerald-200 tracking-wide">
                            ADVANCED ANALYTICS v2.0
                        </span>
                    </div>
                    <div className="text-teal-300/70 font-medium">
                        • Game Balancing • Player Segmentation
                    </div>
                </div>
            </div>

            {/* Tech corner details */}
            <div className="absolute top-2 right-2 w-16 h-16 border-r-2 border-t-2 border-emerald-500/20 rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-16 h-16 border-l-2 border-b-2 border-emerald-500/20 rounded-bl-lg"></div>
        </div>
    );
}
