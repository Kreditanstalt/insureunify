import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bulstrad: '#0B3D91',
        generali: '#C8102E',
        instinct: '#1B6B3A',
      },
    },
  },
  plugins: [],
}

export default config
