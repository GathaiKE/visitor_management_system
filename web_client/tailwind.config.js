/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",  
        sm: "576px",  
        md: "768px",  
        lg: "992px",  
        xl: "1200px",
        '2xl': "1400px"
      },
      fontSize: {
        xs: "0.75rem",  
        sm: "0.875rem", 
        base: "1rem",   
        lg: "1.125rem", 
        xl: "1.25rem",  
        '2xl': "1.5rem", 
        '3xl': "1.875rem",
        '4xl': "2.25rem",
        '5xl': "3rem"
      },
      colors:{
        primary:{
          'light':"rgb(245, 245, 253)",
          'medium':"rgb(231, 236, 255)",
          'strong':"rgb(1, 0, 138)"
        },
        backdrop:'rgba(0, 0, 0, 0.3)',
        backdrop_low:"rgba(1, 0, 138,0.3)",
        backdrop_high:"rgba(1, 0, 138,0.6)",
        icon_shade:'#E8F5E9',
        login_text:'#355B3E',
        active_link:'#718EBF',


        outbg:"rgba(255,0,0,0.15)",
        inbg:"rgba(102,204,102,0.15)",
        grey:"rgb(75, 67, 67)",
        card_month:"rgb(255, 255, 107)",
        card_today:"rgb(146, 146, 249)",
        card_active:"rgb(8, 253, 3)",
        card_inactive:"rgb(255, 111, 111)",
        card_header_text:"rgb(115, 107, 107)",
        container_bg:"rgba(0,0,0,0.7)",
        login_bg:"#D9D9D9"
      }
    },
  },
  plugins: [],
}