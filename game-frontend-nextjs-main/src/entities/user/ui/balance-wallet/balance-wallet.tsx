"use client";
import React from "react";
import { useGetUserBalance } from "../../../../shared/hooks/user/use-get-user-balance";
import Icon from "@/shared/ui/components/icon/icon";

type BalanceWalletProps = {};

const BalanceWallet: React.FC<BalanceWalletProps> = () => {
  const balances = useGetUserBalance();

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-x-5">
      <div className="flex gap-x-[7px] items-center">
        <Icon icon="wallet" width={16} height={14} color="white" />
        <span className="text-white handjet-bold-18">{balances.solana}</span>
      </div>
      <div className="flex gap-x-[7px] items-center">
        <Icon icon="ticket-fill" width={16} height={16} color="white" />
        <span className="text-white handjet-bold-18">{balances.tickets}</span>
      </div>
    </div>
  );
};
export default BalanceWallet;
