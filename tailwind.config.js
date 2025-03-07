/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.*'],
  
    darkMode: ['selector', '[arco-theme="dark"]'],
  
    plugins: [require('@tailwindcss/typography')],
  };
  