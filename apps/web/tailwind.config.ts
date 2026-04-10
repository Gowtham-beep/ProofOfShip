import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#0d1117',
        surface:   '#161b22',
        border:    '#30363d',
        muted:     '#8b949e',
        text:      '#e6edf3',
        green:     '#3fb950',
        yellow:    '#d29922',
        red:       '#f85149',
        blue:      '#58a6ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
