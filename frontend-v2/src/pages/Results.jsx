import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BarChart3, Info, Share2, Save } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, originalText } = location.state || {
        result: { emotions: { "Joy": 0.95 }, pattern: "Stable / Neutral State" },
        originalText: "I had a great day today!"
    };

    const resultData = result || { emotions: { "joy": 0.95 }, pattern: "Stable / Neutral State" };
    let rawEmotions = resultData.emotions || {};
    
    let normalizedEmotions = {};
    if (Array.isArray(rawEmotions)) {
        rawEmotions.forEach(e => {
            if (e && typeof e === 'object' && e.label) {
                normalizedEmotions[e.label] = e.score || 0;
            }
        });
    } else if (typeof rawEmotions === 'object' && rawEmotions !== null) {
        normalizedEmotions = rawEmotions;
    }

    const entries = Object.entries(normalizedEmotions).map(([k, v]) => [
        k.charAt(0).toUpperCase() + k.slice(1).toLowerCase(),
        v
    ]);

    // Sort and take top 5
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // Show raw percentages (multi-label probabilities are independent)
    const topEmotions = sortedEntries.map(([label, score], i) => ({
        label,
        value: Math.round(score * 100),
        color: i === 0 ? 'bg-indigo-500' : 
               i === 1 ? 'bg-purple-500' : 
               i === 2 ? 'bg-cyan-500' : 'bg-slate-600'
    }));

    const emotionName = topEmotions[0]?.label || "Unknown";
    const cognitivePattern = resultData.pattern || "Stable Cognitive State";

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
                            {topEmotions.map((item, i) => (
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
                            Cognitive Insight: <span className="text-indigo-400 font-bold">{cognitivePattern}</span>
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Our model has deconstructed the linguistic layers of your input. 
                            The dominant pattern suggests a <span className="text-indigo-300 font-medium">{cognitivePattern.toLowerCase()}</span>. 
                            {topEmotions.length > 0 && `This is based on the co-occurrence of ${topEmotions.slice(0, 3).map(e => e.label).join(', ')} emotions.`}
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
