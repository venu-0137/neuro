import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import Loader from '../components/Loader.jsx';

const Analysis = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            // Small artificial delay for premium AI feel
            await new Promise(r => setTimeout(r, 1000));

            const response = await axios.post('/analyze',
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/results', { state: { result: response.data, originalText: text } });
        } catch (error) {
            console.error('Analysis failed:', error);
            if (error.response?.status === 401) {
                navigate('/');
            } else {
                alert('Failed to connect to NeuroTalk API. Is the backend running?');
            }
        } finally {
            setLoading(false);
        }
    };

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const charCount = text.length;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh]"
                    >
                        <Loader message="Deconstructing Neural Patterns..." />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>

                        <header className="space-y-2">
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Brain className="text-indigo-400" />
                                New Neural Analysis
                            </h2>
                            <p className="text-slate-400">Enter the text you want to analyze. Our AI will detect hidden emotions and cognitive tones.</p>
                        </header>

                        <div className="relative">
                            <GlassCard className="relative z-10 !p-0 overflow-hidden border-white/10 ring-1 ring-indigo-500/10 focus-within:ring-indigo-500/30 transition-all duration-300">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="What's on your mind? Type or paste text here..."
                                    className="w-full h-80 bg-transparent p-8 text-white text-lg resize-none focus:outline-none placeholder:text-slate-600"
                                />
                                <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
                                    <div className="flex gap-6 text-sm">
                                        <div className="text-slate-500">Words: <span className="text-indigo-400 font-mono">{wordCount}</span></div>
                                        <div className="text-slate-500">Characters: <span className="text-indigo-400 font-mono">{charCount} / 5000</span></div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!text.trim()}
                                        onClick={handleAnalyze}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                        Execute Analysis
                                    </motion.button>
                                </div>
                            </GlassCard>

                            {/* Decorative accent */}
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
                        </div>

                        <GlassCard className="!p-6 bg-indigo-500/5 border-indigo-500/10 flex gap-4">
                            <Sparkles className="w-8 h-8 text-indigo-400 shrink-0" />
                            <p className="text-sm text-slate-400 leading-relaxed">
                                <span className="text-slate-200 font-medium block mb-1">AI Tip:</span>
                                For more accurate results, try to provide longer snippets of text. Contextual clues help the model distinguish between subtle emotions like 'approval' vs 'neutral'.
                            </p>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Analysis;
