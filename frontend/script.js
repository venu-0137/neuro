document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const charCount = document.getElementById('char-count');
    const resultsSection = document.getElementById('results-section');
    const analysisSection = document.querySelector('.analysis-section');
    const emotionDisplay = document.getElementById('predicted-emotion');

    // API URL - adjust if running on different port
    const API_URL = 'http://localhost:8000/analyze';

    // Character counter
    textInput.addEventListener('input', () => {
        const length = textInput.value.length;
        charCount.textContent = `${length} / 500`;
        if (length > 500) {
            charCount.style.color = '#ff4757';
        } else {
            charCount.style.color = '#a0a0c8';
        }
    });

    // Analyze handle
    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) return;

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            
            // Show results
            emotionDisplay.textContent = data.emotion;
            analysisSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to connect to the NeuroTalk API. Make sure the backend is running!');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Mindset';
        }
    });

    // Reset handle
    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
        textInput.value = '';
        charCount.textContent = '0 / 500';
    });
});
