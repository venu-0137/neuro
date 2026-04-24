import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ArrowLeft, Gamepad2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from '../components/GlassCard.jsx';
import { getAllEmotions, getDominantEmotion } from '../utils/safeData';

const MoodMachine = () => {
    const navigate = useNavigate();
    const [history, setHistory] = React.useState([]);
    const [isMoodModalOpen, setIsMoodModalOpen] = React.useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
            } catch (err) {
                console.error('Failed to fetch history:', err);
            }
        };
        fetchHistory();
    }, []);

    const getMoodRecommendation = (emotion) => {
        const e = (emotion || '').toLowerCase();
        if (e.includes('stress') || e.includes('anx')) return { title: 'Breathe Game 🧘', desc: 'Take a short break to center yourself.', url: 'https://xhalr.com/' };
        if (e.includes('sad')) return { title: 'Calm & Breathe 🧘', desc: 'Relax and find your center.', url: 'https://xhalr.com/' };
        if (e.includes('ang')) return { title: 'Breathing Exercises 🧘', desc: 'Cool down and regain control.', url: 'https://xhalr.com/' };
        if (e.includes('happ') || e.includes('joy') || e.includes('amuse')) return { title: 'Slither.io 🐍', desc: 'Keep the good vibes rolling!', url: 'https://slither.io/' };
        return { title: 'Focus Game 🎯', desc: 'Sharpen your mind and stay engaged.', url: 'https://aimtrainer.io/' };
    };

    const emotionToUse = React.useMemo(() => {
        if (!history || history.length === 0) return 'neutral';
        
        // 1. Try to get the latest analysis emotion
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latest = getDominantEmotion(sortedHistory[0]?.emotions);
        
        if (latest && latest !== 'neutral') return latest;
        
        // 2. Fallback to top emotion
        const allEmotions = history.flatMap(item => getAllEmotions(item.emotions));

        const nonNeutralEmotions = allEmotions.filter(e => e !== 'neutral');
        const emotionsToCount = nonNeutralEmotions.length > 0 ? nonNeutralEmotions : allEmotions;
        
        if (emotionsToCount.length === 0) return 'neutral';
        
        const counts = emotionsToCount.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }, [history]);

    const recommendation = getMoodRecommendation(emotionToUse);

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                            <Sparkles className="text-yellow-400" />
                            Mood Machine
                        </h1>
                        <p className="text-slate-400">Interactive emotional gaming and cognitive wellness.</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMoodModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all border border-white/10 uppercase tracking-widest"
                >
                    ✨ Improve My Mood
                </motion.button>
            </header>

            <GlassCard className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 border-pink-500/20 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-pink-500/10 blur-[100px] rounded-full"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 12, repeat: Infinity }}
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full"
                    />
                </div>

                <div className="relative">
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center"
                    >
                        <div className="w-24 h-24 border border-dashed border-pink-500/30 rounded-full flex items-center justify-center">
                            <Gamepad2 size={48} className="text-white/80" />
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-3 relative z-10">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                        Leveling Up Your Emotions
                    </h2>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">
                        "Relax, play, and improve your mood with interactive games."
                    </p>
                </div>


                <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-lg">

  {/* Breathe */}
  <div 
    onClick={() => window.open("https://xhalr.com/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-purple-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🧘</div>
    <span className="text-sm text-white font-medium">BREATHE GAME</span>
  </div>

  {/* 2048 */}
  <div 
    onClick={() => window.open("https://play2048.co/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-blue-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🔢</div>
    <span className="text-sm text-white font-medium">2048 GAME</span>
  </div>

  {/* Focus */}
  <div 
    onClick={() => window.open("https://aimtrainer.io/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-red-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🎯</div>
    <span className="text-sm text-white font-medium">FOCUS GAME</span>
  </div>

    <div 
  onClick={() => window.open("https://slither.io/", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-green-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">🐍</div>
  <span className="text-sm text-white font-medium">SLITHER GAME</span>
</div>

    <div 
  onClick={() => window.open("https://www.chess.com/play/computer", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-indigo-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">♟️</div>
  <span className="text-sm text-white font-medium">CHESS GAME</span>
</div>

    <div 
  onClick={() => window.open("https://www.boatloadpuzzles.com/playcrossword", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-green-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">🧩</div>
  <span className="text-sm text-white font-medium">CROSSWORD</span>
</div>

</div>
            </GlassCard>

            <AnimatePresence>
                {isMoodModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMoodModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-sm"
                        >
                            <GlassCard className="!p-8 space-y-6 border-emerald-500/30 bg-slate-900/90 shadow-2xl">
                                <button 
                                    onClick={() => setIsMoodModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                                
                                <div className="space-y-2 text-center mt-2">
                                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
                                        🧠 Mood detected
                                    </p>
                                    <p className="text-2xl font-black text-white capitalize">
                                        {emotionToUse === 'N/A' ? 'Neutral' : emotionToUse}
                                    </p>
                                </div>

                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 text-center">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                        ✨ Recommended for you
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold text-white">{recommendation.title}</p>
                                        <p className="text-sm text-slate-400">{recommendation.desc}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        window.open(recommendation.url, "_blank");
                                        setIsMoodModalOpen(false);
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm"
                                >
                                    ▶ Play Now
                                </button>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoodMachine;
