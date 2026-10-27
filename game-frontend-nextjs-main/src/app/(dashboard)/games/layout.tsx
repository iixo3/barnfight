"use client";

import { Button } from "@/shared/ui/components/button/button";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { connected } = useWallet();

  return (
    <div className="w-full h-full min-h-view flex-grow pb-5">
      <div className="flex w-full flex-col items-center justify-center gap-y-5 mt-10">
        <div className="flex items-center justify-center flex-wrap gap-x-5">
          <Button
            asChild
            className="text-[28px]"
            size="link"
            variant={
              pathname === "/games/popular" ? "link_action" : "link_ghosted"
            }
          >
            <Link href="/games/popular">Popular Games</Link>
          </Button>

          {connected ? (
            <Button
              asChild
              className="text-[28px]"
              size="link"
              variant={
                pathname === "/games/history" ? "link_action" : "link_ghosted"
              }
            >
              <Link href="/games/history">History</Link>
            </Button>
          ) : null}

          {connected ? (
            <Button
              asChild
              className="text-[28px]"
              size="link"
              variant={
                pathname === "/games/hosted" ? "link_action" : "link_ghosted"
              }
            >
              <Link href="/games/hosted">Hosted Games</Link>
            </Button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
