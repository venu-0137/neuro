import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, ExternalLink, Calendar, Mail, Info, X } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';

const CounselorDashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ username: '', email: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/counselor/patients');
            // Force array type to prevent .filter crashes
            setPatients(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const response = await axios.post('/counselor/add-patient', newPatient);
            setShowSuccessPopup(response.data);
            setShowAddModal(false);
            setNewPatient({ username: '', email: '' });
            fetchPatients();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to add patient');
        } finally {
            setAddLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight neon-text mb-2">Counselor Hub</h1>
                    <p className="text-slate-400">Manage your students and monitor their emotional well-being.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center justify-center gap-2 py-4 px-8 self-start"
                >
                    <UserPlus size={20} />
                    Add Student
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Users className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Students</p>
                            <p className="text-2xl font-bold text-white">{patients.length}</p>
                        </div>
                    </div>
                </GlassCard>
                {/* Additional stats could go here */}
            </div>

            {/* Patient List */}
            <GlassCard className="p-0 overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-4">
                    <Search className="text-slate-500" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-slate-600"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <div className="animate-pulse flex justify-center">Loading student data...</div>
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm ? 'No students match your search.' : 'No students added yet. Click "Add Student" to begin.'}
                                    </td>
                                </tr>
                            ) : filteredPatients.map((patient) => (
                                <tr 
                                    key={patient._id} 
                                    onDoubleClick={() => navigate(`/patient/${patient._id}/dashboard`)}
                                    className="hover:bg-white/5 transition-colors group cursor-pointer select-none"
                                    title="Double-click to open student profile"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {patient.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-white">{patient.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-300 flex items-center gap-2">
                                                <Mail size={14} className="text-slate-500" />
                                                {patient.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-400 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            {new Date(patient.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                localStorage.setItem("viewing_mode", "counselor");
                                                localStorage.setItem("viewing_patient_id", patient._id);
                                                navigate(`/patient/${patient._id}`);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <ExternalLink size={16} />
                                            Open Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Add Patient Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-8 space-y-8 relative overflow-hidden">
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="text-center space-y-2">
                                    <h3 className="text-3xl font-bold neon-text">Add Student</h3>
                                    <p className="text-slate-400">Create a secure account for your student.</p>
                                </div>

                                <form onSubmit={handleAddPatient} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                            <input 
                                                type="text"
                                                required
                                                value={newPatient.username}
                                                onChange={(e) => setNewPatient({...newPatient, username: e.target.value})}
                                                placeholder="e.g. John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                            <input 
                                                type="email"
                                                required
                                                value={newPatient.email}
                                                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                                                placeholder="student@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={addLoading}
                                        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                                    >
                                        {addLoading ? (
                                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                Create Account
                                            </>
                                        )}
                                    </button>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}

                {showSuccessPopup && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-sm w-full"
                        >
                            <GlassCard className="p-8 text-center space-y-6 border-indigo-500/30">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Info className="text-indigo-400" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Student Added!</h3>
                                    <p className="text-slate-400">Please provide these credentials to the student:</p>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Username</p>
                                            <p className="font-mono text-indigo-400 text-lg">{showSuccessPopup.username}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Generated Password</p>
                                            <p className="font-mono text-emerald-400 text-3xl font-black tracking-[0.5em]">{showSuccessPopup.password}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-red-400/80 font-medium">⚠️ This is the only time you will see this password!</p>
                                </div>
                                <button
                                    onClick={() => {
                                        window.open('/student-login', '_blank');
                                        setShowSuccessPopup(null);
                                    }}
                                    className="w-full btn-primary py-3 flex justify-center items-center gap-2"
                                >
                                    <ExternalLink size={18} />
                                    Open Student Login
                                </button>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CounselorDashboard;
