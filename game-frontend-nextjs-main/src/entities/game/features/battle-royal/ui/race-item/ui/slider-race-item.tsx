import { useGetTokenPrice } from "@/shared/hooks/game/use-get-token-price";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip/tooltip";
import { cn } from "@/shared/utils";
import { motion } from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type SliderRaceItemProps = {
  value: number;
  max: number;
  avatar_url: string;
  place_winner: boolean;
  token_address: string;
  identifyToken: {
    label: string;
    value: string;
  };
  symbol: string;
  gameDetails: {
    prizePool: number;
    winners: number[];
  };
};

const SliderRaceItem: React.FC<SliderRaceItemProps> = ({
  value = 0,
  max = 100,
  avatar_url,
  place_winner,
  identifyToken,
  token_address,
  symbol,
  gameDetails,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percent = convertValueToPercentage(value, 0, max);
  const { data: dataTokenPrice, isPending: isPendingTokenPrice } =
    useGetTokenPrice(token_address);

  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (avatarRef.current) {
      const handleTouchStart = () => {
        setShowTooltip(true);
      };

      const handleTouchEnd = () => {
        setShowTooltip(false);
      };

      avatarRef.current.addEventListener("touchstart", handleTouchStart);
      avatarRef.current.addEventListener("touchend", handleTouchEnd);

      return () => {
        if (avatarRef.current) {
          avatarRef.current.removeEventListener("touchstart", handleTouchStart);
          avatarRef.current.removeEventListener("touchend", handleTouchEnd);
        }
      };
    }
  }, []);

  const percentage_winner = useMemo(() => {
    return place_winner ? percent : 0;
  }, [place_winner, percent]);

  const calculateImpact = useCallback(
    (solAmount: number, impactPoints: { amount: number; impact: number }[]) => {
      let impactPoint;

      if (!impactPoints.length) return 0;

      if (solAmount <= impactPoints[0].amount) {
        impactPoint = (
          (solAmount / impactPoints[0].amount) *
          impactPoints[0].impact
        ).toFixed(2);
      } else if (solAmount >= impactPoints[impactPoints.length - 1].amount) {
        impactPoint = impactPoints[impactPoints.length - 1].impact.toFixed(2);
      } else {
        for (let i = 0; i < impactPoints.length; i++) {
          if (
            solAmount >= impactPoints[i].amount &&
            solAmount <= impactPoints[i + 1].amount
          ) {
            const lowerPoint = impactPoints[i];
            const upperPoint = impactPoints[i + 1];

            impactPoint = (
              lowerPoint.impact +
              (solAmount - lowerPoint.amount) *
                ((upperPoint.impact - lowerPoint.impact) /
                  (upperPoint.amount - lowerPoint.amount))
            ).toFixed(2);

            break;
          }
        }
      }

      return `${(Number(impactPoint) * 100).toFixed(2)}%`;
    },
    []
  );

  // TODO: get real data
  const toBuyTokens = useMemo(() => {
    if (!gameDetails)
      return {
        tokenPrice: "-",
        impact: "-",
      };
    if (!dataTokenPrice || isPendingTokenPrice)
      return {
        tokenPrice: "-",
        impact: "-",
      };

    const { prizePool, winners } = gameDetails;

    if (!prizePool) {
      return {
        tokenPrice: "-",
        impact: "-",
      };
    }

    const prizePoolSplited = prizePool / (winners?.length ?? 1);

    const formatPoints = Object.keys(dataTokenPrice?.impactBuyPoints ?? {}).map(
      (key) => ({
        amount: Number(key),
        impact: Number(dataTokenPrice?.impactBuyPoints[key]),
      })
    );

    return {
      tokenPrice: ((dataTokenPrice?.price ?? 0) / prizePoolSplited).toFixed(3),
      impact: calculateImpact(prizePoolSplited, formatPoints),
    };
  }, [gameDetails, dataTokenPrice, isPendingTokenPrice]);

  return (
    <TooltipProvider disableHoverableContent={true} delayDuration={0}>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <div ref={avatarRef} className="relative h-8 ">
            <div
              className={cn(
                "no-select h-full w-full z-10 absolute top-0 left-0 items-center gap-x-3",
                showTooltip ? "flex" : "hidden"
              )}
            >
              {useMemo(
                () => (
                  <Avatar className="w-8 h-8 flex-shrink-0 no-select">
                    <AvatarImage src={avatar_url} />
                    <AvatarFallback>
                      <PlaceholderAvatar />
                    </AvatarFallback>
                  </Avatar>
                ),
                [avatar_url]
              )}

              <div className="bg-component-highlight rounded-xl py-1.5 px-2 md:px-4 w-full">
                <span className="handjet-bold-13 md:handjet-bold-16 uppercase block md:hidden">
                  <span className="text-text-secondary">Symbol: </span>
                  <span className="bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 text-transparent bg-clip-text">
                    {symbol}
                  </span>
                </span>

                <span className="handjet-bold-16 uppercase hidden md:block">
                  <span className="text-text-secondary">
                    TO BUY {toBuyTokens?.tokenPrice ?? "-"} {symbol} FOR
                  </span>{" "}
                  <span className="bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2 bg-clip-text text-transparent">
                    +{toBuyTokens?.impact ?? "-"} PRICE IMPACT
                  </span>
                </span>
              </div>
            </div>

            <span
              className={cn(
                "select-none touch-none items-center w-full flex relative top-1/2 -translate-y-1/2",
                showTooltip ? "invisible" : "visible"
              )}
            >
              <span className="rounded-full overflow-hidden grow w-full h-3 relative bg-component-highlight">
                <motion.span
                  animate={{
                    right: `${percentage_winner}%`,
                    width: `calc(${percentage_winner}% - 0%)`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="left-0 opacity-30 bg-gradient-to-br from-brand-gradient-red-1 to-brand-gradient-red-2 h-full absolute"
                ></motion.span>
              </span>

              <motion.span
                animate={{
                  left: `${percent}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="transform -translate-x-1/2 absolute"
              >
                <span className="transition-colors">
                  {useMemo(
                    () => (
                      <Avatar className="w-8 h-8 flex-shrink-0 no-select">
                        <AvatarImage src={avatar_url} />
                        <AvatarFallback>
                          <PlaceholderAvatar />
                        </AvatarFallback>
                      </Avatar>
                    ),
                    [avatar_url]
                  )}
                </span>
              </motion.span>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent withArrow={false} sideOffset={10}>
          <span className="no-select uppercase">
            <span className="text-text-secondary uppercase">
              {identifyToken.label}
            </span>{" "}
            {identifyToken.label === "Token address:"
              ? identifyToken.value.slice(0, 8) +
                "..." +
                identifyToken.value.slice(-4)
              : identifyToken.value}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default SliderRaceItem;

function convertValueToPercentage(value: number, min: number, max: number) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return Math.min(100, Math.max(0, percentage));
}
