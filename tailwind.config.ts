import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a"
        }
      },
      boxShadow: {
        "soft": "0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
        "card": "0 1px 3px rgba(0,0,0,0.08)",
        "colored": "0 8px 32px -4px rgba(13, 148, 136, 0.2)",
        "glow": "0 0 40px -8px rgba(13, 148, 136, 0.5)"
      },
      animation: {
        "gradient": "gradient-shift 8s ease infinite",
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite"
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.02)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 60px -12px rgba(13, 148, 136, 0.3)" },
          "50%": { opacity: "1", boxShadow: "0 0 80px -8px rgba(6, 182, 212, 0.5)" }
        }
      }
    }
  },
  plugins: []
}

export default config