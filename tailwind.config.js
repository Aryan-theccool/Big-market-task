/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        panel: "var(--bg-panel)",
        hover: "var(--bg-hover)",
        borderLine: "var(--border)",
        borderFocus: "var(--border-focus)",
        primaryText: "var(--text-primary)",
        secondaryText: "var(--text-secondary)",
        mutedText: "var(--text-muted)",
        gridDot: "var(--dot-grid)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          glow: "var(--accent-glow)",
          violet: "#8B5CF6",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
          sky: "#0EA5E9",
        },
        note: {
          sun: "#FEF3C7",
          rose: "#FFE4E6",
          sky: "#E0F2FE",
          sage: "#DCFCE7",
          lilac: "#F3E8FF",
          peach: "#FFEDD5",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
        note: ["var(--font-note)", "cursive"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        "spring-quick": "var(--spring-quick)",
        "spring-medium": "var(--spring-medium)",
        "spring-slow": "var(--spring-slow)",
      },
      keyframes: {
        "marching-ants": {
          to: { "stroke-dashoffset": "-20" },
        },
        "float-note": {
          "0%, 100%": { transform: "translateY(0px) rotate(var(--rot))" },
          "50%": { transform: "translateY(-8px) rotate(calc(var(--rot) + 0.5deg))" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { "background-position": "-200% center" },
          to: { "background-position": "200% center" },
        },
        "region-peel": {
          "0%": { transform: "scale(1) translate(0,0)", opacity: "1" },
          "50%": { transform: "scale(1.05) translate(0, -20px)", opacity: "0.8" },
          "100%": { transform: "scale(0.7) translate(0, -60px)", opacity: "0" },
        },
        "page-wipe": {
          "0%": { transform: "translateX(-105%)" },
          "45%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(105%)" },
        }
      },
      animation: {
        "marching-ants": "marching-ants .8s linear infinite",
        "float-note": "float-note 5s ease-in-out infinite",
        "cursor-blink": "cursor-blink 1s infinite",
        "fade-slide-up": "fade-slide-up .18s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in .12s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 5s linear infinite",
        "region-peel": "region-peel .4s ease-in-out forwards",
        "page-wipe": "page-wipe .72s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    },
  },
  plugins: [],
};
