'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Match } from '@/lib/types';

interface HotDropHeatmapProps {
    matches: Match[];
}

export default function HotDropHeatmap({ matches }: HotDropHeatmapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        match: Match;
    } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const size = 600;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas with darker background
        ctx.fillStyle = '#0f1419';
        ctx.fillRect(0, 0, size, size);

        // Draw border around map
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);

        // Draw grid
        ctx.strokeStyle = '#2a3f3f';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            const pos = (i / 8) * size;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();
        }

        // Draw map label with better visibility
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('ERANGEL', size / 2, size / 2);
        ctx.font = '16px sans-serif';
        ctx.fillText('8000m x 8000m', size / 2, size / 2 + 35);
        ctx.shadowBlur = 0;

        // Plot landing points with better visibility
        matches.forEach((match) => {
            const x = (match.landing_zone.x / 8000) * size;
            const y = (match.landing_zone.y / 8000) * size;
            const minutes = match.time_survived / 60;

            // Color based on survival time - brighter colors
            let color;
            if (minutes < 2) {
                color = '#ff1744'; // Bright red - died early
            } else if (minutes < 15) {
                color = '#ffc107'; // Bright yellow - mid game
            } else {
                color = '#00e676'; // Bright green - survived long
            }

            // Draw larger circles with glow effect
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        });
    }, [matches]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const size = canvas.width;

        // Find nearest match
        let nearestMatch: Match | null = null;
        let nearestDistance = Infinity;

        matches.forEach((match) => {
            const x = (match.landing_zone.x / 8000) * size;
            const y = (match.landing_zone.y / 8000) * size;
            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

            if (distance < 10 && distance < nearestDistance) {
                nearestMatch = match;
                nearestDistance = distance;
            }
        });

        if (nearestMatch) {
            setTooltip({
                x: e.clientX,
                y: e.clientY,
                match: nearestMatch,
            });
        } else {
            setTooltip(null);
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-all">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Hot Drop Heatmap</h2>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-gray-700 rounded cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {tooltip && (
                    <div
                        className="fixed z-50 bg-gray-900 border border-green-500 rounded-lg p-3 text-sm pointer-events-none"
                        style={{
                            left: tooltip.x + 10,
                            top: tooltip.y + 10,
                        }}
                    >
                        <div className="text-green-400 font-bold">{tooltip.match.match_id}</div>
                        <div className="text-gray-300">Zone: {tooltip.match.landing_zone.zone_name}</div>
                        <div className="text-gray-300">Weapon: {tooltip.match.weapon_used}</div>
                        <div className="text-gray-300">Kills: {tooltip.match.kills}</div>
                        <div className="text-gray-300">
                            Survived: {Math.floor(tooltip.match.time_survived / 60)}m {tooltip.match.time_survived % 60}s
                        </div>
                        <div className="text-gray-300">Placement: #{tooltip.match.final_placement}</div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Died &lt;2min</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-300">Survived 2-15min</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Survived &gt;15min</span>
                </div>
            </div>
        </div>
    );
}
