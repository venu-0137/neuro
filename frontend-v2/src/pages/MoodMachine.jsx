import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';

const MoodMachine = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <header className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/dashboard')}
                    className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="text-indigo-400" />
                </motion.button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-yellow-400" />
                        Mood Machine
                    </h1>
                    <p className="text-slate-400">Interactive emotional gaming and cognitive wellness.</p>
                </div>
            </header>

            <GlassCard className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 border-pink-500/20 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-pink-500/10 blur-[100px] rounded-full"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 12, repeat: Infinity }}
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full"
                    />
                </div>

                <div className="relative">
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center"
                    >
                        <div className="w-24 h-24 border border-dashed border-pink-500/30 rounded-full flex items-center justify-center">
                            <Gamepad2 size={48} className="text-white/80" />
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-3 relative z-10">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                        Leveling Up Your Emotions
                    </h2>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">
                        "Relax, play, and improve your mood with interactive games."
                    </p>
                </div>


                <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-lg">

  {/* Breathe */}
  <div 
    onClick={() => window.open("https://xhalr.com/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-purple-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🧘</div>
    <span className="text-sm text-white font-medium">BREATHE GAME</span>
  </div>

  {/* 2048 */}
  <div 
    onClick={() => window.open("https://play2048.co/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-blue-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🔢</div>
    <span className="text-sm text-white font-medium">2048 GAME</span>
  </div>

  {/* Focus */}
  <div 
    onClick={() => window.open("https://aimtrainer.io/", "_blank")}
    className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
               flex flex-col items-center justify-center cursor-pointer 
               hover:scale-105 hover:bg-red-500/20 transition duration-300"
  >
    <div className="text-2xl mb-1">🎯</div>
    <span className="text-sm text-white font-medium">FOCUS GAME</span>
  </div>

    <div 
  onClick={() => window.open("https://slither.io/", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-green-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">🐍</div>
  <span className="text-sm text-white font-medium">SLITHER GAME</span>
</div>

    <div 
  onClick={() => window.open("https://www.chess.com/play/computer", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-indigo-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">♟️</div>
  <span className="text-sm text-white font-medium">CHESS GAME</span>
</div>

    <div 
  onClick={() => window.open("https://www.boatloadpuzzles.com/playcrossword", "_blank")}
  className="h-20 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 
             flex flex-col items-center justify-center cursor-pointer 
             hover:scale-105 hover:bg-green-500/20 transition duration-300"
>
  <div className="text-2xl mb-1">🧩</div>
  <span className="text-sm text-white font-medium">CROSSWORD</span>
</div>

</div>
            </GlassCard>
        </div>
    );
};

export default MoodMachine;
