/**
 * Utility functions for safely accessing and normalizing emotional data
 * from the NeuroTalk API, supporting both legacy (Array) and current (Object) formats.
 */

export const getDominantEmotion = (emotions) => {
    if (!emotions) return 'neutral';
    
    // Array format: [{label: 'joy', score: 0.9}, ...]
    if (Array.isArray(emotions)) {
        return emotions[0]?.label || 'neutral';
    }
    
    // Dictionary format: {joy: 0.9, neutral: 0.1}
    if (typeof emotions === 'object' && emotions !== null) {
        const keys = Object.keys(emotions);
        return keys.length > 0 ? keys[0] : 'neutral';
    }
    
    // Fallback if it's already a string
    if (typeof emotions === 'string') return emotions;
    
    return 'neutral';
};

export const getEmotionScore = (emotions) => {
    if (!emotions) return 0;
    
    if (Array.isArray(emotions)) {
        return emotions[0]?.score || 0;
    }
    
    if (typeof emotions === 'object' && emotions !== null) {
        const values = Object.values(emotions);
        return values.length > 0 ? values[0] : 0;
    }
    
    return 0;
};

export const getAllEmotions = (emotions) => {
    if (!emotions) return [];
    
    if (Array.isArray(emotions)) {
        return emotions.map(e => e.label);
    }
    
    if (typeof emotions === 'object' && emotions !== null) {
        return Object.keys(emotions);
    }
    
    return [];
};

export const formatDate = (dateStr) => {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) throw new Error('Invalid date');
        return {
            day: d.getDate(),
            month: d.toLocaleString('en-US', { month: 'short' }),
            year: d.getFullYear(),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            full: d.toLocaleString()
        };
    } catch (e) {
        return {
            day: '--',
            month: '---',
            year: '----',
            time: '--:--',
            full: 'Unknown Date'
        };
    }
};
