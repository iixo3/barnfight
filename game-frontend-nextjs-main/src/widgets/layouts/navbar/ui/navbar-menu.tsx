"use client";

import BalanceWallet from "@/entities/user/ui/balance-wallet/balance-wallet";
import Profile from "@/entities/user/ui/profile/profile";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import React, { useEffect, useMemo, useState } from "react";
import CreateGame from "./create-game/create-game";
import Link from "next/link";
import SignInButton from "@/entities/user/ui/authentication/sign-in-button";
import SkeletonNavbarMenu from "./skeleton-navbar-menu";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { isWalletWhitelisted } from "../actions/whitelist-wallets";
import TutorialGame from "./tutorial-game/tutorial-game";
import { useCheckAvailableTutorial } from "./tutorial-game/ui/hooks/use-check-available-tutorial";

type NavbarMenuProps = {};

const NavbarMenu: React.FC<NavbarMenuProps> = () => {
  const { isAuthenticated, isLoadingAuthentication, user } = useGetAuth();
  const { publicKey } = useWallet();
  const [isUserAllowed, setIsUserAllowed] = useState(false);

  useEffect(() => {
    const checkWalletWhitelist = async () => {
      if (!publicKey) {
        setIsUserAllowed(false);
        return;
      }

      try {
        const check = await isWalletWhitelisted(publicKey.toBase58());
        setIsUserAllowed(check);
      } catch (error) {
        setIsUserAllowed(false);
      }
    };

    checkWalletWhitelist();
  }, [publicKey]);

  if (isLoadingAuthentication) {
    return <SkeletonNavbarMenu />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-x-5">
        <TutorialGame />
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-5">
      <div className="hidden lg:flex items-center gap-x-5">
        <BalanceWallet />

        <div className="bg-component-highlight w-[1px] h-[20px]"></div>

        <div className="flex items-center gap-x-2">
          <TutorialGame />

          {isUserAllowed && <CreateGame user={user} />}

          <Button size="outer_icon" asChild variant="default_outlined">
            <Link href="/games">
              <Icon
                icon="menu1"
                className="fill-text-secondary group-hover:fill-white"
                width={20}
                height={20}
              />
            </Link>
          </Button>

          <Button size="outer_icon" variant="default_outlined" asChild>
            <Link href="/swap">
              <Icon
                icon="ticket-menu"
                className="fill-text-secondary group-hover:fill-white"
                width={24}
                height={24}
              />
            </Link>
          </Button>
        </div>

        <div className="bg-component-highlight w-[1px] h-[20px]"></div>
      </div>

      <Profile user={user} isUserAllowed={isUserAllowed} />
    </div>
  );
};
export default React.memo(NavbarMenu);
