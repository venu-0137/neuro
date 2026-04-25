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
    const [role, setRole] = useState('user'); // user or counselor
    const [showUserPopup, setShowUserPopup] = useState(null); // { username, password }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                console.log('Sending registration request:', { username, email, role });
                const response = await axios.post('/register', { username, email, role });
                setShowUserPopup({
                    username: response.data.username,
                    password: response.data.password,
                    role: response.data.role
                });
                setIsRegister(false);
                setEmail('');
                setUsername('');
                setPassword('');
            } else {
                const response = await axios.post('/login', { username, password });
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', username);
                localStorage.setItem('role', response.data.role);
                
                console.log("Login Success. Role:", response.data.role);
                
                if (response.data.role === 'counselor') {
                    navigate('/counselor-dashboard');
                } else {
                    navigate('/dashboard');
                }
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
                                <p className="text-slate-400">Account Type: <span className="text-indigo-400 font-bold uppercase">{showUserPopup.role}</span></p>
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
                            <>
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

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Type</p>
                                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setRole('user')}
                                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${role === 'user' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Personal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('counselor')}
                                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${role === 'counselor' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Counselor
                                        </button>
                                    </div>
                                </div>
                            </>
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
                                {isRegister ? (
                                    <>
                                        <UserPlus size={20} />
                                        Create {role === 'counselor' ? 'Counselor' : 'Personal'} Account
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Sign In
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </form>


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
