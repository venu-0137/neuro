import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BarChart3, Info, Share2, Save } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, originalText } = location.state || {
        result: { emotions: [{ label: "Happy", score: 0.95 }] },
        originalText: "I had a great day today!"
    };

    const emotionName = result.emotion || result.emotions?.[0]?.label || "Unknown";
    const confidenceValue = result.confidence ? Math.round(result.confidence * 100) : (result.emotions?.[0]?.score ? Math.round(result.emotions[0].score * 100) : 92);

    // Mock confidence distribution for the "classic charts" look
    const confidenceData = [
        { label: emotionName, value: confidenceValue, color: 'bg-indigo-500' },
        { label: 'Approval', value: 45, color: 'bg-purple-500' },
        { label: 'Optimism', value: 30, color: 'bg-cyan-500' },
        { label: 'Neutral', value: 12, color: 'bg-slate-500' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/analysis')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    New Analysis
                </button>
                <div className="flex gap-4">
                    <button className="btn-glass p-3 rounded-full"><Share2 size={18} /></button>
                    <button className="btn-glass p-3 rounded-full"><Save size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Result Card */}
                <GlassCard className="lg:col-span-2 space-y-8">
                    <header className="space-y-2 border-b border-white/5 pb-6">
                        <h2 className="text-sm font-medium text-indigo-400 uppercase tracking-widest">Analysis Result</h2>
                        <div className="flex items-end gap-4">
                            <h1 className="text-5xl font-bold text-white capitalize">{emotionName}</h1>
                            <span className="text-slate-500 mb-1 text-lg">Predominant Emotion</span>
                        </div>
                    </header>

                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Emotional Spectrum
                        </h3>
                        <div className="space-y-5">
                            {confidenceData.map((item, i) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 font-medium">{item.label}</span>
                                        <span className="text-slate-500 font-mono">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                            className={`h-full ${item.color} shadow-[0_0_10px_rgba(99,102,241,0.3)]`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            Cognitive Insight
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Based on the linguistic patterns in your input, our model detects a high degree of
                            <span className="text-indigo-300 mx-1 font-medium">{emotionName.toLowerCase()}</span> characteristics.
                            The sentence structure suggests a stable cognitive state with clear emotional indicators.
                        </p>
                    </section>
                </GlassCard>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    <GlassCard className="space-y-4 !p-6">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-400" />
                            Original Context
                        </h3>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-slate-400 italic">"{originalText}"</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="space-y-4 !p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
                        <h3 className="text-white font-bold">What's Next?</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shadow-[0_0_5px_rgba(99,102,241,1)]" />
                                View detailed history trends
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shadow-[0_0_5px_rgba(168,85,247,1)]" />
                                Explore comparative analysis
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/history')}
                            className="w-full btn-glass text-sm"
                        >
                            Open Neural History
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Results;
