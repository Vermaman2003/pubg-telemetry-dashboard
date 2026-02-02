'use client';

import React from 'react';

export default function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-green-500/20 rounded-lg p-8 mb-8">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-orange-500/5 animate-pulse-bg"></div>

            <div className="relative z-10">
                <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-orange-400 animate-glow">
                    Project Alpha: PUBG Telemetry Analysis
                </h1>

                <p className="text-gray-300 text-lg mb-6">
                    Analysis of 500 Matches: Risk vs. Reward
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4 hover:border-green-500/60 transition-all hover:shadow-lg hover:shadow-green-500/20">
                        <div className="text-green-400 text-3xl font-bold">500</div>
                        <div className="text-gray-400 text-sm mt-1">Matches Analyzed</div>
                    </div>

                    <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/60 transition-all hover:shadow-lg hover:shadow-orange-500/20">
                        <div className="text-orange-400 text-3xl font-bold">~30%</div>
                        <div className="text-gray-400 text-sm mt-1">Hot Drop Survival Rate</div>
                    </div>

                    <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4 hover:border-green-500/60 transition-all hover:shadow-lg hover:shadow-green-500/20">
                        <div className="text-green-400 text-3xl font-bold">M416</div>
                        <div className="text-gray-400 text-sm mt-1">Top Weapon Meta</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
