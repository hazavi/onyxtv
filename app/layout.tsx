import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OnyxTV",
    template: "%s — OnyxTV",
  },
  description: "Stream movies and TV shows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen">{children}</main>
        <footer className="text-center text-white/20 text-xs py-6 px-4 border-t border-white/[0.04]">
          This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
        </footer>
        <Suspense>
          <Navbar />
        </Suspense>
      </body>
    </html>
  );
}
