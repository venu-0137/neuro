import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, ChevronRight, Search, Filter } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import Loader from '../components/Loader.jsx';

const History = () => {
    const navigate = useNavigate();
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>
                    <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                        <Clock className="text-indigo-400" />
                        Neural History
                    </h2>
                    <p className="text-slate-400">Tracking your emotional evolution over time.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search past entries..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                    </div>
                    <button className="btn-glass !p-2 rounded-xl"><Filter size={18} /></button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader message="Accessing Neural Records..." />
                </div>
            ) : historyItems.length === 0 ? (
                <GlassCard className="text-center py-20 space-y-4">
                    <p className="text-slate-400">No neural scans recorded yet.</p>
                    <button onClick={() => navigate('/analysis')} className="btn-primary px-8">Execute First Scan</button>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {historyItems.map((item, i) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard className="!p-0 group cursor-pointer overflow-hidden border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="p-6 md:p-8 flex-1 space-y-3">
                                        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest">
                                            <span className="text-slate-500">{formatDate(item.timestamp)}</span>
                                            {item.emotions?.map((e, idx) => (
                                                <span key={idx} className={`px-2 py-0.5 rounded-md border ${getEmotionColor(e.label)}`}>
                                                    {e.label}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                                            <p className="text-slate-200 line-clamp-1 text-lg">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-8 py-4 md:py-8 bg-white/5 border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-between md:justify-center gap-8 min-w-[180px]">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Confidence</p>
                                            <p className="text-xl font-mono text-white font-bold">{(item.emotions?.[0]?.score * 100).toFixed(0)}%</p>
                                        </div>
                                        <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getEmotionColor = (emotion) => {
    const map = {
        'Joy': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
        'Anxious': 'text-amber-400 border-amber-400/20 bg-amber-400/10',
        'Neutral': 'text-slate-400 border-slate-400/20 bg-slate-400/10',
        'Caring': 'text-pink-400 border-pink-400/20 bg-pink-400/10',
    };
    return map[emotion] || 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10';
};

export default History;
