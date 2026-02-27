/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0.25rem',
                DEFAULT: '0.25rem',
                'md': '0.25rem',
                'lg': '0.25rem',
                'xl': '0.25rem',
                '2xl': '0.25rem',
                '3xl': '0.25rem',
                'full': '0.25rem',
            },
            colors: {
                // Override common "AI colors" with grayscale
                indigo: {
                    50: '#f9fafb', // gray-50
                    100: '#f3f4f6', // gray-100
                    200: '#e5e7eb', // gray-200
                    300: '#d1d5db', // gray-300
                    400: '#9ca3af', // gray-400
                    500: '#4b5563', // gray-600
                    600: '#111827', // gray-900 (black-ish)
                    700: '#000000', // black
                    800: '#000000',
                    900: '#000000',
                },
                emerald: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#4b5563',
                    600: '#111827',
                    700: '#000000',
                    800: '#000000',
                    900: '#000000',
                },
                blue: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#4b5563',
                    600: '#111827',
                    700: '#000000',
                    800: '#000000',
                    900: '#000000',
                },
                purple: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#4b5563',
                    600: '#111827',
                    700: '#000000',
                    800: '#000000',
                    900: '#000000',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-in-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(17,24,39,0.1)' },
                    '50%': { boxShadow: '0 0 40px rgba(17,24,39,0.3)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
