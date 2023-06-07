/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        light: '#fbfadd',
        bright_light: '#f4dc76',
        blaze: '#d66b0d',
        nura_blue: '#21a5d9' 
      },
      keyframes: {
        blink_out: {
          '0%': {opacity: '1'},
          '90%': {transform: 'scale(0)'},
          '97%': {
            transform: 'scale(.02)', 
            background: '#d66b0d', 
            boxShadow: '0 0 5px 10px #f4dc76',
            borderRadius: '100%'
          },
          '100%': {transform: 'scale(0)'}
        },
        flare_x: {
          '0%': {width: '0px', height: '1px', border: 'solid 1px #d66b0d'},
          '90%': {width: '0px'},
          '97%': {width: '60vw', boxShadow: '0 0 1px 2px #f4dc76'},
          '100%': {width: '0'}
        },
        flare_y: {
          '0%': {width: '1px', height: '0px', border: 'solid 1px #d66b0d'},
          '90%': {height: '0px'},
          '97%': {height: '40vh', boxShadow: '0 0 1px 2px #f4dc76'},
          '100%': {height: '0'}
        },
        flarble_1: {
          '25%': {opacity: '.5', transform: 'scale(1.3)'}
        },
        flarble_2: {
          '50%': {opacity: '.5', transform: 'scale(1.3)'}
        },
        flarble_3: {
          '75%': {opacity: '.5', transform: 'scale(1.3)'}
        },
      },
      animation: {
        blink_out: 'blink_out .75s linear',
        flare_x: 'flare_x .5s linear',
        flare_y: 'flare_y .5s linear',
        flubble_1: 'flarble_1 1s ease infinite',
        flubble_2: 'flarble_2 1s ease infinite',
        flubble_3: 'flarble_3 1s ease infinite'
      }
    },
  },
  plugins: [],
}
