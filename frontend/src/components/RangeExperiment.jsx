import React, { useState } from 'react';
import { tspService } from '../services/api';
import { BarChart3, FlaskConical } from 'lucide-react';

export default function RangeExperiment({ onDataReceived }) {
    const [params, setParams] = useState({ start: 3, end: 15, step: 1 });
    const [running, setRunning] = useState(false);

    const runRange = async () => {
        setRunning(true);
        try {
            const res = await tspService.runExperiment(params.start, params.end, params.step);
            onDataReceived(res.data);
        } catch (err) {
            console.error("Experiment Failed", err);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FlaskConical size={18} className="text-orange-500" /> Performance Lab
                </h3>
                <button
                    onClick={runRange}
                    disabled={running}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                    {running ? "Analyzing..." : "Start Analysis"}
                </button>
            </div>
            <div className="flex gap-4">
                {['start', 'end', 'step'].map(key => (
                    <div key={key} className="flex-1">
                        <label className="text-xs text-gray-500 uppercase block mb-1">{key}</label>
                        <input
                            type="number"
                            value={params[key]}
                            onChange={(e) => setParams({...params, [key]: Number(e.target.value)})}
                            className="w-full bg-black border border-white/10 rounded-md px-2 py-1 outline-none focus:border-orange-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}