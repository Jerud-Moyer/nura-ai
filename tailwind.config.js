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
            borderRadius: '100%'
          },
          '100%': {transform: 'scale(0)'}
        },
        flare_x: {
          '90%': {transform: 'scaleX(0)'},
          '97%': {transform: 'scaleX(400)'},
          '100%': {transform: 'scaleX(0)'}
        },
        flare_y: {
          '90%': {transform: 'scaleY(1)'},
          '97%': {transform: 'scaleY(400)'},
          '100%': {transform: 'scaleY(1)'}
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
        reveal: {
          '0%': {opacity: '0'},
          '100%': {opacity: '1'}
        }
      },
      animation: {
        blink_out: 'blink_out .75s linear',
        flare_x: 'flare_x .5s linear',
        flare_y: 'flare_y .5s linear',
        flubble_1: 'flarble_1 1s ease infinite',
        flubble_2: 'flarble_2 1s ease infinite',
        flubble_3: 'flarble_3 1s ease infinite',
        reveal: 'reveal 2s ease'
      }
    },
  },
  plugins: [],
}
