import type { Metadata } from "next";
import { Handjet, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/shared/providers/react-query-provider";
import { ClusterProvider } from "@/shared/providers/cluster-provider";
import { SolanaProvider } from "@/shared/providers/solana-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GameDataProvider } from "../contract/game-data-context";
import Head from "next/head";

const handjet = Handjet({ subsets: ["latin"], variable: "--font-handjet" });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});
const aeonik = localFont({
  src: [
    {
      path: "../../public/fonts/aeonik/Aeonik-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/aeonik/Aeonik-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/aeonik/Aeonik-Bold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barnfight",
  description: "Making memecoin fun again",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body
        className={`${handjet.variable} ${aeonik.variable} ${bebasNeue.variable}`}
      >
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <GameDataProvider>{children}</GameDataProvider>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
