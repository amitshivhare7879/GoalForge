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
  description: "A next-generation accountability platform to turn your goals into tempered steel.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} w-full min-h-full`}
        suppressHydrationWarning
      >
        <div id="notif-wrap"></div>
        {children}
      </body>
    </html>
  );
}
