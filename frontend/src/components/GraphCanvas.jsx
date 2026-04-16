import React, { useEffect, useRef, useState } from 'react';

export default function GraphCanvas({ title, matrix, path = [], cost = null, time = null, complexity = null }) {
    const canvasRef = useRef(null);
    const [animatedPath, setAnimatedPath] = useState([]);

    // 1. ANIMATION ENGINE
    useEffect(() => {
        // If it's the base topology (no path) or invalid, reset.
        if (!path || path.length === 0) {
            setAnimatedPath([]);
            return;
        }

        setAnimatedPath([]); // Reset before starting
        let step = 0;

        // Trace the path node-by-node every 150ms
        const interval = setInterval(() => {
            if (step <= path.length) {
                setAnimatedPath(path.slice(0, step + 1));
                step++;
            } else {
                clearInterval(interval);
            }
        }, 150);

        return () => clearInterval(interval);
    }, [path]);

    // 2. RENDER ENGINE
    useEffect(() => {
        if (!matrix || matrix.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas for re-draw
        ctx.clearRect(0, 0, width, height);

        // Derive N from the flat matrix length
        const N = Math.sqrt(matrix.length);
        if (!Number.isInteger(N)) return;

        // Calculate Circular Node Layout
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 25;
        const nodes = [];

        for (let i = 0; i < N; i++) {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            nodes.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }

        // Determine Max Distance for Edge Opacity Heatmap
        let maxDist = 0;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i] > maxDist) maxDist = matrix[i];
        }

        // Draw FULL TOPOLOGY (Background Edges)
        ctx.lineWidth = 1;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const dist = matrix[i * N + j];
                // Closer nodes get higher opacity (up to 0.15), distant get faint (0.02)
                let opacity = 0.05;
                if (maxDist > 0) {
                    opacity = 0.15 - (dist / maxDist) * 0.13;
                }
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.02, opacity)})`;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }

        // Draw ANIMATED ALGORITHMIC PATH
        if (animatedPath.length > 0) {
            ctx.lineWidth = 2.5;

            // Dynamic thematic coloring based on algorithm
            if (title.includes('DP')) ctx.strokeStyle = '#3b82f6'; // Blue
            else if (title.includes('BT')) ctx.strokeStyle = '#ec4899'; // Pink
            else if (title.includes('Greedy')) ctx.strokeStyle = '#10b981'; // Green
            else if (title.includes('Christofides')) ctx.strokeStyle = '#f59e0b'; // Amber
            else ctx.strokeStyle = '#ffffff';

            ctx.beginPath();
            ctx.moveTo(nodes[animatedPath[0]].x, nodes[animatedPath[0]].y);
            for (let i = 1; i < animatedPath.length; i++) {
                ctx.lineTo(nodes[animatedPath[i]].x, nodes[animatedPath[i]].y);
            }

            // Close the TSP loop ONLY if the animation has reached the final node
            if (animatedPath.length === path.length && path.length > 0) {
                ctx.lineTo(nodes[path[0]].x, nodes[path[0]].y);
            }
            ctx.stroke();
        }

        // Draw NODES
        for (let i = 0; i < N; i++) {
            const isActive = animatedPath.includes(i) || path.length === 0;

            ctx.beginPath();
            ctx.arc(nodes[i].x, nodes[i].y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = isActive ? '#ffffff' : '#222222';
            ctx.fill();

            // Highlight the Origin Node (Node 0)
            if (i === 0 && path.length > 0) {
                ctx.beginPath();
                ctx.arc(nodes[i].x, nodes[i].y, 8, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ef4444'; // Red ring for start
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Node Labels
            ctx.font = '10px JetBrains Mono';
            ctx.fillStyle = isActive ? '#aaaaaa' : '#444444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labelAngle = (i * 2 * Math.PI) / N - Math.PI / 2;
            ctx.fillText(i, nodes[i].x + Math.cos(labelAngle) * 16, nodes[i].y + Math.sin(labelAngle) * 16);
        }
    }, [matrix, animatedPath, path, title]);

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 flex flex-col hover:border-white/20 transition-all shadow-lg group">
            <div className="flex justify-between items-start mb-4 h-12">
                <div>
                    <h3 className="font-bold text-sm text-gray-200 tracking-wide">{title}</h3>
                    {complexity && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {complexity}
                        </span>
                    )}
                </div>
                {cost !== null && (
                    <div className="text-right">
                        <div className="text-xs text-gray-500 font-mono">
                            Cost: <span className="text-green-400 font-bold">{cost.toFixed(2)}</span>
                        </div>
                        {time !== null && (
                            <div className="text-[10px] text-gray-600 font-mono mt-0.5">
                                {time.toFixed(4)}ms
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center bg-[#050505] rounded-xl border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors min-h-[300px]">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="max-w-full max-h-full drop-shadow-2xl"
                />
            </div>

            {/* THE PATH TAPE */}
            {path && path.length > 0 && (
                <div className="mt-4 p-2 bg-black/50 border border-white/5 rounded-lg overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap">
                        <span className="text-gray-500 uppercase font-bold mr-1">Path:</span>
                        {path.map((node, i) => (
                            <React.Fragment key={i}>
                                <span className="text-white px-1.5 py-0.5 bg-white/5 rounded">{node}</span>
                                {i < path.length - 1 && <span className="text-gray-600">→</span>}
                            </React.Fragment>
                        ))}
                        <span className="text-gray-600">→</span>
                        <span className="text-red-500/80 px-1.5 py-0.5 bg-red-500/5 rounded">{path[0]}</span>
                    </div>
                </div>
            )}
        </div>
    );
}