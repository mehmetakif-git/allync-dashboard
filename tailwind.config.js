/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ana tema renkleri - #2C2D2D & #2E2F2F
        dark: {
          DEFAULT: '#2C2D2D',
          50: '#4A4B4B',
          100: '#424343',
          200: '#3A3B3B',
          300: '#323333',
          400: '#2E2F2F',
          500: '#2C2D2D',
          600: '#242525',
          700: '#1C1D1D',
          800: '#141515',
          900: '#0C0D0D',
        },
        // Vurgu renkleri (sadece önemli yerler için)
        accent: {
          blue: '#3B82F6',
          cyan: '#00D9FF',
          purple: '#A855F7',
          green: '#10B981',
          yellow: '#F59E0B',
          orange: '#F97316',
          red: '#EF4444',
        },
      },
      backgroundColor: {
        primary: '#0F172A', // Deep slate (from mobile)
        secondary: '#1E293B', // Dark slate (from mobile)
        card: '#323333',
        hover: '#3A3B3B',
      },
      backgroundImage: {
        'gradient-mobile': 'linear-gradient(to bottom right, #0F172A 0%, #1E293B 25%, #312E81 50%, #1E1B4B 75%, #0F172A 100%)',
      },
      borderColor: {
        primary: '#3A3B3B',
        secondary: '#424343',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#E5E7EB',
        muted: '#9CA3AF',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'fadeIn': 'fadeIn 0.2s ease-in-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'ring': 'ring 0.8s ease-in-out',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'fadeIn': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'rotate(-10deg)' },
          '20%, 40%, 60%, 80%': { transform: 'rotate(10deg)' },
        },
        'ring': {
          '0%': { transform: 'rotate(0deg)' },
          '5%': { transform: 'rotate(15deg)' },
          '10%': { transform: 'rotate(-12deg)' },
          '15%': { transform: 'rotate(15deg)' },
          '20%': { transform: 'rotate(-12deg)' },
          '25%': { transform: 'rotate(10deg)' },
          '30%': { transform: 'rotate(-8deg)' },
          '35%': { transform: 'rotate(6deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '45%': { transform: 'rotate(2deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}