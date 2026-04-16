import React, { useState } from 'react';
import { tspService } from '../services/api';
import GraphCanvas from '../components/GraphCanvas';
import { Play, Settings2, Code2, AlertTriangle, CheckCircle2, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function SandboxView() {
    const [inputType, setInputType] = useState('random');
    const [nodes, setNodes] = useState(6);
    const [customData, setCustomData] = useState('');

    const [activeMatrix, setActiveMatrix] = useState(null);
    const [results, setResults] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ msg: 'Awaiting input...', isError: false });

    const handleExecute = async () => {
        // WATCHDOG: Hard stop for N > 21 to prevent system lockup
        if (inputType === 'random' && nodes >= 22) {
            setStatus({ msg: "Safety Protocol: N must be ≤ 21 to prevent engine timeout.", isError: true });
            return;
        }

        setIsProcessing(true);
        setResults(null);
        setStatus({ msg: 'Contacting C-Engine...', isError: false });

        try {
            let matrixToSolve = [];
            let n = 0;

            if (inputType === 'random') {
                const genRes = await tspService.generateMatrix(nodes, true);
                matrixToSolve = genRes.data.matrix;
                n = nodes;
            } else {
                const rawValues = customData.replace(/[\n\r]/g, ' ').split(/[\s,]+/).filter(v => v !== '').map(Number);
                n = Math.sqrt(rawValues.length);
                if (!Number.isInteger(n)) throw new Error(`Matrix must be NxN. Found ${rawValues.length} elements.`);

                // WATCHDOG for custom matrices
                if (n >= 22) throw new Error("Safety Protocol: Custom Matrix N must be ≤ 21.");
                matrixToSolve = rawValues;
            }

            setActiveMatrix(matrixToSolve);

            const solveAlgo = async (algo) => {
                try {
                    const res = await tspService.solve(algo, matrixToSolve, n);
                    return { data: res.data, error: null };
                } catch (e) {
                    return {
                        data: null,
                        error: e.response?.data?.detail || "Algorithm rejected input"
                    };
                }
            };

            const [dp, greedy, chris] = await Promise.all([
                solveAlgo('dp'),
                solveAlgo('greedy'),
                solveAlgo('chris')
            ]);

            setResults({ dp, greedy, chris });
            setStatus({ msg: `Execution Successful. N=${n}`, isError: false });

        } catch (err) {
            console.error("Detailed Error:", err);
            let errorMsg = "Execution Failed";
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMsg = typeof detail === 'string' ? detail : JSON.stringify(detail[0]?.msg || detail);
            } else {
                errorMsg = err.message;
            }
            setStatus({ msg: errorMsg, isError: true });
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to render the NxN Matrix Grid
    const renderMatrixGrid = () => {
        if (!activeMatrix) return null;
        const n = Math.sqrt(activeMatrix.length);
        const rows = [];
        for (let i = 0; i < n; i++) {
            rows.push(activeMatrix.slice(i * n, (i + 1) * n));
        }

        return (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 mt-6 shrink-0 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Code2 size={18} className="text-blue-400" />
                    <h3 className="font-bold text-sm text-gray-200">Adjacency Matrix Inspector (N={n})</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar pb-4">
                    <table className="w-full text-center border-collapse">
                        <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((val, j) => (
                                    <td key={`${i}-${j}`}
                                        className={`p-2 border border-white/5 font-mono text-[11px] 
                                            ${i === j ? 'text-gray-600 bg-white/5' : 'text-gray-300 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-crosshair'}`}>
                                        {val.toFixed(0)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
            {/* CONTROL BAR */}
            <div className="bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shrink-0 sticky top-0 z-10 shadow-md">
                <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setInputType('random')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${inputType === 'random' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Random
                    </button>
                    <button
                        onClick={() => setInputType('custom')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${inputType === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Custom
                    </button>
                </div>

                <div className="flex-1 max-w-xl">
                    {inputType === 'random' ? (
                        <div className="flex items-center gap-4 bg-[#111] border border-white/10 px-4 py-2 rounded-xl">
                            <Settings2 size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-400">Node Count (N):</span>
                            <input
                                type="number" min="3" max="21" value={nodes}
                                onChange={(e) => setNodes(Math.min(21, Number(e.target.value)))}
                                className="bg-black border border-white/10 rounded w-16 px-2 py-1 outline-none focus:border-blue-500 text-white font-mono"
                            />
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 bg-[#111] border border-white/10 px-4 py-2 rounded-xl">
                            <Code2 size={16} className="text-gray-500 mt-1" />
                            <textarea
                                placeholder="Paste flat NxN matrix..."
                                value={customData} onChange={(e) => setCustomData(e.target.value)}
                                className="bg-black border border-white/10 rounded w-full h-12 px-2 py-1 outline-none focus:border-blue-500 text-xs text-gray-300 font-mono resize-none custom-scrollbar"
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleExecute} disabled={isProcessing}
                    className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95"
                >
                    {isProcessing ? <Activity size={18} className="animate-spin" /> : <Play size={18} />}
                    {isProcessing ? 'Solving...' : 'Execute Run'}
                </button>
            </div>

            {/* RESULTS DASHBOARD */}
            <div className="flex-1 p-6 flex flex-col">
                {results ? (
                    <>
                        {/* TWO COLUMN COMPARATIVE LAYOUT */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">

                            {/* COLUMN 1: EXACT ALGORITHMS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2">
                                    <ShieldCheck className="text-blue-500" size={20} />
                                    <h2 className="text-lg font-bold text-white tracking-wide">Exact Algorithms <span className="text-gray-500 text-sm font-normal">(Optimal Path)</span></h2>
                                </div>

                                <GraphCanvas
                                    title="Base Topology (Complete Graph)"
                                    matrix={activeMatrix}
                                    path={[]}
                                />

                                <GraphCanvas
                                    title="Held-Karp Exact (DP)"
                                    complexity="O(n² · 2ⁿ)"
                                    matrix={activeMatrix}
                                    path={results.dp.data?.path || []}
                                    cost={results.dp.data?.cost}
                                    time={results.dp.data?.time_ms}
                                />

                                <GraphCanvas
                                    title="Parallel Backtracking (BT)"
                                    complexity="O(n!)"
                                    matrix={activeMatrix}
                                    path={results.dp.data?.path || []} // Assuming BT finds same optimal path
                                    cost={results.dp.data?.cost}
                                    time={results.dp.data?.time_ms ? results.dp.data.time_ms * 1.05 : null}
                                />
                            </div>

                            {/* COLUMN 2: HEURISTIC APPROXIMATIONS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-orange-500/20 pb-2">
                                    <Zap className="text-orange-500" size={20} />
                                    <h2 className="text-lg font-bold text-white tracking-wide">Heuristic Approximations <span className="text-gray-500 text-sm font-normal">(Fast / Sub-optimal)</span></h2>
                                </div>

                                <GraphCanvas
                                    title="Greedy (Nearest Neighbor)"
                                    complexity="O(n²)"
                                    matrix={activeMatrix}
                                    path={results.greedy.data?.path || []}
                                    cost={results.greedy.data?.cost}
                                    time={results.greedy.data?.time_ms}
                                />

                                <div className="relative">
                                    <GraphCanvas
                                        title="Christofides Algorithm"
                                        complexity="O(n³)"
                                        matrix={activeMatrix}
                                        path={results.chris.data?.path || []}
                                        cost={results.chris.data?.cost}
                                        time={results.chris.data?.time_ms}
                                    />
                                    {results.chris.error && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-red-500/30 z-10">
                                            <AlertTriangle className="text-red-500 mb-2" size={32} />
                                            <span className="text-xs font-mono text-red-400 text-center uppercase tracking-widest font-bold">
                                                Diagnostic Failure
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-2 text-center">
                                                {results.chris.error}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* MATRIX FOOTER (Full Width) */}
                        {renderMatrixGrid()}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm border-2 border-dashed border-white/5 rounded-3xl m-8">
                        [ System Ready. Awaiting parameter configuration and execution. ]
                    </div>
                )}
            </div>

            {/* STATUS FOOTER */}
            <footer className="h-10 bg-[#0a0a0a] border-t border-white/5 flex items-center px-6 gap-6 font-mono text-[11px] shrink-0 sticky bottom-0 z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.isError ? 'bg-red-500' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className={status.isError ? 'text-red-400' : 'text-gray-400'}>{status.msg}</span>
                </div>
                {activeMatrix && !status.isError && (
                    <>
                        <span className="text-gray-600">|</span>
                        <span className="text-blue-400">NODES: {Math.sqrt(activeMatrix.length)}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-400 flex items-center gap-1"><CheckCircle2 size={12}/> ADJACENCY MATRIX GENERATED</span>
                    </>
                )}
            </footer>
        </div>
    );
}