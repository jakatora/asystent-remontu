/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        'primary-dark': '#EA6800',
        'primary-light': '#FED7AA',
        'primary-bg': '#FFF7ED',
        success: '#22C55E',
        'success-bg': '#F0FDF4',
        warning: '#F59E0B',
        'warning-bg': '#FFFBEB',
        danger: '#EF4444',
        'danger-bg': '#FEF2F2',
        info: '#3B82F6',
        'info-bg': '#EFF6FF',
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-alt': '#F1F5F9',
        stroke: '#E2E8F0',
        'stroke-light': '#F1F5F9',
        ink: '#0F172A',
        slate: '#64748B',
        muted: '#94A3B8',
      },
    },
  },
  plugins: [],
};
