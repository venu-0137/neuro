import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, ChevronRight, Search, Filter, Sparkles, TrendingUp, Calendar, Zap } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import Loader from '../components/Loader.jsx';
import { getAllEmotions, getEmotionScore, getDominantEmotion, formatDate as safeFormatDate } from '../utils/safeData';

const TrendChart = ({ items }) => {
    if (!items || items.length < 2) return null;
    
    // Take last 7 scores for clarity
    const recent = items.slice(0, 7).reverse();
    const scores = recent.map(item => getEmotionScore(item.emotions));

    const points = scores.map((score, i) => {
        const x = (i / (scores.length - 1)) * 100;
        const y = 100 - (score * 60 + 20); // Scale to 20-80 range to keep labels inside
        return { x, y, score };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={12} /> Mood Confidence Trend
                </p>
            </div>
            <div className="h-28 w-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                    
                    {/* Background Grid Lines */}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="100" y2="80" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />

                    <motion.polyline
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        fill="none"
                        stroke="url(#chartGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                    />

                    {points.map((p, i) => (
                        <g key={i}>
                            <motion.circle 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                cx={p.x} 
                                cy={p.y} 
                                r="2" 
                                fill="#a855f7" 
                                stroke="#1e1b4b"
                                strokeWidth="0.5"
                            />
                            <motion.text 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                x={p.x} 
                                y={p.y - 6} 
                                textAnchor="middle" 
                                fontSize="5" 
                                fill="#94a3b8" 
                                fontWeight="bold"
                                className="font-mono"
                            >
                                {(p.score * 100).toFixed(0)}%
                            </motion.text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

const History = () => {
    const navigate = useNavigate();
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                const response = await axios.get('/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistoryItems(response.data);
            } catch (err) {
                console.error('Failed to fetch history:', err);
                if (err.response?.status === 401) navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [navigate]);

    const filteredItems = useMemo(() => {
        return historyItems.filter(item => {
            const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
            const mainEmotion = getDominantEmotion(item.emotions);
            const matchesFilter = activeFilter === 'All' || mainEmotion.toLowerCase().includes(activeFilter.toLowerCase());
            return matchesSearch && matchesFilter;
        });
    }, [historyItems, searchQuery, activeFilter]);

    const insight = useMemo(() => {
        if (historyItems.length < 3) return "💡 Insight: Keep sharing your thoughts to see emotional patterns.";
        const topEmotion = getDominantEmotion(historyItems[0]?.emotions);
        return `💡 Insight: You have been feeling more ${topEmotion.toLowerCase()} in your latest entries ${getEmotionEmoji(topEmotion)}`;
    }, [historyItems]);

    const formatDate = (dateString) => {
        return safeFormatDate(dateString).full;
    };

    const filters = ['All', 'Joy', 'Sadness', 'Anxiety', 'Anger'];

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 px-4">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-4 text-sm"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Clock className="text-indigo-500" size={32} />
                        Neural History
                    </h2>
                    <p className="text-slate-400 text-sm">Deep emotional analytics and evolution records.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search records..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader message="Decrypting Neural Patterns..." />
                </div>
            ) : historyItems.length === 0 ? (
                <GlassCard className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Calendar className="text-slate-600" />
                    </div>
                    <p className="text-slate-400">Your emotional timeline is empty.</p>
                    <button onClick={() => navigate('/assistant')} className="btn-primary px-8">Talk to Assistant</button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="border-indigo-500/20 bg-indigo-500/5">
                            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles size={12} /> AI Summary
                            </p>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                {insight}
                            </p>
                        </GlassCard>

                        <GlassCard className="p-0 overflow-hidden">
                            <TrendChart items={historyItems} />
                        </GlassCard>

                        <div className="space-y-3">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Quick Filters</p>
                            <div className="flex flex-wrap gap-2">
                                {filters.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            activeFilter === f 
                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                    >
                                        {f === 'All' ? '' : getEmotionEmoji(f) + ' '} {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, i) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <GlassCard 
                                        className={`!p-0 group cursor-pointer border-white/5 transition-all duration-300 ${
                                            expandedId === item._id ? 'ring-2 ring-indigo-500/30 border-indigo-500/30 shadow-2xl shadow-indigo-500/10' : 'hover:scale-[1.01] hover:border-white/20'
                                        }`}
                                        onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                    >
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                                        <MessageSquare size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{formatDate(item.timestamp)}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {Array.isArray(item.emotions) ? (
                                                                item.emotions.slice(0, 2).map((e, idx) => (
                                                                    <span key={idx} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getEmotionColor(e.label)}`}>
                                                                        {getEmotionEmoji(e.label)} {e.label}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                Object.entries(item.emotions || {}).slice(0, 2).map(([label, score], idx) => (
                                                                    <span key={idx} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getEmotionColor(label)}`}>
                                                                        {getEmotionEmoji(label)} {label}
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Mood Score</p>
                                                    <p className="text-lg font-black text-white">
                                                        {(() => {
                                                            const score = Array.isArray(item.emotions) 
                                                                ? item.emotions[0]?.score 
                                                                : Object.values(item.emotions || {})[0];
                                                            return ((score || 0) * 100).toFixed(0);
                                                        })()}%
                                                    </p>
                                                </div>
                                            </div>

                                            <p className={`text-slate-300 text-sm leading-relaxed ${expandedId === item._id ? '' : 'line-clamp-2'}`}>
                                                {item.text}
                                            </p>

                                            <AnimatePresence>
                                                {expandedId === item._id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pt-4 border-t border-white/5 space-y-4"
                                                    >
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                                <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Dominant Emotion</p>
                                                                <p className="text-xs text-white font-bold">
                                                                    {Array.isArray(item.emotions) ? item.emotions[0]?.label : Object.keys(item.emotions || {})[0]}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                                <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Scan Confidence</p>
                                                                <p className="text-xs text-white font-bold">
                                                                    {(() => {
                                                                        const score = Array.isArray(item.emotions) 
                                                                            ? item.emotions[0]?.score 
                                                                            : Object.values(item.emotions || {})[0];
                                                                        return (score || 0).toFixed(4);
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                                                            <Zap size={12} /> Full Neural Log Decrypted
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

const getEmotionEmoji = (emotion) => {
    const map = {
        'Joy': '😊',
        'Happy': '😊',
        'Sadness': '😔',
        'Sad': '😔',
        'Anxiety': '😓',
        'Anxious': '😓',
        'Anger': '😡',
        'Angry': '😡',
        'Neutral': '🤔',
        'Curiosity': '🤔',
    };
    return map[emotion] || '✨';
};

const getEmotionColor = (emotion) => {
    const map = {
        'Joy': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
        'Happy': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
        'Anxiety': 'text-amber-400 border-amber-400/20 bg-amber-400/10',
        'Anxious': 'text-amber-400 border-amber-400/20 bg-amber-400/10',
        'Sadness': 'text-blue-400 border-blue-400/20 bg-blue-400/10',
        'Sad': 'text-blue-400 border-blue-400/20 bg-blue-400/10',
        'Anger': 'text-rose-400 border-rose-400/20 bg-rose-400/10',
        'Angry': 'text-rose-400 border-rose-400/20 bg-rose-400/10',
        'Neutral': 'text-slate-400 border-slate-400/20 bg-slate-400/10',
    };
    return map[emotion] || 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10';
};

export default History;

