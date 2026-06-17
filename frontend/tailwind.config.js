/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1d1f",
        paper: "#fbfbfd",
        mist: "#f5f5f7",
        line: "#e5e5e7",
        accentLLM: "#7F77DD",
        accentOCR: "#1D9E75",
        muted: "#6e6e73"
      },
      fontFamily: {
        sans: ["-apple-system", "SF Pro Display", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
}
