'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Match } from '@/lib/types';

interface HotDropHeatmapProps {
    matches: Match[];
    selectedZone?: string | null;
    onZoneClick?: (zone: string | null) => void;
}

export default function HotDropHeatmap({ matches, selectedZone, onZoneClick }: HotDropHeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const baseMapCanvasRef = useRef<HTMLCanvasElement>(null);
    const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        match: Match;
    } | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize after mount to ensure container has size
    useEffect(() => {
        const timer = setTimeout(() => setIsInitialized(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Generate base map from data
    useEffect(() => {
        if (!isInitialized) return;

        const canvas = baseMapCanvasRef.current;
        const container = containerRef.current;

        console.log('🗺️ Base map rendering...', {
            canvas: !!canvas,
            container: !!container,
            matches: matches.length
        });

        if (!canvas || !container || matches.length === 0) {
            console.log('❌ Cannot render - missing requirements');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        const size = rect.width;

        console.log('📐 Canvas size:', size, 'x', size);

        if (size === 0) {
            console.log('⚠️ Container has no width yet, skipping render');
            return;
        }


        canvas.width = size;
        canvas.height = size;

        // Clear canvas for transparent overlay
        ctx.clearRect(0, 0, size, size);

        console.log('✅ Base canvas initialized for overlay');

        // === LAYER 2: Density-Based Zones ===
        const gridSize = 50; // Higher resolution for smoother density
        const densityGrid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));

        // Calculate landing density
        matches.forEach((match) => {
            const gridX = Math.floor((match.landing_zone.x / 8000) * gridSize);
            const gridY = Math.floor(((8000 - match.landing_zone.y) / 8000) * gridSize);
            if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
                densityGrid[gridY][gridX]++;
            }
        });

        // Find max density for normalization
        const maxDensity = Math.max(...densityGrid.flat());

        // Render density zones with smooth gradients
        densityGrid.forEach((row, y) => {
            row.forEach((density, x) => {
                if (density > 0) {
                    const cellSize = size / gridSize;
                    const centerX = x * cellSize + cellSize / 2;
                    const centerY = y * cellSize + cellSize / 2;
                    const intensity = density / maxDensity;

                    // Create radial gradient for smooth falloff
                    const gradient = ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, cellSize * 2
                    );

                    // Color based on intensity
                    if (intensity > 0.5) {
                        // High density - red/orange
                        gradient.addColorStop(0, `rgba(255, 100, 50, ${intensity * 0.5})`);
                        gradient.addColorStop(0.5, `rgba(255, 150, 0, ${intensity * 0.3})`);
                        gradient.addColorStop(1, 'transparent');
                    } else if (intensity > 0.2) {
                        // Medium density - orange/yellow
                        gradient.addColorStop(0, `rgba(255, 180, 0, ${intensity * 0.4})`);
                        gradient.addColorStop(0.5, `rgba(100, 200, 150, ${intensity * 0.2})`);
                        gradient.addColorStop(1, 'transparent');
                    } else {
                        // Low density - teal/cyan
                        gradient.addColorStop(0, `rgba(0, 255, 200, ${intensity * 0.3})`);
                        gradient.addColorStop(1, 'transparent');
                    }

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, cellSize * 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        });

        // === LAYER 3: Coordinate Grid ===
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.2)';
        ctx.lineWidth = 1;
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(0, 255, 150, 0.7)';
        ctx.textAlign = 'center';

        for (let i = 0; i <= 8; i++) {
            const pos = (i / 8) * size;
            const coord = i * 1000;

            // Grid lines
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();

            // Coordinate labels
            if (i > 0 && i < 8) {
                ctx.fillText(`${coord}m`, pos, 15);
                ctx.save();
                ctx.translate(15, pos);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(`${coord}m`, 0, 0);
                ctx.restore();
            }
        }

        // === LAYER 4: Zone Labels from Data Clusters ===
        const zoneClusters = new Map<string, { x: number[], y: number[], count: number }>();

        matches.forEach((match) => {
            const zoneName = match.landing_zone.zone_name;
            if (!zoneClusters.has(zoneName)) {
                zoneClusters.set(zoneName, { x: [], y: [], count: 0 });
            }
            const cluster = zoneClusters.get(zoneName)!;
            cluster.x.push(match.landing_zone.x);
            cluster.y.push(8000 - match.landing_zone.y); // Inverted Y
            cluster.count++;
        });

        // Draw zone labels at centroids
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;

        zoneClusters.forEach((cluster, zoneName) => {
            if (cluster.count < 3) return; // Only show zones with 3+ landings

            const avgX = cluster.x.reduce((a, b) => a + b, 0) / cluster.count;
            const avgY = cluster.y.reduce((a, b) => a + b, 0) / cluster.count;
            const canvasX = (avgX / 8000) * size;
            const canvasY = (avgY / 8000) * size;

            // Background box
            const textWidth = ctx.measureText(zoneName).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(canvasX - textWidth / 2 - 8, canvasY - 20, textWidth + 16, 28);

            // Border
            ctx.strokeStyle = 'rgba(0, 255, 150, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvasX - textWidth / 2 - 8, canvasY - 20, textWidth + 16, 28);

            // Text
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.fillText(zoneName, canvasX, canvasY);

            // Count badge
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#ffaa00';
            ctx.shadowColor = '#ffaa00';
            ctx.fillText(`${cluster.count} drops`, canvasX, canvasY + 15);
            ctx.font = 'bold 14px sans-serif';
        });

        ctx.shadowBlur = 0;

        // === LAYER 5: Corner Accents ===
        const drawCorner = (x: number, y: number, flipX: number, flipY: number) => {
            ctx.strokeStyle = 'rgba(0, 255, 150, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y + 40 * flipY);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 40 * flipX, y);
            ctx.stroke();
        };

        drawCorner(0, 0, 1, 1);
        drawCorner(size, 0, -1, 1);
        drawCorner(0, size, 1, -1);
        drawCorner(size, size, -1, -1);

        // Map title
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.fillText('ERANGEL - DATA VISUALIZATION', size / 2, 35);
        ctx.shadowBlur = 0;

    }, [matches.length, isInitialized]);

    // Generate heatmap overlay with individual markers
    useEffect(() => {
        const canvas = heatmapCanvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || matches.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        const size = rect.width;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        // Plot individual landing points
        matches.forEach((match) => {
            const x = (match.landing_zone.x / 8000) * size;
            const y = ((8000 - match.landing_zone.y) / 8000) * size;
            const minutes = match.time_survived / 60;

            // Color based on survival time
            let color, glowColor;
            if (minutes < 2) {
                color = '#ff1744';
                glowColor = 'rgba(255, 23, 68, 0.8)';
            } else if (minutes < 15) {
                color = '#ffc107';
                glowColor = 'rgba(255, 193, 7, 0.8)';
            } else {
                color = '#00e676';
                glowColor = 'rgba(0, 230, 118, 0.8)';
            }

            // Draw outer glow
            const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
            outerGradient.addColorStop(0, glowColor);
            outerGradient.addColorStop(0.5, glowColor.replace('0.8', '0.4'));
            outerGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();

            // Draw main circle
            ctx.fillStyle = color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(x - 2, y - 2, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

    }, [matches.length, isInitialized]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // Trigger re-render by calling the effects again
            const event = new Event('resize');
            window.dispatchEvent(event);
        };

        let timeout: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeout);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 8000;
        const mouseY = 8000 - ((e.clientY - rect.top) / rect.height) * 8000;

        let nearestMatch: Match | null = null;
        let nearestDistance = Infinity;

        matches.forEach((match) => {
            const distance = Math.sqrt(
                (mouseX - match.landing_zone.x) ** 2 +
                (mouseY - match.landing_zone.y) ** 2
            );

            if (distance < 300 && distance < nearestDistance) {
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-green-400 mb-1 tracking-tight">TACTICAL HEATMAP</h2>
                    <p className="text-sm text-gray-400">Real-Time Landing Zone Analysis</p>
                </div>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-xs text-green-400 uppercase tracking-wider">Live Data</div>
                    <div className="text-lg font-bold text-white">{matches.length} Drops</div>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative w-full aspect-square rounded-xl overflow-hidden cursor-crosshair transition-all duration-300 group-hover:scale-[1.02] border-2 border-emerald-500/20"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Official PUBG Map Background */}
                <Image
                    src="/erangel-official.png"
                    alt="Erangel Map"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />

                {/* Dark overlay for better heatmap visibility */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Base Map Canvas - Grid, labels, and density zones */}
                <canvas
                    ref={baseMapCanvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Heatmap Overlay Canvas - Individual markers */}
                <canvas
                    ref={heatmapCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ mixBlendMode: 'lighten' }}
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

            {/* Legend */}
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
