import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PrototypeProvider } from "@/components/prototype/PrototypeProvider";
import { TarsAgentBubble } from "@/components/tars-agent/TarsAgentBubble";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TARS — Design Prototype",
  description: "Design review prototype for TARS Mission Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PrototypeProvider>
            {children}
            <TarsAgentBubble />
          </PrototypeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
