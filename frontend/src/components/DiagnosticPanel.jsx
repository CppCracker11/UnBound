import React from 'react';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

export default function DiagnosticPanel({ diagnostics }) {
    if (!diagnostics) return (
        <div className="text-gray-500 italic">Generate or input a matrix to run diagnostics.</div>
    );

    return (
        <div className="bg-brand-gray p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck size={18} className="text-purple-500" /> C-Engine Health Check
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${diagnostics.triangle_inequality ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                    <p className="text-sm text-gray-400">Metric Consistency</p>
                    <p className={`font-bold ${diagnostics.triangle_inequality ? 'text-green-400' : 'text-yellow-400'}`}>
                        {diagnostics.triangle_inequality ? "Triangle Inequality Met" : "Non-Metric Data"}
                    </p>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">Estimated DP Time</p>
                    <p className="text-blue-400 font-bold flex items-center gap-2">
                        <Clock size={14} /> {diagnostics.est_time_dp_ms.toFixed(2)} ms
                    </p>
                </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Engine Recommendation</p>
                <p className="text-sm text-gray-200 leading-relaxed">{diagnostics.recommendation}</p>
            </div>
        </div>
    );
}