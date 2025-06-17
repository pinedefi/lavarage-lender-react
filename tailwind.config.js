/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        ios: {
          'light-gray': '#F2F2F7',
          'dark-gray': '#1C1C1E',
          'menu-bg': 'rgba(0, 0, 0, 0.75)',
          'separator': 'rgba(255, 255, 255, 0.15)',
        },
        // LAVARAGE Primary Colors
        lavarage: {
          yellow: '#FFDD6F',
          orange: '#FFB467', 
          coral: '#FF845C',
          red: '#FF433F',
          // Secondary colors
          burgundy: '#A51809',
          purple: '#C58FA1',
          'blue-purple': '#9264D7',
          'blue-gray': '#D9D9ED',
          gray: '#787888',
          // Neutral colors
          white: '#ffffff',
          black: '#000000',
        },
        // Updated primary color scheme to use LAVARAGE brand
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FFDD6F', // LAVARAGE Yellow
          500: '#FFB467', // LAVARAGE Orange
          600: '#FF845C', // LAVARAGE Coral
          700: '#FF433F', // LAVARAGE Red
          800: '#dc2626',
          900: '#A51809', // LAVARAGE Burgundy
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      // LAVARAGE Brand Gradients
      backgroundImage: {
        'lavarage-primary': 'linear-gradient(135deg, #FFDD6F 0%, #FFB467 25%, #FF845C 75%, #FF433F 100%)',
        'lavarage-secondary': 'linear-gradient(135deg, #C58FA1 0%, #9264D7 50%, #D9D9ED 100%)',
        'lavarage-subtle': 'linear-gradient(135deg, rgba(255, 221, 111, 0.1) 0%, rgba(255, 67, 63, 0.1) 100%)',
        'lavarage-dark': 'linear-gradient(135deg, #A51809 0%, #787888 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          }
        }
      },
      backdropBlur: {
        'ios': '20px',
      },
      borderRadius: {
        'ios': '13px',
        'ios-xl': '22px',
      },
      // Enhanced typography for LAVARAGE brand
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
        'brand': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
