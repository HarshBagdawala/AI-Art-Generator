import type { Metadata } from "next";
// import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/UI/Navbar";

// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "ArtBot | WhatsApp AI Art Generator",
  description: "Turn your words into stunning AI-generated art via WhatsApp in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#0A0A0F] text-white">
        <div className="mesh-gradient animate-mesh" />
        <Navbar />
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
