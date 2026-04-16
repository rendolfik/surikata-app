/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#0dc0df',
        'ocean-d': '#0899b5',
        'ocean-dd': '#066a80',
        bg: '#f0fbfd',
        border: '#c8eef5',
        text: '#0d2d35',
        muted: '#5a8a96',
        warm: '#ff6b35',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        ocean: '0 2px 16px rgba(13,192,223,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
