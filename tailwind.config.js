/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                lato: ['Lato', 'sans-serif'],
            },
            colors: {
                brand: {
                    primary: '#006B2D',   // Deep Forest Green
                    accent: '#00D7E8',    // Cyan Accent
                    hover: '#005423',     // Darker Green for hover
                    surface: '#F8FAFC',   // Off-white surface
                }
            }
        },
    },
    plugins: [],
}