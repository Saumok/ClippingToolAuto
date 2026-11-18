import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClipPilot — Vice City Control",
  description: "Autonomous AI YouTube live-stream clipping & Shorts publishing. Controlled from your phone.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ClipPilot", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#07030f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col lg:flex-row">
          <Nav />
          <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
