import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, History, Play, Activity, Sparkles, MessageSquare } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';

const Dashboard = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState([
        { label: 'Analyses Run', value: '0', icon: <Activity className="text-indigo-400" />, trend: '0%' },
        { label: 'Top Emotion', value: 'N/A', icon: <Sparkles className="text-yellow-400" />, trend: 'Stable' },
        { label: 'Neural Load', value: '0%', icon: <Brain className="text-purple-400" />, trend: 'Stable' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                const response = await axios.get('/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setHistory(data);

                if (data.length > 0) {
                    // Calculate top emotion
                    const allEmotions = data.flatMap(item => item.emotions?.map(e => e.label) || []);
                    const nonNeutralEmotions = allEmotions.filter(e => e !== 'neutral');
                    
                    const counts = (nonNeutralEmotions.length > 0 ? nonNeutralEmotions : allEmotions).reduce((acc, curr) => {
                        acc[curr] = (acc[curr] || 0) + 1;
                        return acc;
                    }, {});
                    
                    const topEmotion = Object.keys(counts).length > 0 
                        ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
                        : 'N/A';

                    setStats([
                        { label: 'Analyses Run', value: data.length.toString(), icon: <Activity className="text-indigo-400" />, trend: `+${data.length}` },
                        { label: 'Top Emotion', value: topEmotion, icon: <Sparkles className="text-yellow-400" />, trend: 'Active' },
                        { label: 'Confidence Avg', value: `${(data.reduce((acc, curr) => acc + (curr.emotions?.[0]?.score || 0), 0) / data.length * 100).toFixed(0)}%`, icon: <Brain className="text-purple-400" />, trend: 'Stable' },
                    ]);
                }
            } catch (err) {
                console.error('Dashboard stats failed:', err);
                if (err.response?.status === 401) navigate('/');
            }
        };
        fetchStats();
    }, []);

    const actions = [
        {
            title: 'Neural Analysis',
            desc: 'Execute real-time emotional deep-dive on custom text.',
            icon: <Play size={24} />,
            path: '/analysis',
            color: 'from-indigo-500 to-blue-600'
        },
        {
            title: 'Inference History',
            desc: 'Review past emotional patterns and cognitive trends.',
            icon: <History size={24} />,
            path: '/history',
            color: 'from-purple-500 to-indigo-600'
        },
        {
            title: 'Talk to me right now',
            desc: 'Interact with the neural assistant for real-time guidance.',
            icon: <MessageSquare size={24} />,
            path: '/assistant',
            color: 'from-emerald-500 to-teal-600'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-12 relative">
            <header className="flex flex-col items-center text-center gap-6 pt-0">
                {/* Main Project Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
                        BolMitra
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
                </motion.div>

                {/* Greeting & Welcome */}
                <div className="space-y-4 max-w-2xl">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-4xl font-bold text-white flex items-center justify-center gap-4 tracking-tight"
                    >
                        <Sparkles className="text-indigo-400 w-6 h-6 md:w-8 md:h-8" />
                        What’s cookin, good lookin 😏
                    </motion.h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Welcome to the neural core of your project. Monitor activity and emotional insights with precision.
                    </p>
                </div>

                {/* Action & Status Row */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/mood-machine')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all border border-white/10"
                    >
                        Mood Machine 💫
                    </motion.button>

                    <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-bold backdrop-blur-md">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        Neural Core Online
                    </div>
                </motion.div>

</header>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-400' : stat.trend === 'Stable' ? 'text-slate-400' : 'text-red-400'}`}>
                                    {stat.trend} from last week
                                </p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl">
                                {stat.icon}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actions */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white px-1">Deep Neural Integration</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {actions.map((action, i) => (
                            <motion.button
                                key={action.title}
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className={`flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r ${action.color} shadow-lg shadow-indigo-500/10 text-left group overflow-hidden relative`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                    {action.icon}
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <h4 className="text-xl font-bold text-white">{action.title}</h4>
                                    <p className="text-indigo-100/70 text-sm">{action.desc}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* System Insights */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white px-1">Neural Statistics</h3>
                    <GlassCard className="h-full !p-8 flex items-center justify-center border-indigo-500/20 min-h-[400px]">
                        <p className="text-slate-400 font-medium italic opacity-60">construction in work</p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
