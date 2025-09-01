import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colors
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',

        // Surface colors
        bg: 'var(--bg)',
        background: 'var(--bg)', // Legacy support
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',

        // Text colors
        text: 'var(--text)',
        foreground: 'var(--text)', // Legacy support
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',

        // Border colors
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',

        // Semantic colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',

        // Legacy shadcn/ui support (minimal)
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
        card: 'var(--surface)',
        'card-foreground': 'var(--text)',
        popover: 'var(--surface)',
        'popover-foreground': 'var(--text)',
        input: 'var(--surface)',
        ring: 'var(--brand)',

        // Legacy color support for globals.css
        gunmetal: '#020617',
        'gunmetal-lighter': '#1e293b',
        'light-silver': '#fafafa',
        'light-silver-darker': '#f1f5f9',
        'orange-accent': '#ff5b04',
        'orange-accent-hover': '#e65200',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'modern-pulse': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'smooth-slide-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        'fade-in': "fade-in 0.5s ease-out",
        'scale-in': "scale-in 0.3s ease-out",
        'modern-pulse': "modern-pulse 2s ease-in-out infinite",
        'smooth-slide-in': "smooth-slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}

export default config
