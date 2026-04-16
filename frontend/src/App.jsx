import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, BarChart3, FileCode, ChevronRight, Activity } from 'lucide-react';
import SandboxView from './views/SandboxView';
import LabView from './views/LabView';
import BatchView from './views/BatchView';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState('landing'); // landing, sandbox, lab, batch

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  // --- LOADING SCREEN ---
  if (booting) {
    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
            <Cpu size={80} className="text-blue-500 relative animate-pulse-slow" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Initializing UnBound</span>
            <div className="w-48 h-[2px] bg-white/5 overflow-hidden">
              <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
    );
  }

  // --- LANDING PAGE ---
  if (mode === 'landing') {
    return (
        <div className="h-screen w-screen bg-brand-black flex flex-col items-center justify-center p-8 overflow-y-auto">
          <header className="text-center mb-16 animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-black tracking-tighter text-white mb-4">UNBOUND <span className="text-blue-600"></span></h1>
            <div className="flex items-center justify-center gap-3 text-gray-500 font-mono text-sm uppercase tracking-widest">
              <Activity size={16} className="text-green-500" /> System Status: Optimal
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            <ModeCard
                icon={<Terminal />} title="Sandbox Mode"
                desc="Live visualizer with manual or random matrix generation. 5-algorithm comparison."
                onClick={() => setMode('sandbox')}
            />
            <ModeCard
                icon={<BarChart3 />} title="Performance Lab"
                desc="Deep complexity analysis. Graphing Cost vs N and Approximation Ratios."
                onClick={() => setMode('lab')}
            />
            <ModeCard
                icon={<FileCode />} title="Batch Pipeline"
                desc="High-throughput processing. Stream results from .txt datasets directly."
                onClick={() => setMode('batch')}
            />
          </div>
        </div>
    );
  }

  // --- MODE WRAPPER ---
  return (
      <div className="h-screen w-screen bg-brand-black flex flex-col overflow-hidden animate-in fade-in duration-500">
        <nav className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setMode('landing')}>
            <Cpu size={18} className="text-blue-500 group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold tracking-tighter text-sm">UNBOUND <span className="text-blue-600"></span></span>
          </div>
          <div className="flex gap-8">
            {['sandbox', 'lab', 'batch'].map((m) => (
                <button
                    key={m} onClick={() => setMode(m)}
                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === m ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
                >
                  {m}
                </button>
            ))}
          </div>
        </nav>
        <main className="flex-1 overflow-auto">
          {mode === 'sandbox' && <SandboxView />}
          {mode === 'lab' && <LabView />}
          {mode === 'batch' && <BatchView />}
        </main>
      </div>
  );
}

function ModeCard({ icon, title, desc, onClick }) {
  return (
      <button onClick={onClick} className="group relative bg-brand-gray border border-white/5 p-8 rounded-3xl text-left transition-all hover:bg-blue-600/[0.03] hover:border-blue-500/40">
        <div className="text-blue-500 mb-6 transition-transform group-hover:scale-110 group-hover:translate-x-1">{React.cloneElement(icon, { size: 36 })}</div>
        <h3 className="text-2xl font-bold mb-3 flex items-center justify-between text-white">
          {title} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
      </button>
  );
}