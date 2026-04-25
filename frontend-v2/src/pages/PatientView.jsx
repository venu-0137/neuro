import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Activity, MessageSquare, Book, Heart, Home, History as HistoryIcon, PieChart, RefreshCw, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';

const PatientView = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [patientInfo, setPatientInfo] = useState(null);
    const [patientsList, setPatientsList] = useState([]);
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatientInfo = async () => {
            try {
                // We just need the basic info for the header
                const response = await axios.get(`/counselor/patients`);
                setPatientsList(response.data);
                const patient = response.data.find(p => p._id === patientId);
                if (!patient) throw new Error('Patient not found');
                setPatientInfo(patient);
            } catch (err) {
                console.error('Failed to fetch patient info:', err);
                navigate('/counselor-dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchPatientInfo();
    }, [patientId, navigate]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
    );

    const navItems = [
        { path: 'dashboard', label: 'Overview', icon: <Home size={18} /> },
        { path: 'history', label: 'Analyses', icon: <HistoryIcon size={18} /> },
        { path: 'diary', label: 'Diary', icon: <Book size={18} /> },
    ];

    const currentTab = location.pathname.split('/').pop();

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Nav Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button 
                    onClick={() => {
                        localStorage.removeItem('viewing_mode');
                        localStorage.removeItem('viewing_patient_id');
                        navigate('/counselor-dashboard');
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm font-bold uppercase tracking-wider"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Counselor Hub
                </button>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowSwitchModal(true)}
                        className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors text-sm font-bold uppercase tracking-wider border border-indigo-500/20"
                    >
                        <RefreshCw size={16} />
                        Switch Student
                    </button>
                    <div className="flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-2xl shadow-xl backdrop-blur-xl">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Viewing: {patientInfo?.username}</span>
                    </div>
                </div>
            </div>

            {/* Main Project Title with Glow (Moved from Dashboard for Counselor View) */}
            <header className="flex flex-col items-center text-center gap-6 pt-4 pb-4">
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
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex flex-col items-start bg-indigo-500/5 border border-white/10 rounded-3xl p-1 pr-6">
                            <div className="flex items-center gap-3 px-4 py-2 text-indigo-300 text-xs font-black uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                <span className="w-2 h-2 rounded-full bg-green-500 absolute" />
                                Neural Core Online
                            </div>
                        </div>

                        {/* Counselor Badge */}
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-3xl px-4 py-2.5 shadow-lg backdrop-blur-md">
                            <Sparkles size={14} className="text-yellow-400 mr-2" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">
                                Viewing as Counselor
                            </span>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Sub-navigation Tabs */}
            <GlassCard className="!p-2 flex overflow-x-auto no-scrollbar gap-2 border-white/5 bg-white/5">
                {navItems.map((item) => {
                    const isActive = currentTab === item.path || (item.path === 'dashboard' && currentTab === patientId);
                    return (
                        <Link
                            key={item.path}
                            to={`/patient/${patientId}/${item.path}`}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest whitespace-nowrap
                                ${isActive 
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </GlassCard>

            {/* Main Content Area */}
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Outlet />
            </motion.div>

            {/* Switch Student Modal */}
            <AnimatePresence>
                {showSwitchModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-6 space-y-6 relative overflow-hidden">
                                <button 
                                    onClick={() => setShowSwitchModal(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold neon-text">Switch Student</h3>
                                    <p className="text-sm text-slate-400">Select a student to view their dashboard.</p>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-2">
                                    {patientsList.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => {
                                                localStorage.setItem("viewing_patient_id", p._id);
                                                setShowSwitchModal(false);
                                                navigate(`/patient/${p._id}`);
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                p._id === patientId 
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300">
                                                    {p.username[0].toUpperCase()}
                                                </div>
                                                <span className="font-semibold">{p.username}</span>
                                            </div>
                                            {p._id === patientId && <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Viewing</span>}
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientView;
