import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Play, RotateCcw, Sun, Moon, Loader2 } from 'lucide-react';

const ControlPanel = ({
                          inputData,
                          setInputData,
                          runAlgorithms,
                          loading,
                          resetCanvas,
                          theme,
                          toggleTheme
                      }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="glass-panel"
            style={{
                display: 'flex', flexDirection: 'column', gap: '15px',
                padding: '25px', borderRadius: '16px', height: '100%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-subtle)' }}>
                    <Code2 size={20} />
                    <h3 style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>DATA TERMINAL</h3>
                </div>

                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-light)',
                        padding: '8px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-main)', transition: '0.3s'
                    }}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>

            <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                spellCheck="false"
                style={{
                    flex: 1, minHeight: '220px', padding: '16px',
                    borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px', resize: 'vertical', lineHeight: '1.6',
                    backgroundColor: 'var(--bg-base)', color: 'var(--accent-dp)',
                    width: '100%'
                }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                    onClick={runAlgorithms}
                    disabled={loading}
                    style={{
                        flex: 2, backgroundColor: 'var(--accent-dp)', color: '#ffffff',
                        border: 'none', padding: '14px', borderRadius: '8px',
                        fontWeight: '600', cursor: loading ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: loading ? 0.8 : 1, textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                >
                    {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Loader2 size={18} />
                        </motion.div>
                    ) : (
                        <Play size={18} fill="currentColor" />
                    )}
                    {loading ? 'COMPUTING...' : 'INITIALIZE SEQUENCE'}
                </button>

                <button
                    onClick={resetCanvas}
                    disabled={loading}
                    style={{
                        flex: 1, backgroundColor: 'transparent', color: 'var(--text-muted)',
                        border: '1px solid var(--border-light)', padding: '14px',
                        borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <RotateCcw size={18} />
                    RESET
                </button>
            </div>
        </motion.div>
    );
};

export default ControlPanel;