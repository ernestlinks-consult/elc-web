import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ErnestLinks Consult",
  description: "New site in progress",
};

// Lets the phone bar reach the iOS safe area.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased max-phone:scroll-pb-24`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
