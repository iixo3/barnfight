import {
  Game,
  GameHistoryHook,
  GamesHistory,
} from "@/shared/types/games/games";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import TimeRemaining from "@/shared/ui/components/time-remaining/time-remaining";
import { formatPrice } from "@/shared/utils/format-price";
import React, { useCallback, useMemo } from "react";
import GameHistorySectionCardBar from "./game-history-section-card-bar";
import { cn } from "@/shared/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGetGameParticipationsToken } from "@/shared/hooks/game/use-get-game-participations";

type GameHistorySectionCardProps = {
  game: GameHistoryHook;
  handleGameSettings: (game: GameHistoryHook) => void;
};

const GameHistorySectionCard: React.FC<GameHistorySectionCardProps> = ({
  game,
  handleGameSettings,
}) => {
  const pathname = usePathname();
  const tokensList = useMemo(
    () => game?.tokens.map((token: Game["tokens"][0]) => token.token_address),
    [game]
  );
  const { data: participationsGameData, isLoading: participationsGameLoading } =
    useGetGameParticipationsToken(game?.id ?? "", tokensList);

  const usersRegistered = useMemo(() => {
    if (!participationsGameData || participationsGameLoading) return 0;

    return new Set([...Object.values(participationsGameData).flat()]).size;
  }, [participationsGameData, participationsGameLoading]);

  const isActive = useMemo(() => {
    if (!pathname || !game.id) return false;

    const getIdParams = pathname.split("/")[2];

    return getIdParams === game.id;
  }, [pathname, game.id]);

  const handleEventSettings = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      handleGameSettings(game);
    },
    [game, handleGameSettings]
  );

  const handleEventCopy = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const url = `${window.location.origin}/games/${game.id}`;

      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("Game link copied to clipboard");
        })
        .catch((err) => {
          toast.error("Failed to copy game link");
        });
    },
    [game]
  );

  return (
    <Link
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      href={`/games/${game.id}`}
      className={cn(
        "border cursor-pointer hover:bg-component-highlight transition-all duration-300 rounded-[10px] pt-3 pl-3 pr-4 pb-[25px] flex flex-col gap-y-3",
        isActive ? "border-white" : "border-component-highlight"
      )}
    >
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <span
            className={cn(
              "handjet-bold-18 truncate",
              isActive ? "text-white" : "text-text-secondary"
            )}
          >
            {game?.name}
          </span>

          <div className="flex items-center">
            {
              //@ts-ignore
              game?.hosted_by_me && (
                <Button
                  variant="ghosted"
                  size="icon_padding"
                  onClick={handleEventSettings}
                >
                  <Icon
                    icon="settings"
                    width={12}
                    height={12}
                    className="fill-text-secondary group-hover:fill-white"
                  />
                </Button>
              )
            }
            <Button
              onClick={handleEventCopy}
              variant="ghosted"
              size="icon_padding"
            >
              <Icon
                icon="copy"
                width={11}
                height={13}
                className="fill-text-secondary group-hover:fill-white"
              />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-x-1.5">
          <div className="bg-component-main rounded-xl py-1 px-2">
            <span className="handjet-handjet-bold-15 text-text-offset uppercase">
              {
                //@ts-ignore
                game?.hosted_by_me ? "users" : "tickets"
              }{" "}
              -{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {
                  //@ts-ignore
                  game?.hosted_by_me ? usersRegistered : game?.tickets
                }
              </span>
            </span>
          </div>

          <div className="bg-component-main rounded-xl py-1 px-2">
            <span className="handjet-handjet-bold-15 text-text-offset uppercase">
              prize -{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
                {
                  //@ts-ignore
                  formatPrice(game?.total_reward as number)
                }
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-[5px] w-full">
        <TimeRemaining
          dateFuture={game?.end_date}
          format="DD,hh,mm,ss"
          customText={(time) => {
            return (
              <span className="handjet-bold-14 text-text-secondary">{`Time left - ${time}`}</span>
            );
          }}
          completedView={
            <span className="handjet-bold-14 text-text-secondary">
              Game ended
            </span>
          }
        />

        <GameHistorySectionCardBar
          start_date={game?.start_date}
          end_date={game?.end_date}
        />
      </div>
    </Link>
  );
};
export default GameHistorySectionCard;
