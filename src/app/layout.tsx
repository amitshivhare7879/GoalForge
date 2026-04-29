import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "GoalForge — Stop Dreaming. Start Forging.",
  description: "AI-powered accountability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}>
        <div id="notif-wrap"></div>
        {children}
      </body>
    </html>
  );
}
