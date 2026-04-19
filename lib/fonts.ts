import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";

export const display = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const heading = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
