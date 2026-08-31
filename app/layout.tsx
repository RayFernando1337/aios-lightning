import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Anton, Inter, Martian_Mono } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import ConvexOnlyProvider from "@/components/ConvexOnlyProvider";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const missing = missingPublicEnv();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const harnessOnly =
    pathname.startsWith("/harness") &&
    process.env.NODE_ENV !== "production" &&
    Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const blocked = missing.filter((name) =>
    harnessOnly ? name !== "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" : true,
  );

  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${martian.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-ink font-sans text-paper">
        {blocked.length > 0 ? (
          <SetupNotice missing={blocked} />
        ) : missing.length > 0 ? (
          <ConvexOnlyProvider>{children}</ConvexOnlyProvider>
        ) : (
          <ClerkProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
