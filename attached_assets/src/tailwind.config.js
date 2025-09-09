/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom animations for holographic effects
      animation: {
        'modern-pulse': 'modern-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'modern-bounce': 'modern-bounce 1s infinite',
        'smooth-fade-in': 'smooth-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'holographic': 'holographic-shift 8s ease-in-out infinite',
        'data-flow': 'data-flow 3s ease-in-out infinite',
        'typing-dots': 'typing-dots 1.4s ease-in-out infinite',
      },
      
      // Keyframes defined in globals.css
      keyframes: {
        'modern-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' }
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};