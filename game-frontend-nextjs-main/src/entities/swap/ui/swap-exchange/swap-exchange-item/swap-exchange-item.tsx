import Icon from "@/shared/ui/components/icon/icon";
import InputSwap from "@/shared/ui/components/input-swap/input-swap";
import { cn } from "@/shared/utils";
import React from "react";

type SwapExchangeItemProps = {
  type: "ticket" | "solana";
  isSwapped: boolean;
  balance: number | string;
  onMax: () => void;
  isAuthenticated: boolean;
};

const SwapExchangeItem: React.FC<SwapExchangeItemProps> = ({
  isAuthenticated,
  type = "ticket",
  isSwapped,
  balance,
  onMax,
}) => {
  return (
    <div
      className={cn(
        `relative transition-all duration-300 left-0 ease-in-out`,
        type === "solana"
          ? isSwapped
            ? "top-0"
            : "top-[62%]"
          : isSwapped
          ? "bottom-0"
          : "bottom-[62%]"
      )}
    >
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="rounded-full w-6 h-6 flex items-center justify-center bg-background">
              <Icon
                icon={type === "ticket" ? "ticket-fill" : "solana-body"}
                className={cn(type === "ticket" && "fill-white")}
                width={type === "ticket" ? 14 : 14}
                height={type === "ticket" ? 14 : 14}
              />
            </div>
            <span className="handjet-bold-20 text-white uppercase flex-1">
              {type === "ticket" ? "VOTES" : "SOL"}
            </span>
          </div>

          <span className="handjet-bold-13 text-text-secondary">
            Balance: {balance} {type === "ticket" ? "VOTES" : "SOL"}
          </span>
        </div>

        <InputSwap
          leftText={
            type === "solana"
              ? isSwapped
                ? "MAX"
                : null
              : !isSwapped
              ? "MAX"
              : null
          }
          type={type}
          eventLeftText={isAuthenticated ? onMax : () => {}}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};
export default React.memo(SwapExchangeItem);
