import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DichThuat — Translation Workbench",
  description: "Buddhist Chinese to Vietnamese translation workbench",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
