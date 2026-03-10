/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        panel: "#FFFFFF",
        electric: "#3F6FFF",
        violet: "#7D5CF2",
        glow: "#5F80FF",
        accent: "#FFC83D",
        "accent-hover": "#F2B81F",
        blue: {
          50: "#161616",
          100: "#3A3A3A",
          200: "#4A4A4A",
          300: "#8EA3D2"
        },
        slate: {
          100: "#111111",
          300: "#3A3A3A"
        }
      },
      boxShadow: {
        glow: "0 12px 30px rgba(63, 111, 255, 0.24)",
        violet: "0 14px 32px rgba(125, 92, 242, 0.24)"
      },
      backgroundImage: {
        "panel-gradient":
          "linear-gradient(135deg, rgba(63, 111, 255, 0.18), rgba(125, 92, 242, 0.18))"
      }
    }
  },
  plugins: []
};
