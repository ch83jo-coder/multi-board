import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

const siteName = "Panmoa";
const siteDescription = "活発で快適な交流のためのマルチボードコミュニティ。";
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  "http://localhost:3000";
const metadataBase = new URL(
  /^https?:\/\//.test(configuredSiteUrl)
    ? configuredSiteUrl
    : `https://${configuredSiteUrl}`,
);

export const metadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  icons: {
    icon: [{ url: "/favicon.jpg", type: "image/jpeg" }],
    shortcut: ["/favicon.jpg"],
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/favicon.jpg",
        width: 1536,
        height: 1024,
        alt: "Panmoaコミュニティ",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/favicon.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${hanken.variable} ${notoSansJp.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
