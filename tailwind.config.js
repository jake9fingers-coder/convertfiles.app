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
                DEFAULT: '0.5rem',
                'md': '0.5rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '0.75rem',
                '3xl': '0.75rem',
                'full': '9999px',
            },
            colors: {
                // Coral/salmon primary — #F58F7C
                brand: {
                    50: '#FDF5F3',
                    100: '#FAEAE6',
                    200: '#F5D0C8',
                    300: '#F2C4CE',  // blush pink
                    400: '#F5A394',
                    500: '#F58F7C',  // primary coral
                    600: '#E8735F',
                    700: '#D05A48',
                    800: '#A84234',
                    900: '#7C2F24',
                },
                // Charcoal dark palette — #2C2B30 / #4F4F51 / #D6D6D6
                dark: {
                    900: '#2C2B30',
                    800: '#3A3940',
                    700: '#4F4F51',
                    600: '#636366',
                    500: '#8E8E93',
                    400: '#AEAEB2',
                    300: '#D6D6D6',
                    200: '#E5E5EA',
                    100: '#F2F2F7',
                    50: '#F9F9FB',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up-delayed': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(245, 143, 124, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(245, 143, 124, 0.45)' },
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
