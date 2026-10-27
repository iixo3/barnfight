import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      screens: {
        "lg-game": "1200px",
        "md-game": "910px",
      },
      colors: {
        border: "hsla(var(--border))",
        input: "hsla(var(--input))",
        ring: "hsla(var(--ring))",
        foreground: "hsla(var(--foreground))",
        primary: {
          DEFAULT: "hsla(var(--primary))",
          foreground: "hsla(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsla(var(--secondary))",
          foreground: "hsla(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsla(var(--destructive))",
          foreground: "hsla(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsla(var(--muted))",
          foreground: "hsla(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsla(var(--accent))",
          foreground: "hsla(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsla(var(--popover))",
          foreground: "hsla(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsla(var(--card))",
          foreground: "hsla(var(--card-foreground))",
        },
        background: "var(--background)",
        "background-opacity": "var(--background-opacity)",
        "system-modals": "var(--system-modals)",
        icons: "var(--icons)",
        modals: "var(--modals)",
        "component-main": "var(--component-main)",
        "component-main-non-opacity": "var(--component-main-non-opacity)",
        "component-highlight": "var(--component-highlight)",
        "stroke-main": "var(--stroke-main)",
        "text-main": "var(--text-main)",
        "text-highlight": "var(--text-highlight)",
        "text-secondary": "var(--text-secondary)",
        "text-offset": "var(--text-offset)",
        "brand-gradient-green-1": "var(--brand-gradient-green-1)",
        "brand-gradient-green-2": "var(--brand-gradient-green-2)",
        "brand-gradient-red-1": "var(--brand-gradient-red-1)",
        "brand-gradient-red-2": "var(--brand-gradient-red-2)",
      },
      keyframes: {
        marquee: {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(calc(-100% - var(--gap)))",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        handjet: ["var(--font-handjet)"],
        aeonik: ["var(--font-aeonik)"],
        bebasNeue: ["var(--font-bebas-neue)"],
      },
      gridTemplateColumns: {
        "18": "repeat(18, minmax(0, 1fr))",
        "24": "repeat(24, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        "2.5": "repeat(2, minmax(0, .5fr))",
      },
      gridColumn: {
        "span-13": "span 13 / span 13",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
