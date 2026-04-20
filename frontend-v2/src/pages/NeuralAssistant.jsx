import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';

const NeuralAssistant = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <header className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/dashboard')}
                    className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="text-indigo-400" />
                </motion.button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MessageSquare className="text-emerald-500" />
                        Neural Assistant
                    </h1>
                    <p className="text-slate-400">Real-time emotional guidance and cognitive support.</p>
                </div>
            </header>

            <GlassCard className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 border-emerald-500/20">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full absolute inset-0"
                    />
                    <MessageSquare size={64} className="text-emerald-400 relative z-10" />
                </div>
                <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl font-bold text-white">Project: Whisper-Core</h2>
                    <p className="text-slate-400 max-w-sm mx-auto italic">
                        The neural interface is currently being calibrated for high-fidelity emotional resonance.
                    </p>
                </div>
                <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium animate-pulse">
                    construction in progress
                </div>
            </GlassCard>
        </div>
    );
};

export default NeuralAssistant;
