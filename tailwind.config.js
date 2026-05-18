/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050816',
        panel: 'rgba(12, 19, 36, 0.72)',
        emeraldGlow: '#3ddc97',
        cyanGlow: '#54c7ec'
      },
      boxShadow: {
        glass: '0 30px 80px rgba(0, 0, 0, 0.35)',
        glow: '0 0 60px rgba(61, 220, 151, 0.18)'
      },
      backdropBlur: {
        xs: '2px'
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Trebuchet MS"', 'Verdana', 'sans-serif']
      }
    }
  },
  plugins: []
};

