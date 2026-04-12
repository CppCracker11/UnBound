import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Route, Activity, GitCommit } from 'lucide-react';

import SplashLoader from './components/SplashLoader';
import ControlPanel from './components/ControlPanel';
import SolutionDisplay from './components/SolutionDisplay';

const GraphCanvas = ({ title, cities, path, color, icon: Icon, delay }) => {
  if (!cities || cities.length === 0) return null;

  const padding = 45;
  const minX = Math.min(...cities.map(c => c.x));
  const maxX = Math.max(...cities.map(c => c.x));
  const minY = Math.min(...cities.map(c => c.y));
  const maxY = Math.max(...cities.map(c => c.y));

  const scale = (val, min, max, size) => {
    const range = max - min || 1;
    return ((val - min) / range) * (size - padding * 2) + padding;
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Icon size={18} color={color || "var(--text-subtle)"} />
          <h3 style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>{title}</h3>
        </div>

        <div className="glass-panel" style={{
          width: '100%', height: '340px', borderRadius: '16px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
          <svg style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id={`arrow-${title.replace(/\s+/g, '')}`} markerWidth="7" markerHeight="7" refX="15" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill={color || "var(--text-subtle)"} />
              </marker>
            </defs>

            {cities.map((start, i) =>
                cities.map((end, j) => i !== j && (
                    <line
                        key={`bg-${i}-${j}`}
                        x1={scale(start.x, minX, maxX, 340)} y1={scale(start.y, minY, maxY, 340)}
                        x2={scale(end.x, minX, maxX, 340)} y2={scale(end.y, minY, maxY, 340)}
                        stroke="var(--text-subtle)" strokeWidth="1" opacity="0.15"
                    />
                ))
            )}

            {path && path.map((cityIdx, i) => {
              const start = cities[cityIdx];
              const nextIdx = path[(i + 1) % path.length];
              const end = cities[nextIdx];
              return (
                  <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: "easeInOut", delay: i * 0.08 }}
                      key={`path-${i}`}
                      x1={scale(start.x, minX, maxX, 340)} y1={scale(start.y, minY, maxY, 340)}
                      x2={scale(end.x, minX, maxX, 340)} y2={scale(end.y, minY, maxY, 340)}
                      stroke={color} strokeWidth="2.5"
                      markerEnd={`url(#arrow-${title.replace(/\s+/g, '')})`}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                  />
              );
            })}

            {cities.map((city, idx) => (
                <circle
                    key={idx}
                    cx={scale(city.x, minX, maxX, 340)} cy={scale(city.y, minY, maxY, 340)}
                    r="4.5" fill={path ? "var(--bg-base)" : "var(--text-subtle)"}
                    stroke={path ? color : "none"} strokeWidth="2"
                    style={{ filter: path ? `drop-shadow(0 0 6px ${color})` : 'none', transition: 'all 0.5s ease' }}
                />
            ))}
          </svg>
        </div>
      </motion.div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);

  const defaultGraph = '{\n  "cities": [\n    {"x": 400, "y": 100},\n    {"x": 660, "y": 250},\n    {"x": 660, "y": 550},\n    {"x": 400, "y": 700},\n    {"x": 140, "y": 550},\n    {"x": 140, "y": 250},\n    {"x": 400, "y": 250},\n    {"x": 530, "y": 325},\n    {"x": 530, "y": 475},\n    {"x": 400, "y": 550},\n    {"x": 270, "y": 475},\n    {"x": 270, "y": 325}\n  ]\n}';
  const [inputData, setInputData] = useState(defaultGraph);
  const [data, setData] = useState({ cities: [], dpResult: null, btResult: null });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const resetCanvas = () => {
    setData({ cities: [], dpResult: null, btResult: null });
    setInputData(defaultGraph);
  };

  const runAlgorithms = async () => {
    setLoading(true);
    setData({ cities: [], dpResult: null, btResult: null });

    try {
      const parsed = JSON.parse(inputData);
      setData(prev => ({ ...prev, cities: parsed.cities }));

      const dpResp = await axios.post('http://127.0.0.1:8000/solve', { ...parsed, algorithm: 'dp' });
      setData(prev => ({ ...prev, dpResult: dpResp.data }));

      const btResp = await axios.post('http://127.0.0.1:8000/solve', { ...parsed, algorithm: 'backtrack' });
      setData(prev => ({ ...prev, btResult: btResp.data }));

    } catch (e) {
      alert("System Fault: Verify JSON syntax and ensure FastAPI is running on Port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <AnimatePresence>
          {showSplash && <SplashLoader onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>

        {!showSplash && (
            <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

                <motion.header
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}
                >
                  <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '300', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Cpu color="var(--accent-dp)" /> UNBOUND <span style={{color: 'var(--text-subtle)'}}>// v2.0</span>
                    </h1>

                  </div>
                  <div style={{ display: 'flex', gap: '20px', color: 'var(--text-subtle)', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>STATUS: <span style={{ color: 'var(--accent-dp)' }}>ONLINE</span></span>
                    <span>ENGINE: <span style={{ color: 'var(--text-main)' }}>C/FASTAPI</span></span>
                  </div>
                </motion.header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
                  <ControlPanel
                      inputData={inputData} setInputData={setInputData}
                      runAlgorithms={runAlgorithms} loading={loading}
                      resetCanvas={resetCanvas} theme={theme} toggleTheme={toggleTheme}
                  />
                  <SolutionDisplay title="Dynamic Programming" result={data.dpResult} color="var(--accent-dp)" delay={0.3} />
                  <SolutionDisplay title="Brute Backtracking" result={data.btResult} color="var(--accent-bt)" delay={0.4} />
                </div>

                <AnimatePresence>
                  {data.cities.length > 0 && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '10px' }}
                      >
                        <GraphCanvas title="01 / SEARCH SPACE" cities={data.cities} icon={Route} delay={0.5} />
                        <GraphCanvas title="02 / DP OPTIMA" cities={data.cities} path={data.dpResult?.path} color="var(--accent-dp)" icon={Activity} delay={0.6} />
                        <GraphCanvas title="03 / BT OPTIMA" cities={data.cities} path={data.btResult?.path} color="var(--accent-bt)" icon={GitCommit} delay={0.7} />
                      </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
        )}
      </>
  );
}

export default App;