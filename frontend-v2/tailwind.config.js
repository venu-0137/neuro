/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F172A",
                primary: {
                    indigo: "#6366F1",
                    violet: "#8B5CF6",
                },
                accent: "#22D3EE",
                text: "#E2E8F0",
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
