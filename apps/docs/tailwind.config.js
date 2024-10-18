/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
    container: false,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        scaleDown: {
          '0%': { transform: 'scale(1) translate(0.2rem, 0.2rem)' },
          '50%': { transform: 'scale(1.25) translate(0.6rem, 0.6rem)' },
          '100%': { transform: 'scale(1.15) translate(1rem, 1rem)' },
        },
      },
      animation: {
        scaleBack: 'scaleDown 0.4s ease-in-out forwards'
      },
    },
    fontFamily: {
      "Manrope-Bold" :["Manrope-Bold","sans-serif"],
      "Manrope-ExtraBold" :["Manrope-ExtraBold","sans-serif"],
      "Manrope-Light" :["Manrope-Light","sans-serif"],
      "Manrope-ExtraLight" :["Manrope-ExtraLight","sans-serif"],
      "Manrope-Medium" :["Manrope-Medium","sans-serif"],
      "Manrope-Regular" :["Manrope-Regular","sans-serif"],   
      "Manrope-SemiBold" :["Manrope-SemiBold","sans-serif"],      
  },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


// module.exports = {
//   theme: {
//     extend: {
//       fontFamily: {
//         manrope: ['Manrope', 'sans-serif'], // Adding Manrope to Tailwind
//       },
//     },
//   },
//   plugins: [],
// };
