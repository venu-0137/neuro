import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 1,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 20 + 20,
            delay: Math.random() * 5
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0F172A]">
            {/* Primary Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse decoration-3000" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full" />

            {/* Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white/20"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.4, 0],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default ParticleBackground;
