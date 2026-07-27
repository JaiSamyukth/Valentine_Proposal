import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Something Someone Spent Courage On",
  description:
    "An unforgettable, cinematic Valentine's experience. A living world of hearts, fireflies, mini-games, and a question written in the stars.",
  keywords: [
    "valentine",
    "love",
    "proposal",
    "romantic",
    "interactive",
    "cinematic",
  ],
  authors: [{ name: "Made with love" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "You've Received Something Special",
    description: "A cinematic Valentine's experience waiting for you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You've Received Something Special",
    description: "A cinematic Valentine's experience waiting for you.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
