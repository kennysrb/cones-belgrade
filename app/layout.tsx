import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cones Hockey Club",
    template: "%s · Cones Hockey Club",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
