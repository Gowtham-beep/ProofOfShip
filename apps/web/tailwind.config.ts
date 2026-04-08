import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'inverse-surface': '#dfe2eb',
        'surface-container-high': '#262a31',
        'on-background': '#dfe2eb',
        'on-primary-container': '#004311',
        'inverse-primary': '#006e21',
        'on-surface': '#dfe2eb',
        'primary': '#67df70',
        'on-surface-variant': '#bdcab8',
        'surface-dim': '#10141a',
        'primary-container': '#3fb950',
        'secondary-container': '#41474f',
        'surface-variant': '#31353c',
        'secondary': '#c1c7d0',
        'surface-container-highest': '#31353c',
        'surface-container': '#1c2026',
        'secondary-fixed': '#dde3ec',
        'on-secondary': '#2b3138',
        'outline': '#879484',
        'primary-fixed': '#83fc89',
        'secondary-fixed-dim': '#c1c7d0',
        'surface-container-lowest': '#0a0e14',
        'background': '#10141a',
        'surface': '#10141a',
        'surface-bright': '#353940',
        'outline-variant': '#3e4a3c',
        'surface-container-low': '#181c22',
        'on-primary': '#00390d',
        'primary-fixed-dim': '#67df70',
        'on-secondary-container': '#b0b5be',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}

export default config
