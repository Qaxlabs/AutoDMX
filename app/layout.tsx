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

const SITE_URL = "https://autodmx.netlify.app";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AutoDMX — Turn Instagram Comments into Conversions",
    template: "%s · AutoDMX",
  },
  description:
    "Self-hosted, open-source Instagram comment-to-DM automation. Capture leads, deliver links, and grow sales straight from your comments. Built by Qaxlabs.",
  keywords: [
    "Instagram automation",
    "Instagram DM bot",
    "comment to DM",
    "comment-to-DM",
    "Instagram comment automation",
    "lead generation",
    "Instagram marketing tool",
    "Instagram auto reply",
    "open source",
    "self-hosted",
    "Next.js",
    "Supabase",
    "Meta Graph API",
    "AutoDMX",
    "Qaxlabs",
  ],
  authors: [{ name: "Qaxlabs", url: "https://github.com/Qaxlabs" }],
  creator: "Qaxlabs",
  publisher: "Qaxlabs",
  applicationName: "AutoDMX",
  category: "Developer Tools",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AutoDMX",
    title: "AutoDMX — Turn Instagram Comments into Conversions",
    description:
      "Self-hosted, open-source Instagram comment-to-DM automation. Capture leads, deliver links, and grow sales straight from your comments.",
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: "AutoDMX — Instagram comment-to-DM automation" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoDMX — Turn Instagram Comments into Conversions",
    description:
      "Self-hosted, open-source Instagram comment-to-DM automation. Capture leads and grow sales straight from your comments.",
    images: [OG_IMAGE],
    creator: "@qaxlabs",
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
