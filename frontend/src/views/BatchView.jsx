import React, { useState, useRef, useEffect } from 'react';
import { Upload, Cpu, TerminalSquare } from 'lucide-react';
import { tspService } from '../services/api';

export default function BatchView() {
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const logEndRef = useRef(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [results]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setResults([]);

        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        for (let i = 0; i < lines.length; i++) {
            try {
                const parts = lines[i].split(',').map(Number);
                const n = parts[0];

                // WATCHDOG: Filter out instances that will crash the C-Engine
                if (n >= 22) {
                    setResults(prev => [...prev, { id: i + 1, status: 'SKIP', msg: `N=${n} exceeds safety limit (Max 21)` }]);
                    continue; // Move to the next line in the file
                }

                const matrix = parts.slice(1);
                const res = await tspService.solve('dp', matrix, n);

                setResults(prev => [...prev, {
                    id: i + 1,
                    n: n,
                    cost: res.data.cost,
                    path: res.data.path.join(' → '),
                    time: res.data.time_ms,
                    status: 'OK'
                }]);
            } catch (err) {
                setResults(prev => [...prev, { id: i + 1, status: 'ERR', msg: "Parse/Compute Error" }]);
            }
        }
        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] p-6 space-y-6">
            <div className="bg-[#111] border-2 border-dashed border-blue-500/20 rounded-3xl p-10 text-center transition-all hover:border-blue-500/50 shrink-0">
                <input type="file" id="batch-upload" className="hidden" onChange={handleFileUpload} accept=".txt,.csv" />
                <label htmlFor="batch-upload" className="cursor-pointer group flex flex-col items-center">
                    <div className="p-4 bg-blue-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload size={32} className="text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Import Batch Dataset</h2>
                    <p className="text-gray-500 text-sm mt-2 font-mono">Format: "N, matrix_val1, matrix_val2..." per line</p>
                </label>
            </div>

            <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col min-h-[300px]">
                <div className="bg-[#1a1a1a] px-4 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        <TerminalSquare size={14} /> UnBound_Terminal // tty1
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed space-y-1 custom-scrollbar">
                    {results.length === 0 && !isProcessing && (
                        <div className="text-gray-600">root@unbound:~# Awaiting batch input...</div>
                    )}

                    {results.map((res) => (
                        <div key={res.id} className="animate-in slide-in-from-left-2 duration-150">
                            <span className="text-gray-600">[{new Date().toISOString().split('T')[1].slice(0, -1)}]</span>{' '}
                            <span className="text-blue-400">task_{res.id.toString().padStart(4, '0')}</span>{' '}

                            {res.status === 'OK' && (
                                <>
                                    <span className="text-green-500 font-bold">SUCCESS</span>{' '}
                                    <span className="text-gray-500">N={res.n} | Cost: </span>
                                    <span className="text-green-400">{res.cost.toFixed(2)}</span>
                                    <span className="text-gray-600 ml-3">{res.time.toFixed(4)}ms</span>
                                    <div className="pl-32 text-[11px] text-gray-500">Path: {res.path}</div>
                                </>
                            )}
                            {res.status === 'SKIP' && (
                                <span className="text-yellow-500 font-bold">SKIPPED [{res.msg}]</span>
                            )}
                            {res.status === 'ERR' && (
                                <span className="text-red-500 font-bold">FAILED [{res.msg}]</span>
                            )}
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex items-center gap-3 text-blue-400 mt-4 bg-blue-500/10 w-fit px-3 py-1 rounded">
                            <Cpu size={14} className="animate-spin" />
                            <span className="animate-pulse">Engine processing pipeline...</span>
                        </div>
                    )}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}