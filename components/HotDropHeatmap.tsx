'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Match } from '@/lib/types';

interface HotDropHeatmapProps {
    matches: Match[];
    selectedZone?: string | null;
    onZoneClick?: (zone: string | null) => void;
}

export default function HotDropHeatmap({ matches, selectedZone, onZoneClick }: HotDropHeatmapProps) {
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

        // Create radial gradient background
        const bgGradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        bgGradient.addColorStop(0, '#1a2332');
        bgGradient.addColorStop(1, '#0a0e14');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, size, size);

        // Draw glowing border
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.strokeRect(0, 0, size, size);
        ctx.shadowBlur = 0;

        // Draw corner accents
        const drawCorner = (x: number, y: number, flipX: number, flipY: number) => {
            ctx.strokeStyle = '#ff6b35';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff6b35';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x, y + 30 * flipY);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 30 * flipX, y);
            ctx.stroke();
            ctx.shadowBlur = 0;
        };
        drawCorner(0, 0, 1, 1);
        drawCorner(size, 0, -1, 1);
        drawCorner(0, size, 1, -1);
        drawCorner(size, size, -1, -1);

        // Draw enhanced grid with depth
        ctx.strokeStyle = '#2a3f3f';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            const pos = (i / 8) * size;
            const opacity = i === 0 || i === 8 ? 0.6 : 0.3;
            ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw central crosshair
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(size / 2 - 20, size / 2);
        ctx.lineTo(size / 2 + 20, size / 2);
        ctx.moveTo(size / 2, size / 2 - 20);
        ctx.lineTo(size / 2, size / 2 + 20);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw map label with premium styling
        const gradient = ctx.createLinearGradient(0, size / 2 - 40, 0, size / 2 + 40);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00dd77');

        ctx.fillStyle = gradient;
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('ERANGEL', size / 2, size / 2 - 10);

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.fillText('[ 8000m × 8000m ]', size / 2, size / 2 + 30);

        // Add tactical indicator
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ff6b35';
        ctx.shadowColor = '#ff6b35';
        ctx.fillText('TACTICAL OVERVIEW', size / 2, size / 2 + 50);
        ctx.shadowBlur = 0;

        // Plot landing points with enhanced visuals
        matches.forEach((match, index) => {
            const x = (match.landing_zone.x / 8000) * size;
            const y = (match.landing_zone.y / 8000) * size;
            const minutes = match.time_survived / 60;

            // Color based on survival time with enhanced palette
            let color, glowColor;
            if (minutes < 2) {
                color = '#ff1744';
                glowColor = 'rgba(255, 23, 68, 0.6)';
            } else if (minutes < 15) {
                color = '#ffc107';
                glowColor = 'rgba(255, 193, 7, 0.6)';
            } else {
                color = '#00e676';
                glowColor = 'rgba(0, 230, 118, 0.6)';
            }

            // Draw outer glow
            const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
            outerGradient.addColorStop(0, glowColor);
            outerGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, 2 * Math.PI);
            ctx.fill();

            // Draw main circle with gradient
            const innerGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, 8);
            innerGradient.addColorStop(0, color);
            innerGradient.addColorStop(1, color + 'CC');
            ctx.fillStyle = innerGradient;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, 2 * Math.PI);
            ctx.fill();

            // Add highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x - 2, y - 2, 2, 0, 2 * Math.PI);
            ctx.fill();

            ctx.globalAlpha = 1;
        });

        // Add scan line effect
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < size; i += 4) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

    }, [matches]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        const size = canvas.width;

        let nearestMatch: Match | null = null;
        let nearestDistance = Infinity;

        matches.forEach((match) => {
            const x = (match.landing_zone.x / 8000) * size;
            const y = (match.landing_zone.y / 8000) * size;
            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

            if (distance < 15 && distance < nearestDistance) {
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
        <div className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-green-500/30 rounded-2xl p-8 hover:border-green-500/60 transition-all duration-500 shadow-2xl hover:shadow-green-500/20 animate-slide-up">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-green-400 mb-1 tracking-tight">TACTICAL HEATMAP</h2>
                    <p className="text-sm text-gray-400">Landing Zone Distribution Analysis</p>
                </div>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-xs text-green-400 uppercase tracking-wider">Live Data</div>
                    <div className="text-lg font-bold text-white">{matches.length} Drops</div>
                </div>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-auto rounded-xl cursor-crosshair transition-all duration-300 group-hover:scale-[1.02]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {tooltip && (
                    <div
                        className="fixed z-50 bg-gray-900/95 backdrop-blur-md border-2 border-green-500/80 rounded-xl p-4 text-sm pointer-events-none shadow-2xl shadow-green-500/40 animate-slide-up"
                        style={{
                            left: tooltip.x + 15,
                            top: tooltip.y + 15,
                        }}
                    >
                        <div className="text-green-400 font-bold text-lg mb-2">{tooltip.match.match_id}</div>
                        <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Zone:</span>
                                <span className="text-white font-semibold">{tooltip.match.landing_zone.zone_name}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Weapon:</span>
                                <span className="text-orange-400 font-mono">{tooltip.match.weapon_used}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Eliminations:</span>
                                <span className="text-red-400 font-bold">{tooltip.match.kills}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Survived:</span>
                                <span className="text-green-400">{Math.floor(tooltip.match.time_survived / 60)}m {tooltip.match.time_survived % 60}s</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Placement:</span>
                                <span className="text-blue-400 font-bold">#{tooltip.match.final_placement}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Legend */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50"></div>
                        <span className="text-gray-300 font-medium">Early KO (&lt;2min)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50"></div>
                        <span className="text-gray-300 font-medium">Mid-Game (2-15min)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50"></div>
                        <span className="text-gray-300 font-medium">Top Finisher (&gt;15min)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
