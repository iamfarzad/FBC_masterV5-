import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: [
    'class',
    '[data-theme="dark"]', // Support attribute strategy
  ],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // 🎨 F.B/c THEME SYSTEM - IMMUTABLE BRAND COLORS
        // 🚫 NEVER MODIFY BRAND COLORS WITHOUT APPROVAL 🚫

        // Primary brand colors (NEVER CHANGE)
        brand: 'var(--brand)',          // #ff5b04 - F.B/c Orange
        brandHover: 'var(--brand-hover)', // #e65200 - Orange hover

        // Surface colors
        bg: 'var(--bg)',                // Background
        surface: 'var(--surface)',      // Primary surface
        surfaceElevated: 'var(--surface-elevated)', // Elevated surface

        // Text colors
        text: 'var(--text)',            // Primary text
        textMuted: 'var(--text-muted)', // Muted text

        // Border color
        border: 'var(--border)',        // Border color

        // Semantic colors (SAFE TO EXTEND)
        success: 'var(--success)',      // #10b981
        warning: 'var(--warning)',      // #f59e0b
        error: 'var(--error)',          // #ef4444
        info: 'var(--info)',            // #3b82f6

        // 🔄 LEGACY COMPATIBILITY (Safe to remove after migration)
        // These can be removed once all components use theme tokens
        background: 'var(--bg)',
        foreground: 'var(--text)',
        primary: 'var(--brand)',
        'primary-foreground': 'var(--surface)',
        secondary: 'var(--surface-elevated)',
        'secondary-foreground': 'var(--text)',
        muted: 'var(--surface-elevated)',
        'muted-foreground': 'var(--text-muted)',
        accent: 'var(--brand)',
        'accent-foreground': 'var(--surface)',
        destructive: 'var(--error)',
        'destructive-foreground': 'var(--surface)',
        input: 'var(--surface)',
        ring: 'var(--brand)',
        popover: 'var(--surface)',
        'popover-foreground': 'var(--text)',
        card: 'var(--surface)',
        'card-foreground': 'var(--text)',

        // Backwards-compat brand aliases (DEPRECATED - use theme tokens)
        "orange-accent": "hsl(var(--brand))",
        "orange-accent-hover": "hsl(var(--brand-hover))",
        "gunmetal": "var(--color-gunmetal)",
        "gunmetal-lighter": "var(--color-gunmetal-lighter)",
        "light-silver": "var(--color-light-silver)",
        "light-silver-darker": "var(--color-light-silver-darker)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      spacing: {
        'responsive-base': 'var(--spacing-responsive-base, 0.5rem)',
        'responsive-md': 'var(--spacing-responsive-md, 0.75rem)',
        'responsive-lg': 'var(--spacing-responsive-lg, 1rem)',
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shine: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shine: "shine 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("./tailwind.tokens-guard")
  ],
} satisfies Config

export default config
