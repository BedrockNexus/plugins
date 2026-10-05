import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getToken } from "@/lib/auth-server";

import "@mdxeditor/editor/style.css";
import "./globals.css";

// Brand type, self-hosted (no network fetch at build time): Chakra Petch for
// display, IBM Plex Sans for text, JetBrains Mono for addresses and numbers.
// Licensed under the SIL Open Font License; see the OFL-*.txt files.
const displayFont = localFont({
  src: [
    { path: "./fonts/chakra-petch-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/chakra-petch-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/chakra-petch-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-family",
  display: "swap",
});

const sansFont = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans-family",
  display: "swap",
});

const monoFont = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-mono-family",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plugins.bedrocknexus.com"),
  title: {
    default: "BedrockNexus Plugins",
    template: "%s · BedrockNexus Plugins",
  },
  description:
    "A GitHub-powered publishing and discovery platform for every Minecraft Bedrock server software.",
  applicationName: "BedrockNexus Plugins",
  keywords: [
    "Minecraft Bedrock",
    "server plugins",
    "PocketMine-MP",
    "PowerNukkitX",
    "GitHub releases",
  ],
  authors: [{ name: "BedrockNexus" }],
  creator: "BedrockNexus",
  publisher: "BedrockNexus",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BedrockNexus Plugins",
    title: "BedrockNexus Plugins",
    description: "Plugins for every Minecraft Bedrock server software.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BedrockNexus Plugins",
    description: "Plugins for every Minecraft Bedrock server software.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialToken, requestHeaders] = await Promise.all([getToken(), headers()]);
  // Set by src/proxy.ts; lets the next-themes inline script run under the CSP.
  const nonce = requestHeaders.get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="isolate min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            nonce={nonce}
          >
            <Providers initialToken={initialToken}>{children}</Providers>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
