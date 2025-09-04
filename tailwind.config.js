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
        primary: {
          50: '#FFF1F3',
          100: '#FFE1E6',
          200: '#FFC2CE',
          300: '#FF94A6',
          400: '#FF5577',
          500: '#FF385C',
          600: '#E6204A',
          700: '#CC1A3F',
          800: '#B31736',
          900: '#99132D',
          DEFAULT: '#FF385C',
        },
        secondary: {
          50: '#F0FDFC',
          100: '#CCFBF7',
          200: '#99F6F0',
          300: '#5EEEE6',
          400: '#2DD7D3',
          500: '#00A699',
          600: '#00837A',
          700: '#00685E',
          800: '#004D45',
          900: '#003330',
          DEFAULT: '#00A699',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Legacy support
        brand: {
          DEFAULT: '#FF385C',
          600: '#E6204A',
          700: '#CC1A3F',
        },
        ink: '#212121',
        mutedInk: '#757575',
        soft: '#FAFAFA',
        border: '#EEEEEE',
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
      spacing: {
        '0.5': '4px',   // 0.5 * 8px
        '1': '8px',     // 1 * 8px
        '1.5': '12px',  // 1.5 * 8px
        '2': '16px',    // 2 * 8px
        '2.5': '20px',  // 2.5 * 8px
        '3': '24px',    // 3 * 8px
        '3.5': '28px',  // 3.5 * 8px
        '4': '32px',    // 4 * 8px
        '5': '40px',    // 5 * 8px
        '6': '48px',    // 6 * 8px
        '7': '56px',    // 7 * 8px
        '8': '64px',    // 8 * 8px
        '10': '80px',   // 10 * 8px
        '12': '96px',   // 12 * 8px
        '16': '128px',  // 16 * 8px
        '20': '160px',  // 20 * 8px
        '24': '192px',  // 24 * 8px
        '32': '256px',  // 32 * 8px
      },
    },
  },
  plugins: [],
}

export default config