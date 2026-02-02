'use client';

import React from 'react';

export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 animate-pulse">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Skeleton */}
                <div className="h-64 bg-gray-800/50 rounded-2xl border border-gray-700"></div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-96 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
                    <div className="h-96 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-96 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
                    <div className="h-96 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
                </div>

                <div className="h-96 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
            </div>
        </div>
    );
}
