/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-primary)", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Manrope", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary-blue)",
          dark: "var(--primary-blue-dark)",
          light: "var(--primary-blue-light)",
        },
        accent: {
          mint: "var(--accent-mint)",
          orange: "var(--accent-orange)",
          purple: "var(--accent-purple)",
        },
        neutral: {
          900: "var(--neutral-900)",
          700: "var(--neutral-700)",
          500: "var(--neutral-500)",
          300: "var(--neutral-300)",
          100: "var(--neutral-100)",
          50: "var(--neutral-50)",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      transitionTimingFunction: {
        fast: "var(--transition-fast)",
        base: "var(--transition-base)",
        slow: "var(--transition-slow)",
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
