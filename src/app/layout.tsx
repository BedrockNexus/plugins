import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getToken } from "@/lib/auth-server";

import "@mdxeditor/editor/style.css";
import "./globals.css";

// Same brand type as bedrocknexus.com.
const displayFont = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
});

const sansFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
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
