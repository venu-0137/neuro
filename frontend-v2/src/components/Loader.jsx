import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const Loader = ({ message = "AI Thinking..." }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="relative">
                {/* Core pulse */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"
                />

                {/* Orbitting rings */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-indigo-400/30 rounded-full"
                        style={{
                            width: (i + 1) * 40,
                            height: (i + 1) * 40
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 10 + i * 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}

                {/* Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E293B] p-4 rounded-full border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <Brain className="w-8 h-8 text-indigo-400" />
                </div>
            </div>

            <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-indigo-300 font-medium tracking-widest uppercase text-sm"
            >
                {message}
            </motion.p>
        </div>
    );
};

export default Loader;
