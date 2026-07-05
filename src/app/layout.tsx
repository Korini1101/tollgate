import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tollgate.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tollgate",
    template: "%s · Tollgate",
  },
  description:
    "Pay-per-inference AI on Arc. Send 0.01 USDC, get an answer, every payment verified on-chain.",
  keywords: ["Arc", "USDC", "AI agent", "pay-per-inference", "stablecoin", "Circle"],
  openGraph: {
    title: "Tollgate",
    description:
      "Pay-per-inference AI on Arc. Send 0.01 USDC, get an answer, every payment verified on-chain.",
    type: "website",
    url: SITE_URL,
    siteName: "Tollgate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tollgate, AI answers paid per query in USDC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tollgate",
    description:
      "Pay-per-inference AI on Arc. Send 0.01 USDC, get an answer, verified on-chain.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
