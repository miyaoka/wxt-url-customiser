/** @type {import('tailwindcss').Config} */
import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons";

export default {
  content: ["./src/**/*.{html,js,ts,vue}"],
  theme: {
    extend: {},
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["mdi"]),
    }),
  ],
};
