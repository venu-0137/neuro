import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, History, Play, Activity, Sparkles, MessageSquare, Mic, TrendingUp, TrendingDown, Zap, X } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import { getAllEmotions, getEmotionScore } from '../utils/safeData';

const Dashboard = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState([
        { label: 'Analyses Run', value: '0', icon: <Activity className="text-indigo-400" />, trend: '0%', direction: 'up' },
        { label: 'Top Emotion', value: 'N/A', icon: <Sparkles className="text-yellow-400" />, trend: 'Stable', direction: 'stable' },
        { label: 'Confidence Avg', value: '0%', icon: <Brain className="text-purple-400" />, trend: 'Stable', direction: 'stable' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                if (!token) {
                    navigate('/');
                    return;
                }
                
                // CRITICAL: Force redirect if counselor tries to access user dashboard natively
                if (role === 'counselor' && !patientId) {
                    navigate('/counselor-dashboard');
                    return;
                }

                const url = patientId ? `/history?patient_id=${patientId}` : '/history';
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setHistory(data);

                if (data.length > 0) {
                    const allEmotions = data.flatMap(item => getAllEmotions(item.emotions));
                    
                    const nonNeutralEmotions = allEmotions.filter(e => e.toLowerCase() !== 'neutral');
                    const emotionsToCount = nonNeutralEmotions.length > 0 ? nonNeutralEmotions : allEmotions;
                    
                    const counts = emotionsToCount.reduce((acc, curr) => {
                        acc[curr] = (acc[curr] || 0) + 1;
                        return acc;
                    }, {});
                    
                    const topEmotion = Object.keys(counts).length > 0 
                        ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
                        : 'N/A';

                    const confidenceAvg = data.reduce((acc, curr) => {
                        return acc + getEmotionScore(curr.emotions);
                    }, 0) / data.length;

                    setStats([
                        { 
                            label: 'Analyses Run', 
                            value: data.length.toString(), 
                            icon: <Activity className="text-indigo-400" />, 
                            trend: `↑ +${Math.max(1, Math.floor(data.length / 2))} this week`,
                            direction: 'up'
                        },
                        { 
                            label: 'Top Emotion', 
                            value: topEmotion, 
                            icon: <Sparkles className="text-yellow-400" />, 
                            trend: '↑ Positive Trend',
                            direction: 'up'
                        },
                        { 
                            label: 'Confidence Avg', 
                            value: `${(confidenceAvg * 100).toFixed(0)}%`, 
                            icon: <Brain className="text-purple-400" />, 
                            trend: '→ Stable Index',
                            direction: 'stable',
                            score: confidenceAvg
                        },
                    ]);
                }
            } catch (err) {
                console.error('Dashboard stats failed:', err);
                if (err.response?.status === 401) navigate('/');
            }
        };
        fetchStats();
    }, []);
    const isCounselorView = localStorage.getItem('role') === 'counselor' && localStorage.getItem('viewing_mode') === 'counselor';

    const baseActions = [
        {
            title: 'Neural Analysis',
            desc: 'Execute real-time emotional deep-dive on custom text.',
            icon: <Play size={22} />,
            path: '/analysis',
            color: 'from-indigo-600 to-blue-700',
            glow: 'group-hover:shadow-blue-500/40'
        },
        {
            title: 'Inference History',
            desc: 'Review past emotional patterns and cognitive trends.',
            icon: <History size={22} />,
            path: '/history',
            color: 'from-purple-600 to-indigo-700',
            glow: 'group-hover:shadow-purple-500/40'
        },
        {
            title: 'Talk to me right now',
            desc: 'Voice-enabled AI assistant for real-time guidance.',
            icon: <Mic size={22} />,
            path: '/assistant',
            color: 'from-emerald-600 to-teal-700',
            glow: 'group-hover:shadow-emerald-500/40',
            hasMic: true
        }
    ];
    
    const actions = isCounselorView ? baseActions.filter(a => a.path !== '/assistant') : baseActions;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-12 relative">
            {!isCounselorView && (
                <header className="flex flex-col items-center text-center gap-6 pt-0">
                    {/* Main Project Title with Glow */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 relative group"
                    >
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[40px] rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000" />
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 relative z-10 drop-shadow-2xl">
                            BolMitra
                        </h1>
                        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400/60">Last active: just now</p>
                    </motion.div>

                    {/* Greeting & Welcome */}
                    <div className="space-y-4 max-w-2xl relative z-10">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl md:text-4xl font-bold text-white flex items-center justify-center gap-4 tracking-tight"
                        >
                            <Sparkles className="text-indigo-400 w-6 h-6 md:w-8 md:h-8 animate-pulse" />
                            What’s cookin, good lookin 😏
                        </motion.h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mx-auto">
                            Welcome to the neural core. Monitor your emotional evolution with precision and deep AI insights.
                        </p>
                    </div>

                    {/* Action & Status Row */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/mood-machine')}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl text-white text-sm font-black shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all border border-white/20 uppercase tracking-wider"
                            >
                                Mood Machine 💫
                            </motion.button>

                            <div className="flex flex-col items-start bg-indigo-500/5 border border-white/10 rounded-3xl p-1 pr-6">
                                <div className="flex items-center gap-3 px-4 py-2 text-indigo-300 text-xs font-black uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                    <span className="w-2 h-2 rounded-full bg-green-500 absolute" />
                                    Neural Core Online
                                </div>
                            </div>

                            {/* Counselor Badge */}
                            {(patientId || localStorage.getItem('created_by_name')) && (
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-3xl px-4 py-2.5 shadow-lg backdrop-blur-md">
                                    <Sparkles size={14} className="text-yellow-400 mr-2" />
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                                        {patientId ? 'Viewing as Counselor' : `Counselor: ${localStorage.getItem('created_by_name')}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </header>
            )}

            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="h-full"
                        >
                            <GlassCard className="flex flex-col h-full gap-4 p-7 group hover:border-white/20 transition-all duration-500">
                                <div className="flex items-center justify-between flex-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                        <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.direction === 'up' ? 'text-emerald-400' : stat.direction === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>
                                        {stat.direction === 'up' ? <TrendingUp size={12} /> : stat.direction === 'down' ? <TrendingDown size={12} /> : null}
                                        {stat.trend}
                                    </div>
                                    {stat.label === 'Confidence Avg' && (
                                        <div className="space-y-1.5">
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stat.score * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                />
                                            </div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Mood Level Indicator</p>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>


            </div>

            {!isCounselorView && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actions */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Deep Neural Integration</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {actions.map((action, i) => (
                            <motion.button
                                key={action.title}
                                whileHover={{ scale: 1.03, translateY: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className={`flex items-center gap-6 p-6 rounded-[2rem] bg-gradient-to-r ${action.color} shadow-2xl transition-all duration-300 text-left group overflow-hidden relative border border-white/10 ${action.glow}`}
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner flex items-center justify-center min-w-[56px]">
                                    {action.icon}
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-black text-white tracking-tight">{action.title}</h4>
                                        {action.hasMic && <Mic size={14} className="text-white/60 animate-pulse" />}
                                    </div>
                                    <p className="text-white/70 text-sm font-medium">{action.desc}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* My Diary Card */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Emotions & Reflections</h3>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="h-full"
                    >
                        <GlassCard className="h-full !p-8 flex flex-col items-center justify-center border-indigo-500/20 min-h-[400px] relative overflow-hidden group">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-1000" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000" />

                            <div className="relative z-10 text-center space-y-8">
                                <div className="w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-6xl relative z-10">📖</span>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-3xl font-black text-white tracking-tight">My Neural Diary</h4>
                                    <p className="text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
                                        Archive your cognitive states and track your emotional evolution over time.
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/diary')}
                                    className="px-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black shadow-2xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Open
                                </motion.button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
            )}

        </div>
    );
};

export default Dashboard;
