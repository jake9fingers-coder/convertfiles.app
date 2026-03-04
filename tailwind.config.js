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
                // Celadon Blue primary — #457B9D
                brand: {
                    50: '#F2F6F8',
                    100: '#E0ECF2',
                    200: '#BAD6E3',
                    300: '#88B9CF',
                    400: '#5798B6',
                    500: '#457B9D', // primary Celadon
                    600: '#36607C',
                    700: '#294A61',
                    800: '#1D3647',
                    900: '#152733',
                },
                // Prussian Blue dark palette & Honeydew light — #1D3557 / #F1FAEE
                dark: {
                    900: '#1D3557', // primary Prussian
                    800: '#2A4874',
                    700: '#385E95',
                    600: '#4A77B8',
                    500: '#6B91C6',
                    400: '#8CAAD3',
                    300: '#ADC3E0',
                    200: '#D6E3F2',
                    100: '#E6EEF7',
                    50: '#F4F7F6',  // neutral premium off-white
                },
                // Crimson accent — #E63946
                accent: {
                    50: '#FCF4F5',
                    100: '#F8E6E7',
                    200: '#F0C4C7',
                    300: '#E6989D',
                    400: '#DB666E',
                    500: '#E63946', // primary Crimson
                    600: '#C22B36',
                    700: '#9C2029',
                    800: '#7A1B22',
                    900: '#61181E',
                },
                // Light Blue soft — #A8DADC
                soft: {
                    50: '#F6FBFC',
                    100: '#E9F6F7',
                    200: '#CFEAEC',
                    300: '#A8DADC', // primary Light Blue
                    400: '#7AC2C5',
                    500: '#55A8AC',
                    600: '#428B8E',
                    700: '#356F72',
                    800: '#2C5A5D',
                    900: '#254C4E',
                }
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
                    '0%, 100%': { boxShadow: '0 0 20px rgba(69, 123, 157, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(69, 123, 157, 0.45)' },
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
