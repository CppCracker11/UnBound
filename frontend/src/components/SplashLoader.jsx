import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const SplashLoader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 600);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 4) + 1;
            });
        }, 35);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'color-mix(in srgb, var(--bg-base) 85%, transparent)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.6, 1, 0.6],
                    filter: [
                        "drop-shadow(0 0 10px var(--accent-dp-glow))",
                        "drop-shadow(0 0 30px var(--accent-dp))",
                        "drop-shadow(0 0 10px var(--accent-dp-glow))"
                    ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ marginBottom: '40px' }}
            >
                <Cpu size={80} color="var(--accent-dp)" strokeWidth={1.2} />
            </motion.div>

            <div style={{ width: '240px', textAlign: 'center' }}>
                <p style={{
                    fontSize: '11px',
                    letterSpacing: '4px',
                    color: 'var(--text-subtle)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                }}>
                    Initializing Node
                </p>

                <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'var(--bg-panel)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                        style={{
                            height: '100%',
                            backgroundColor: 'var(--accent-dp)',
                            boxShadow: '0 0 10px var(--accent-dp)'
                        }}
                    />
                </div>

                <p style={{
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-muted)',
                    marginTop: '12px'
                }}>
                    {progress >= 100 ? 'SYSTEM READY' : `BOOTING... ${progress}%`}
                </p>
            </div>
        </motion.div>
    );
};

export default SplashLoader;