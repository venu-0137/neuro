import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Brain, MessageSquare, X, Calendar, Sparkles, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import { getDominantEmotion, formatDate as safeFormatDate } from '../utils/safeData';

const Diary = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [mood, setMood] = useState('😊');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const moods = ['😊', '😔', '😤', '😨', '🤔', '😴', '🥳', '😭'];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/diary/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure we always receive an array
            setHistory(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setHistory([]); // Reset to empty array on error to prevent crash
        }
    };

    const handleSave = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            let response;
            
            if (editingId) {
                // Update existing entry
                response = await axios.put(`/diary/update/${editingId}`, 
                    { text, mood },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Add new entry
                response = await axios.post('/diary/add', 
                    { text, mood },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setAiInsight(response.data);
            setShowPopup(true);
            setText(''); // Clear editor
            setEditingId(null); // Reset editing state
            setMood('😊'); // Reset mood
            fetchHistory(); // Refresh list
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTalkToAssistant = () => {
        navigate('/assistant', { 
            state: { 
                initialMessage: text,
                initialEmotion: aiInsight?.emotion,
                triggerMessage: aiInsight?.trigger_message
            } 
        });
    };

    const formatDate = (dateStr) => {
        const d = safeFormatDate(dateStr);
        return {
            date: `${d.day} ${d.month}`,
            time: d.time
        };
    };

    const handleEntryDoubleClick = (entry) => {
        setText(entry.text);
        setMood(entry.mood);
        setEditingId(entry.id);
        // Scroll to editor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-4xl mx-auto pb-32 p-4 space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/dashboard')}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="text-indigo-400" />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-black text-white">My Diary</h1>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {editingId && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setEditingId(null);
                                setText('');
                                setMood('😊');
                            }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 font-bold transition-all"
                        >
                            Cancel Edit
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={!text.trim() || loading}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Save size={18} /> {editingId ? 'Update Entry' : 'Save Entry'}</>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Editor Section */}
            <div className="space-y-6">
                <GlassCard className="p-6 border-white/5 bg-white/3">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Mood Check-in</p>
                        <div className="flex justify-center gap-2 md:gap-4">
                            {moods.map((m) => (
                                <motion.button
                                    key={m}
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMood(m)}
                                    className={`text-2xl md:text-3xl p-3 rounded-2xl transition-all ${
                                        mood === m ? 'bg-indigo-500/30 ring-2 ring-indigo-500/50 scale-110' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {m}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-0 border-white/10 overflow-hidden shadow-2xl bg-black/20">
                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's spinning in your mind?"
                        className="w-full h-[40vh] bg-transparent text-white p-8 md:p-10 text-lg leading-relaxed focus:outline-none placeholder:text-slate-700 resize-none"
                    />
                    <div className="bg-white/5 border-t border-white/5 px-8 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Sparkles size={12} className="text-indigo-400" />
                            AI analysis active
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">
                            {text.length} chars
                        </span>
                    </div>
                </GlassCard>
            </div>

            {/* History Section - Date Wise Cards */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Clock className="text-indigo-400" size={20} />
                    Past Reflections
                </h2>
                
                <div className="grid gap-4">
                    <AnimatePresence>
                        {Array.isArray(history) && history.map((entry) => {
                            const date = formatDate(entry.timestamp);
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                                    className="cursor-pointer"
                                    title="Double-click to edit this entry"
                                >
                                    <GlassCard className="p-0 border-white/5 bg-white/5 hover:bg-white/8 transition-colors group">
                                        <div className="flex min-h-[100px]">
                                            {/* Date Sidebar */}
                                            <div className="w-20 bg-white/5 flex flex-col items-center justify-center border-r border-white/5 p-2">
                                                <span className="text-2xl font-black text-white">{date.day}</span>
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase">{date.month}</span>
                                                <span className="text-[8px] text-slate-500 mt-1">{date.year}</span>
                                            </div>
                                            
                                            {/* Entry Content */}
                                            <div className="flex-1 p-5 relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{entry.mood}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{date.time}</span>
                                                    </div>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        {getDominantEmotion(entry.detected_emotion)}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm line-clamp-2 italic">
                                                    "{entry.text}"
                                                </p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {history.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-slate-500 italic text-sm">Your reflections will appear here...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Proactive Popup */}
            <AnimatePresence>
                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="max-w-md w-full"
                        >
                            <GlassCard className="p-8 space-y-8 border-indigo-500/30 shadow-[0_0_80px_rgba(99,102,241,0.25)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <button onClick={() => setShowPopup(false)} className="text-slate-500 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="flex justify-center flex-col items-center gap-6 text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-pulse" />
                                        <div className="w-24 h-24 bg-indigo-500/30 rounded-full flex items-center justify-center relative z-10 border border-indigo-500/50">
                                            <Brain className="text-indigo-400" size={48} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-white tracking-tight">Neural Insight</h3>
                                        <p className="text-indigo-100/90 leading-relaxed italic text-lg px-2">
                                            "{aiInsight?.trigger_message}"
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleTalkToAssistant}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white font-bold transition-all"
                                    >
                                        <MessageSquare size={20} />
                                        Talk to me now
                                    </motion.button>
                                    <button
                                        onClick={() => setShowPopup(false)}
                                        className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors font-medium text-sm"
                                    >
                                        Maybe later, I'm reflecting
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Diary;
