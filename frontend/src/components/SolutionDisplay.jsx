import React from 'react';
import { motion } from 'framer-motion';
import { Route } from 'lucide-react';

const SolutionDisplay = ({ title, result, color, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            whileHover={{
                y: -4,
                boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
            }}
            className="glass-panel"
            style={{
                flex: 1,
                padding: '24px',
                borderRadius: '16px',
                borderTop: `3px solid ${color}`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            <div style={{
                position: 'absolute', top: '-50px', right: '-50px',
                width: '100px', height: '100px', borderRadius: '50%',
                background: color, filter: 'blur(60px)', opacity: 0.15,
                pointerEvents: 'none'
            }} />

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ color: 'var(--text-subtle)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
                        {title} Output
                    </p>
                    <Route size={16} color={color} opacity={0.7} />
                </div>

                {result ? (
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.4 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span style={{
                  fontSize: '36px', fontWeight: '300', color: 'var(--text-main)',
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px'
              }}>
                {result.cost.toFixed(2)}
              </span>
                            <span style={{ color: color, fontSize: '13px', fontWeight: '600' }}>units</span>
                        </div>

                        <div style={{
                            backgroundColor: 'var(--bg-base)', padding: '16px',
                            borderRadius: '10px', border: '1px solid var(--border-light)'
                        }}>
                            <p style={{ color: 'var(--text-subtle)', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>
                                OPTIMAL SEQUENCE
                            </p>
                            <p style={{
                                color: 'var(--text-main)', fontSize: '13px',
                                fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.8',
                                wordWrap: 'break-word'
                            }}>
                                {result.path.join(' → ')} <span style={{color: color, fontWeight: 'bold'}}>↺</span>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div style={{
                        height: '140px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'var(--text-muted)',
                        fontSize: '13px', fontStyle: 'italic',
                        border: '1px dashed var(--border-light)', borderRadius: '10px',
                        marginTop: '10px'
                    }}>
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Awaiting computation...
                        </motion.span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SolutionDisplay;