/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{App,index}.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        'praise': '#E5896F',
        'abiding': '#D8A771',
        'character': '#6BB3BF',
        'lords-prayer': '#A6D9E3',
        'petitions': '#5E738A',
        'biblical': '#848484',
        'meditations': '#E6C6B3',
        'one-sentence': '#EBC9C5',
        'base': '#F8F6F2',
      }
    },
  },
  plugins: [],
}
