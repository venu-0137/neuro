import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analysis from './pages/Analysis.jsx';
import Results from './pages/Results.jsx';
import History from './pages/History.jsx';
import NeuralAssistant from './pages/NeuralAssistant.jsx';
import MoodMachine from './pages/MoodMachine.jsx';
import Diary from './pages/Diary.jsx';
import CounselorDashboard from './pages/CounselorDashboard.jsx';
import PatientView from './pages/PatientView.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Menu } from 'lucide-react';
import PageBackground from './components/PageBackground.jsx';
import axios from 'axios';
import './styles/global.css';

const backgroundMap = {
    '/': '/backgrounds/misty-forest-sunrise.png',
    '/dashboard': '/backgrounds/mountain-lake-reflection.png',
    '/analysis': '/backgrounds/river-stones.png',
    '/results': '/backgrounds/sunset-sky.png',
    '/history': '/backgrounds/forest-path.png',
    '/assistant': 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=2000',
    '/mood-machine': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000',
    '/diary': 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&q=80&w=2000',
    '/counselor-dashboard': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000'
};

const blurMap = {
    '/': '10px',
    '/dashboard': '8px',
    '/analysis': '12px',
    '/results': '10px',
    '/history': '8px',
    '/assistant': '10px',
    '/mood-machine': '10px',
    '/diary': '12px'
};

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    const bgImage = backgroundMap[location.pathname] || backgroundMap['/'];
    const bgBlur = blurMap[location.pathname] || '10px';
    const isLoginPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/student-login';

    // Global authentication and role check
    React.useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (!isLoginPage) navigate('/login');
                return;
            }

            try {
                // Fetch the source of truth for the role from the server
                const response = await axios.get('/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const role = response.data.role;
                localStorage.setItem('role', role); // Keep in sync
                
                // Safe guard to prevent bugs if a personal user accidentally gets a viewing_mode
                if (role !== 'counselor') {
                    localStorage.removeItem('viewing_mode');
                    localStorage.removeItem('viewing_patient_id');
                }

                if (isLoginPage) {
                    navigate(role === 'counselor' ? '/counselor-dashboard' : '/dashboard');
                } else if (location.pathname === '/dashboard' && role === 'counselor') {
                    navigate('/counselor-dashboard');
                } else if (location.pathname === '/counselor-dashboard' && role !== 'counselor') {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Auth verification failed:", err);
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            }
        };

        verifyAuth();
    }, [location.pathname, isLoginPage, navigate]);

    return (
        <div className="relative min-h-screen text-[#E2E8F0] overflow-hidden font-sans">
            <PageBackground image={bgImage} blur={bgBlur} />
            
            {!isLoginPage && (
                <>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed top-8 left-8 z-50 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-2xl backdrop-blur-xl group"
                    >
                        <Menu className="text-white group-hover:text-indigo-400" />
                    </button>
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                </>
            )}

            <main className={`relative z-10 ${isLoginPage ? '' : (location.pathname === '/dashboard' ? 'pt-0' : 'pt-24 md:pt-32')} px-4 md:px-8 max-w-7xl mx-auto`}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/assistant" element={<NeuralAssistant />} />
                    <Route path="/mood-machine" element={<MoodMachine />} />
                    <Route path="/diary" element={<Diary />} />
                    <Route path="/counselor-dashboard" element={<CounselorDashboard />} />
                    
                    {/* Patient View Routes (Counselor Only) */}
                    <Route path="/patient/:patientId" element={<PatientView />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="analysis" element={<Analysis />} />
                        <Route path="results" element={<Results />} />
                        <Route path="history" element={<History />} />
                        <Route path="assistant" element={<NeuralAssistant />} />
                        <Route path="diary" element={<Diary />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
        </Router>
    );
}

export default App;
