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
        primary: '#2C2D2D',
        secondary: '#2E2F2F',
        card: '#323333',
        hover: '#3A3B3B',
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
      },
    },
  },
  plugins: [],
}