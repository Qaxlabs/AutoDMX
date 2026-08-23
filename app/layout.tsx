import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "./_components/ThemeProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AutoDMX — Turn Instagram Comments into Conversions",
  description:
    "The self-hosted Instagram automation platform. Capture leads, deliver links, and grow sales — straight from your comments.",
  keywords: [
    "Instagram automation",
    "comment to DM",
    "lead generation",
    "AutoDMX",
    "Qaxlabs",
  ],
  openGraph: {
    title: "AutoDMX — Turn Instagram Comments into Conversions",
    description:
      "Self-hosted, open-source Instagram comment-to-DM automation by Qaxlabs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoDMX — Turn Instagram Comments into Conversions",
    description:
      "Self-hosted, open-source Instagram comment-to-DM automation by Qaxlabs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-[#fafafc] text-neutral-900 antialiased selection:bg-neutral-200 selection:text-black dark:bg-[#09090b] dark:text-neutral-100 dark:selection:bg-neutral-800 dark:selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
