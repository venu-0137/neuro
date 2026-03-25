import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, History, Play, Activity, Sparkles, Layout } from 'lucide-react';
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
                    navigate('/login');
                    return;
                }
                const response = await axios.get('/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setHistory(data);

                if (data.length > 0) {
                    // Calculate top emotion
                    const emotions = data.flatMap(item => item.emotions?.map(e => e.label) || []);
                    const counts = emotions.reduce((acc, curr) => {
                        acc[curr] = (acc[curr] || 0) + 1;
                        return acc;
                    }, {});
                    const topEmotion = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');

                    setStats([
                        { label: 'Analyses Run', value: data.length.toString(), icon: <Activity className="text-indigo-400" />, trend: `+${data.length}` },
                        { label: 'Top Emotion', value: topEmotion, icon: <Sparkles className="text-yellow-400" />, trend: 'Active' },
                        { label: 'Confidence Avg', value: `${(data.reduce((acc, curr) => acc + (curr.emotions?.[0]?.score || 0), 0) / data.length * 100).toFixed(0)}%`, icon: <Brain className="text-purple-400" />, trend: 'Stable' },
                    ]);
                }
            } catch (err) {
                console.error('Dashboard stats failed:', err);
                if (err.response?.status === 401) navigate('/login');
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
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold text-white flex items-center gap-3"
                    >
                        <Layout className="text-indigo-500" />
                        Neural Dashboard
                    </motion.h1>
                    <p className="text-slate-400">Welcome to the core of NeuroTalk AI. Monitor your neural activity and emotional insights.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Neural Core Online
                </div>
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
                    <h3 className="text-lg font-semibold text-white px-1">Neural Topology</h3>
                    <GlassCard className="h-full !p-8 flex flex-col justify-center items-center text-center space-y-6 border-indigo-500/20">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain size={48} className="text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-medium">AI Model: DistilBERT-v2</h4>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                Analyzing linguistic vectors and emotional weights across 28 distinct labels for high-fidelity sentiment mapping.
                            </p>
                        </div>
                        <div className="w-full pt-4">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>Processing Load</span>
                                <span>12%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[12%] bg-indigo-500" />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
