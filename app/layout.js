import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090d16",
};

export const metadata = {
  title: "घुम्मकड़ साथी — AI Travel & Roadtrip Planner",
  description: "Plan authentic Indian roadtrips, highway dhabas, heritage routes, and personalized travel itineraries powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
