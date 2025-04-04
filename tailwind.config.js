/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          // ... thêm các cấp độ khác nếu cần
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          // ... thêm các cấp độ khác
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
