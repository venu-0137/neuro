import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Github, UserPlus, Info } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';

const Login = () => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUserPopup, setShowUserPopup] = useState(null); // { username, password }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                console.log('Sending registration request:', { username, email });
                const response = await axios.post('/register', { username, email });
                setShowUserPopup({
                    username: response.data.username,
                    password: response.data.password
                });
                setIsRegister(false);
                setEmail('');
                setUsername('');
                setPassword('');
            } else {
                const response = await axios.post('/login', { username, password });
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', username);
                navigate('/dashboard');
            }
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                const firstErr = detail[0];
                const field = firstErr?.loc?.join(' > ');
                setError(`${field || 'Error'}: ${firstErr?.msg || 'Validation failed'}`);
                console.error('Validation details:', detail);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <AnimatePresence>
                {showUserPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <GlassCard className="max-w-sm w-full p-8 text-center space-y-6 border-indigo-500/30">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Info className="text-indigo-400" size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Registration Successful!</h3>
                                <p className="text-slate-400">Save your credentials securely:</p>
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Username</p>
                                        <p className="font-mono text-indigo-400 text-lg">{showUserPopup.username}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">4-Digit Password</p>
                                        <p className="font-mono text-emerald-400 text-3xl font-black tracking-[0.5em]">{showUserPopup.password}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-red-400/80 font-medium">⚠️ This is the only time you will see this password!</p>
                            </div>
                            <button
                                onClick={() => setShowUserPopup(null)}
                                className="w-full btn-primary py-3"
                            >
                                Got it
                            </button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <GlassCard className="w-full max-w-md space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="text-center space-y-2">
                    <motion.h1
                        key={isRegister ? 'reg' : 'login'}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold tracking-tight neon-text"
                    >
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </motion.h1>
                    <p className="text-slate-400">
                        {isRegister ? 'Join the NeuroTalk AI network' : 'Log in to your NeuroTalk AI account'}
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group/input">
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>

                        {isRegister && (
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        )}

                        {!isRegister && (
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="4-Digit Password"
                                    maxLength={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
                                {isRegister ? 'Sign Up' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-0.5 rounded-full text-slate-400 text-xs">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="btn-glass flex items-center justify-center gap-2 py-3">
                        <Github size={18} />
                        Github
                    </button>
                    <button className="btn-glass flex items-center justify-center gap-2 py-3">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-black font-bold">G</span>
                        </div>
                        Google
                    </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-indigo-400 hover:underline font-medium"
                    >
                        {isRegister ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </GlassCard>
        </div>
    );
};

export default Login;
