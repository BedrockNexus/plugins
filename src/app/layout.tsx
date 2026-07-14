import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="isolate min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
