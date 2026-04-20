import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GlobalLoader from "@/components/GlobalLoader";
import CartSummary from "@/components/CartSummary";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Orderlete — Premium Cakes & Medical Delivery",
  description: "Experience lightning-fast delivery of artisanal cakes and medical essentials. Order now for 15-minute delivery.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import SimulatedSMS from "@/components/SimulatedSMS";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased noise-bg`}
      >
        <GlobalLoader>
          <main className="min-h-screen pb-24">
            {children}
          </main>
          <CartSummary />
          <BottomNav />
          <SimulatedSMS />
        </GlobalLoader>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '20px',
              background: '#1a1a2e',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              padding: '14px 20px',
              boxShadow: '0 20px 40px -8px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: {
                primary: '#e8590c',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
