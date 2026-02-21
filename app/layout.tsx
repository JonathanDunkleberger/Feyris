import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import type { Metadata } from "next";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Feyris — Your Universal Media Library",
    template: "%s | Feyris",
  },
  description:
    "Track anime, games, books, films, and TV in one place. Rate, review, and discover your next obsession.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Feyris",
    title: "Feyris — Your Universal Media Library",
    description:
      "Track anime, games, books, films, and TV in one place.",
    images: [{ url: "/feyris-cat-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "Feyris — Your Universal Media Library",
    description:
      "Track anime, games, books, films, and TV in one place.",
    images: ["/feyris-cat-512.png"],
  },
  other: {
    "msapplication-TileColor": "#0a0a0f",
    "msapplication-TileImage": "/feyris-cat-512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#c8a44e",
          colorBackground: "#0e0e14",
          colorText: "#f0ebe0",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${jakarta.className} bg-fey-black text-cream min-h-screen antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

