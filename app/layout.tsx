import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Feyris — Your Unified Media Universe",
  description:
    "Track everything you watch, play, and read in one place. Cross-medium recommendations, library management, and Spotify Wrapped-style insights.",
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

