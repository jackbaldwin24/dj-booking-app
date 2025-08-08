module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        card: "#141b2d",
        accent: "#7c3aed",   // purple for CTAs
        danger: "#dc2626",   // red for deletes
      },
      boxShadow: {
        card: "0 6px 24px rgba(0,0,0,.25)",
        hover: "0 10px 32px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
}