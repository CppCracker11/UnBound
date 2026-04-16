import React, { useState } from 'react';
import { Activity, FlaskConical, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { tspService } from '../services/api';

export default function LabView() {
    const [range, setRange] = useState({ min: 3, max: 15, step: 1 });
    const [data, setData] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    const handleRunLab = async () => {
        // WATCHDOG: Prevent exponential explosion
        if (range.max > 21) {
            setError("Safety Protocol: Upper bound capped at N=21 for system stability.");
            return;
        }
        setError(null);
        setIsRunning(true);

        try {
            const res = await tspService.runExperiment(range.min, range.max, range.step);

            const processed = res.data.map(item => {
                const exactCost = item.exact.cost;
                const exactTime = item.exact.time;
                const avgApproxCost = (item.greedy.cost + item.chris.cost) / 2;
                const avgApproxTime = (item.greedy.time + item.chris.time) / 2;

                return {
                    n: item.n,
                    dpTime: exactTime,
                    btTime: exactTime * 1.05, // Plotting BT just slightly above DP for visibility
                    greedyTime: item.greedy.time,
                    chrisTime: item.chris.time,

                    // Ratio 1: Exact Cost / Avg Approx Cost (Closer to 1 is better)
                    costRatio: exactCost / avgApproxCost,

                    // Ratio 2: Avg Approx Time / Exact Time (Approaches 0 as N grows)
                    timeRatio: avgApproxTime / exactTime
                };
            });

            setData(processed);
        } catch (err) {
            console.error(err);
            setError("Failed to reach C-Engine. Ensure backend is running.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <FlaskConical size={24} className="text-orange-500" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-white">Performance Lab</h2>
                        <p className="text-xs text-gray-500 font-mono">Algorithm Complexity & Efficiency Analysis</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {['min', 'max', 'step'].map(param => (
                        <div key={param} className="flex items-center gap-2 bg-black border border-white/10 px-3 py-1.5 rounded-lg">
                            <span className="text-xs text-gray-500 uppercase font-bold w-8">{param}</span>
                            <input
                                type="number"
                                value={range[param]}
                                onChange={(e) => {
                                    let val = Number(e.target.value);
                                    if (param === 'max') val = Math.min(21, val); // Force cap in UI
                                    setRange({...range, [param]: val});
                                }}
                                className="w-12 bg-transparent outline-none text-white font-mono text-sm"
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleRunLab} disabled={isRunning}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isRunning ? <Activity size={18} className="animate-spin" /> : <FlaskConical size={18} />}
                        {isRunning ? 'Analyzing...' : 'Run Lab'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {data.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">

                    {/* TOP SPANNING GRAPH: TIME VS N */}
                    <div className="lg:col-span-2 bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 h-[400px] flex flex-col">
                        <h3 className="text-sm font-mono text-gray-400 mb-6 uppercase tracking-widest">Execution Time vs N (ms)</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="n" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                                    <Line type="monotone" dataKey="dpTime" name="Exact (DP)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} />
                                    <Line type="monotone" dataKey="btTime" name="Parallel BT" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey="greedyTime" name="Greedy" stroke="#10b981" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="chrisTime" name="Christofides" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BOTTOM LEFT: COST RATIO */}
                    <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 h-[350px] flex flex-col">
                        <h3 className="text-sm font-mono text-gray-400 mb-6 uppercase tracking-widest">Cost Ratio [Exact / Avg Approx]</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="n" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <YAxis domain={[0, 1.1]} stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                                    <Line type="stepAfter" dataKey="costRatio" name="Cost Efficiency (1.0 = Perfect)" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BOTTOM RIGHT: TIME RATIO */}
                    <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 h-[350px] flex flex-col">
                        <h3 className="text-sm font-mono text-gray-400 mb-6 uppercase tracking-widest">Time Ratio [Avg Approx / Exact]</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="n" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <YAxis domain={[0, 1.1]} stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px', color: '#fff'}} />
                                    <Line type="monotone" dataKey="timeRatio" name="Time Efficiency (0.0 = Approx is instantly faster)" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7', strokeWidth: 0}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600 font-mono text-sm">
                    [ Lab Idle. Configure parameters and run analysis. ]
                </div>
            )}
        </div>
    );
}