const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  // The app ships its own CSS reset in public/index.css
  // (`* { box-sizing: border-box; margin: 0; padding: 0 }`, button/anchor
  // resets, etc.), so Tailwind's preflight is disabled to avoid double-
  // resetting and altering the existing styled-components UI.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Mirrors src/constants/GlobalTheme.tsx. Keep the two files in sync.
      colors: {
        primary: '#0052cc',
        primaryDark: '#0747a6',
        primaryExtraDark: '#042049',
        courses: '#ff8b00',
        professors: '#36b37e',
        accent: '#ffc400',
        accentDark: '#e8b300',

        dark1: '#172b4d',
        dark2: '#505f79',
        dark3: '#97a0af',

        light1: '#f4f5f7',
        light2: '#ebecf0',
        light3: '#dfe1e5',
        light4: '#c6c9c9',

        lecture: '#b3d4ff',
        lab: '#b3f3ff',
        tutorial: '#c0b6f2',

        white: '#ffffff',
        red: '#ff5630',
        darkRed: '#de350b',

        google: '#4285f4',
        facebook: '#3c5a99',

        transparent: 'rgba(0, 0, 0, 0)',
      },
      // Mirrors GlobalTheme.breakpoints (min-width). `zero` (0) is the base, so
      // it is intentionally omitted as a Tailwind screen.
      screens: {
        mobileLarge: '600px',
        tablet: '800px',
        tabletDown: { max: '800px' },
        mobileDown: { max: '500px' },
        desktop: '1200px',
      },
      fontFamily: {
        inter: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Roboto',
          'Segoe UI',
          'Helvetica Neue',
          'sans-serif',
        ],
        anderson: [
          'Anderson Grotesk',
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Roboto',
          'Segoe UI',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '40px',
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        extrabold: '800',
      },
      // Semantic t-shirt spacing scale for padding/margin/gap. Prefer these
      // (p-md, gap-sm, mb-lg, …) over arbitrary `[Npx]` values. See AGENTS.md.
      spacing: {
        page: '32px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      width: {
        'wide-column': '70%',
        'thin-column': '30%',
      },
      maxWidth: {
        page: '1200px',
      },
      minHeight: {
        page: 'calc(100vh - 70px - 32px)',
      },
      zIndex: {
        'page-content': '-1',
        modal: '2000',
      },
      borderRadius: {
        card: '4px',
      },
      boxShadow: {
        box: '0px 2px 5px rgba(236, 237, 237, 0.4), 0px 0px 5px rgba(142, 147, 148, 0.2)',
        'dark-box': '0px 0px 10px #042049',
        'bottom-box':
          '0px 1px 3px rgba(236, 237, 237, 0.4), 0px 1px 3px rgba(142, 147, 148, 0.2)',
        // Floating overlay panels (dropdown menus, popovers) sit above the page
        // and need a deeper drop than the inline `box` shadow.
        dropdown: '0px 4px 20px rgba(0, 0, 0, 0.12)',
      },
      textShadow: {
        DEFAULT:
          '0px 2px 5px rgba(236, 237, 237, 0.4), 0px 0px 5px rgba(142, 147, 148, 0.2)',
      },
      brightness: {
        hover: '0.85',
        'hover-dark': '0.6',
      },
      transitionDuration: {
        hover: '100ms',
      },
      transitionTimingFunction: {
        hover: 'ease-in',
      },
      keyframes: {
        // Matches the legacy react-fade-in <FadeIn> component used across the
        // app: an opacity fade combined with a 20px upward rise, so Tailwind
        // pages animate identically to the styled-components ones.
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        // react-fade-in's default transitionDuration is 400ms (ease easing).
        'fade-in': 'fadeIn 0.4s ease',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.text-shadow': {
          textShadow: theme('textShadow.DEFAULT'),
        },
        // Body typography (Inter / 16px / 400) bundled into one class.
        '.text-body': {
          fontFamily: theme('fontFamily.inter'),
          fontSize: theme('fontSize.md'),
          fontWeight: theme('fontWeight.regular'),
        },
      });
    }),
  ],
};
