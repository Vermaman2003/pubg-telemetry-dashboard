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
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-green-500/30 rounded-2xl p-10 mb-8 shadow-2xl shadow-green-500/20">
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-orange-500/10 to-green-500/10 animate-pulse-bg"></div>

            {/* Diagonal stripes pattern */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #00ff88 0px, #00ff88 1px, transparent 1px, transparent 20px)',
            }}></div>

            {/* Glowing orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10">
                {/* Header with title and refresh button */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex-1">
                        {/* Enhanced title with layered effects */}
                        <div className="text-sm uppercase tracking-[0.3em] text-green-400/80 font-semibold mb-2 animate-pulse">
                            Krafton | Esports Analytics
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,136,0.5)] animate-gradient-x">
                            PROJECT ALPHA
                        </h1>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
                            PUBG Telemetry Intelligence System
                        </div>
                    </div>

                    {/* Refresh Button - Only shown in dynamic mode */}
                    {showRefreshButton && onRefreshData && (
                        <button
                            onClick={onRefreshData}
                            disabled={isRefreshing}
                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 
                                bg-gradient-to-r from-purple-600 to-blue-600 
                                hover:from-purple-500 hover:to-blue-500 
                                disabled:from-gray-600 disabled:to-gray-700
                                rounded-xl font-bold text-white text-sm sm:text-base
                                transition-all hover:scale-105 active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed
                                shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                                border border-purple-400/30
                                w-full sm:w-auto
                                min-h-[44px]"
                        >
                            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>
                                {isRefreshing ? 'Generating...' : 'Simulate New Matches'}
                            </span>
                        </button>
                    )}
                </div>

                <div className="h-1 w-40 bg-gradient-to-r from-green-400 to-orange-400 rounded-full mb-6 shadow-lg shadow-green-500/50"></div>

                <p className="text-gray-300 text-lg mb-8 max-w-2xl leading-relaxed">
                    Advanced multi-dimensional analysis of <span className="text-green-400 font-bold">500 competitive matches</span> revealing the risk-reward dynamics of tactical positioning and weapon meta trends.
                </p>

                {/* Enhanced stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-2 border-green-500/40 rounded-xl p-6 hover:border-green-500/80 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full"></div>
                        <div className="relative">
                            <div className="text-green-400 text-5xl font-black mb-2 tracking-tight">500</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Tactical Engagements</div>
                            <div className="mt-3 text-xs text-green-400/70">Complete Dataset</div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-2 border-orange-500/40 rounded-xl p-6 hover:border-orange-500/80 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-full"></div>
                        <div className="relative">
                            <div className="text-orange-400 text-5xl font-black mb-2 tracking-tight">~30%</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Hot Drop Survival</div>
                            <div className="mt-3 text-xs text-orange-400/70">High-Risk Zones</div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-2 border-green-500/40 rounded-xl p-6 hover:border-green-500/80 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full"></div>
                        <div className="relative">
                            <div className="text-green-400 text-5xl font-black mb-2 tracking-tight font-mono">M416</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Dominant Meta</div>
                            <div className="mt-3 text-xs text-green-400/70">2.5 Avg Kills</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
