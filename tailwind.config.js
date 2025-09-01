/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6B6B',
          600: '#F25454',
          700: '#E14444',
        },
        ink: '#111827',
        mutedInk: '#6B7280',
        soft: '#F9FAFB',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config