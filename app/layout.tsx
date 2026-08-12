import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Anton, Inter, Martian_Mono } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import SetupNotice from "@/components/SetupNotice";
import { missingPublicEnv } from "@/lib/env";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AiOS SF · Lightning",
  description:
    "Lightning demos at Convex HQ. Eight slots, two to three minutes each, working software only.",
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const missing = missingPublicEnv();

  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${martian.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-ink font-sans text-paper">
        {missing.length > 0 ? (
          <SetupNotice missing={missing} />
        ) : (
          <ClerkProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
