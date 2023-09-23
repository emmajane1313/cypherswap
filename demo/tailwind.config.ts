import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        air: "Airstrike Plat",
        on: "Onramp",
        dogB: "Dogica Bold",
        dog: "Dogica",
      },
      colors: {
        agua: "#44D7B6",
        plat: "#32C5FF",
        mosgu: "#D7FBB1",
        bosque: "#6DD400",
        naranje: "#F7B500",
        sol: "#F6EFA6",
        oscuri: "#FA6400",
      },
      fontSize: {
        xxs: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
