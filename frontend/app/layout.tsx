import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSeasons } from "@/lib/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "APEX | 한국 F1 팬 사이트",
  description:
    "한국 F1 팬들을 위한 커뮤니티 - 최신 레이스 결과, 드라이버 순위, 컨스트럭터 챔피언십",
  keywords: ["F1", "포뮬러 원", "한국", "Formula 1", "레이싱", "APEX"],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let seasons: number[] = [];
  try {
    const data = await getSeasons();
    seasons = data.seasons;
  } catch {
    // API unavailable — fallback
  }

  const latestYear = seasons[0] ?? new Date().getFullYear();

  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header seasons={seasons} latestYear={latestYear} />
        <main className="flex-1">{children}</main>
        <Footer latestYear={latestYear} />
        <Analytics />
      </body>
    </html>
  );
}
