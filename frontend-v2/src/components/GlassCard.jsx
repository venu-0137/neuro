import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', animate = true }) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 20 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            whileHover={animate ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`glass-card p-6 md:p-8 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
