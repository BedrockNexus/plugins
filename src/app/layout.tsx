import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getToken } from "@/lib/auth-server";

import "@mdxeditor/editor/style.css";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
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
  const initialToken = await getToken();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="isolate min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers initialToken={initialToken}>{children}</Providers>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
