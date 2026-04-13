/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './App.tsx'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        surface: '#FFFFFF',
        'surface-1': '#F8FAFC',
        'surface-2': '#F1F5F9',
        border: '#E2E8F0',
        fg: '#0F172A',
        'fg-muted': '#64748B',
        'fg-subtle': '#94A3B8',
      },
      fontFamily: {
        sans: ['Pretendard', 'System'],
      },
    },
  },
  plugins: [],
};
