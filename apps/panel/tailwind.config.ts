/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["index.html", "./src/**/*.{jsx,tsx,js,ts}", "./node_modules/flowbite/**/*.js"],
    theme: {
        extend: {},
    },
    plugins: [require("flowbite/plugin")],
    darkMode: "class",
};
