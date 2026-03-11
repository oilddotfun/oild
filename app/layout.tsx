import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "OILD.fun | Claim Nations. Drill Oil. Conquer the Map.",
  description: "The on-chain oil war. Claim countries, deploy tokens on pump.fun, build armies, declare war. Every nation has a president. Built on Solana.",
  metadataBase: new URL("https://oild.fun"),
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "OILD.fun | The On-Chain Oil War",
    description: "Claim countries. Deploy tokens. Declare war. Every nation has a president, an army, and oil to fight for.",
    url: "https://oild.fun",
    siteName: "OILD.fun",
    images: [{ url: "/logo.jpg", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OILD.fun | The On-Chain Oil War",
    description: "Claim countries. Deploy tokens. Declare war. Built on Solana.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
