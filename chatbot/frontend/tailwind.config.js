/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F5F5F0",
        sand: "#E5DFD3",
        sage: "#8A9A86",
        "monk-red": "#8B3A2B",
        "forest": "#1A3622",
        "forest-light": "#4A5D4E",
        "border-subtle": "#D5CFC3",
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
