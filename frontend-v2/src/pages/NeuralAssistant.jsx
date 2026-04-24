import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, Send, Sparkles, User, Brain, ExternalLink, Lightbulb, Zap, Heart, Target, Mic, Volume2, VolumeX, History, RefreshCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';
import { getDominantEmotion } from '../utils/safeData';

const NeuralAssistant = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hey there! I'm your AI companion. I've been learning to understand emotions better so I can support you just like a real friend would. 💙",
            followUp: "What's been on your mind lately? I'm all ears.",
            timestamp: new Date(),
            personality: 'calm'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(''); // Reflecting, Thinking, Transcribing
    const [personality, setPersonality] = useState('calm');
    const [isListening, setIsListening] = useState(false);
    const [speechStatus, setSpeechStatus] = useState('');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [typingMessage, setTypingMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/\p{Extended_Pictographic}/gu, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 400);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, typingMessage]);

    // Handle Diary Handoff
    useEffect(() => {
        if (location.state?.initialMessage) {
            const { initialMessage, initialEmotion, triggerMessage } = location.state;
            const diaryHandoffMessages = [
                {
                    role: 'user',
                    content: `I've been thinking about this: "${initialMessage}"`,
                    timestamp: new Date()
                },
                {
                    role: 'assistant',
                    content: triggerMessage || "I saw what you wrote... it sounds like you've had a lot on your mind. 💙",
                    followUp: "Do you want to dive deeper into those thoughts with me?",
                    emotion: initialEmotion || 'neutral',
                    topic: 'diary_reflection',
                    personality: personality,
                    timestamp: new Date()
                }
            ];
            setMessages(prev => [...prev, ...diaryHandoffMessages]);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const typeResponse = (text, callback) => {
        let index = 0;
        setTypingMessage('');
        const interval = setInterval(() => {
            setTypingMessage(prev => prev + text[index]);
            index++;
            if (index >= text.length) {
                clearInterval(interval);
                callback();
            }
        }, 30); // Speed of typing
    };

    const handleSend = async (e, voiceText = null) => {
        if (e) e.preventDefault();
        const textToSend = voiceText || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: textToSend.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        
        const stages = ['Reflecting...', 'Interpreting emotions...', 'Connecting patterns...', 'Formulating response...'];
        let stageIdx = 0;
        const stageInterval = setInterval(() => {
            setLoadingStage(stages[stageIdx]);
            stageIdx = (stageIdx + 1) % stages.length;
        }, 1200);

        try {
            const token = localStorage.getItem('token');
            const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
            
            const response = await axios.post('/chat', 
                { message: userMessage.content, history, personality },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            clearInterval(stageInterval);
            setLoading(false);
            
            const fullData = response.data;
            
            // Start typing animation
            typeResponse(fullData.reply, () => {
                const aiMessage = {
                    role: 'assistant',
                    content: fullData.reply,
                    followUp: fullData.follow_up,
                    suggestion: fullData.suggestion,
                    emotionSummary: fullData.emotion_summary,
                    emotion: fullData.emotion,
                    topic: fullData.topic,
                    personality: personality,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setTypingMessage('');
                if (isVoiceEnabled) speak(fullData.reply + ". " + (fullData.follow_up || ""));
            });

        } catch (err) {
            clearInterval(stageInterval);
            console.error('Chat Error:', err);
            setLoading(false);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm so sorry, I'm having a bit of trouble connecting right now. 😔",
                followUp: "Could you try saying that again? I really want to listen.",
                isError: true,
                timestamp: new Date()
            }]);
        }
    };

    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => { setIsListening(true); setSpeechStatus("I'm listening..."); };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(null, transcript);
        };
        recognition.onerror = () => { setIsListening(false); setSpeechStatus("Error in voice input"); setTimeout(() => setSpeechStatus(''), 2000); };
        recognition.onend = () => { setIsListening(false); setSpeechStatus(''); };
        recognition.start();
    };

    const personalities = [
        { id: 'fun', label: 'Friendly', icon: <Zap size={14} />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'calm', label: 'Supportive', icon: <Heart size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'coach', label: 'Guiding', icon: <Target size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
    ];

    return (
        <div className="max-w-4xl mx-auto h-[92vh] flex flex-col p-2 md:p-4 font-sans antialiased text-slate-200">
            {/* Minimal Premium Header */}
            <header className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/dashboard')}
                        className="p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                    >
                        <ArrowLeft className="text-slate-400" size={20} />
                    </motion.button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-white tracking-tight">AI Companion</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Neural Intelligence v3.0</p>
                    </div>
                </div>

                <div className="hidden md:flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                    {personalities.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPersonality(p.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all duration-500 uppercase tracking-wider ${
                                personality === p.id 
                                ? `${p.bg} ${p.color} shadow-lg shadow-black/40 scale-105 ring-1 ring-white/10` 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            {p.icon}
                            {p.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={`p-2.5 rounded-2xl transition-all ${isVoiceEnabled ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-slate-500 border-white/5'} border`}
                    >
                        {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>
            </header>

            {/* Chat Viewport */}
            <div className="flex-1 overflow-hidden flex flex-col relative rounded-[2.5rem] bg-[#020617] border border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth scrollbar-hide relative z-10">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    
                                    {/* Emotion Insight Tag */}
                                    {msg.role === 'assistant' && msg.emotionSummary && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 ml-2"
                                        >
                                            <Sparkles size={10} className="text-indigo-400" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.emotionSummary}</span>
                                        </motion.div>
                                    )}

                                    <div className={`relative px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed shadow-2xl ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10 border border-white/10' 
                                        : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none shadow-black/40'
                                    }`}>
                                        <p>{msg.content}</p>
                                        
                                        {msg.followUp && (
                                            <div className={`mt-4 pt-4 border-t ${msg.role === 'user' ? 'border-white/10' : 'border-white/5'}`}>
                                                <p className="text-emerald-400 font-bold italic text-[14px] flex items-center gap-2">
                                                    <Sparkles size={14} className="animate-pulse" />
                                                    {msg.followUp}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggestion Card */}
                                    {msg.suggestion && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="ml-2 mt-1 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2 max-w-[90%]"
                                        >
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <Lightbulb size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Wellness Insight</span>
                                            </div>
                                            <p className="text-[13px] text-slate-400 leading-normal">{msg.suggestion}</p>
                                        </motion.div>
                                    )}

                                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest px-4">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Animation Block */}
                    {typingMessage && (
                        <div className="flex justify-start">
                            <div className="max-w-[75%] space-y-3">
                                <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] rounded-tl-none text-[15px] text-slate-200 shadow-2xl leading-relaxed">
                                    <p>{typingMessage}<span className="inline-block w-1 h-4 bg-indigo-500 animate-pulse ml-1" /></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex flex-col gap-3 ml-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{loadingStage}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Glassy Input Bar */}
                <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-2xl relative z-20">
                    <form onSubmit={handleSend} className="relative group max-w-3xl mx-auto flex gap-4">
                        <div className="relative flex-1 group">
                             <AnimatePresence>
                                {speechStatus && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-12 left-0 bg-indigo-600 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl z-50 flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                        {speechStatus}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tell me what's on your mind... I'm listening."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 px-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600 text-white shadow-2xl text-lg font-medium"
                            />
                        </div>

                        <div className="flex gap-2">
                             <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={startSpeechRecognition}
                                className={`w-16 rounded-[1.5rem] flex items-center justify-center transition-all ${
                                    isListening 
                                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 shadow-rose-500/20' 
                                    : 'bg-white/5 text-slate-500 hover:bg-white/10 border-white/10'
                                } border`}
                            >
                                <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!input.trim() || loading || !!typingMessage}
                                className="w-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1.5rem] flex items-center justify-center disabled:opacity-30 shadow-2xl shadow-indigo-500/20"
                            >
                                <Send size={24} />
                            </motion.button>
                        </div>
                    </form>
                    <p className="text-center mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">BolMitra Neural Engine • End-to-End Secure</p>
                </div>
            </div>
        </div>
    );
};

export default NeuralAssistant;
