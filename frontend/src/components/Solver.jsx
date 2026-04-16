import React, { useState } from 'react';
import { tspService } from '../services/api';
import { Play, RefreshCw, Activity } from 'lucide-react';

export default function Solver() {
    const [nodes, setNodes] = useState(5);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateAndSolve = async () => {
        setLoading(true);
        try {
            const genRes = await tspService.generateMatrix(nodes);
            const matrix = genRes.data.matrix;

            const solveRes = await tspService.solve('dp', matrix, nodes);
            setResult(solveRes.data);
        } catch (error) {
            console.error("Solver Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" /> Solve Configuration
                    </h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={nodes}
                            onChange={(e) => setNodes(Number(e.target.value))}
                            className="bg-black border border-white/10 rounded-lg px-3 py-1 w-20 outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleGenerateAndSolve}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18}/>}
                            Run Solver
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-500 text-sm">Optimal Cost</p>
                                <p className="text-2xl font-mono font-bold text-green-400">{result.cost.toFixed(2)}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-500 text-sm">Execution Time</p>
                                <p className="text-2xl font-mono font-bold text-blue-400">{result.time_ms.toFixed(4)} ms</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-500 text-sm">Algorithm</p>
                                <p className="text-2xl font-mono font-bold uppercase">{result.algo_name}</p>
                            </div>
                        </div>

                        {/* FULL WIDTH PATH SEQUENCE CARD */}
                        {result.path && result.path.length > 0 && (
                            <div className="bg-brand-gray p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-blue-600/5 to-transparent">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Computed Optimal Path Sequence</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 font-mono">
                                    {result.path.map((node, idx) => (
                                        <React.Fragment key={idx}>
                                            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner">
                                                {node}
                                            </div>
                                            {idx < result.path.length - 1 && (
                                                <span className="text-gray-600 text-lg">→</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <span className="text-gray-600 text-lg">→</span>
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-sm shadow-inner">
                                        {result.path[0]}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}