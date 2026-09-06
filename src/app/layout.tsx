import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendify",
  description: "College attendance for class teachers, subject teachers, and admin.",
  applicationName: "Attendify",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Attendify",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2a4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-paper font-sans text-ink" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
