import {
  Game,
  GameHistoryHook,
  GamesHistory,
} from "@/shared/types/games/games";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

interface UseSectionGamesListParam {
  games: Game[];
}

type UseSectionGamesListReturn = {
  title: string;
  data: GameHistoryHook[];
}[];

export const useSectionGamesList = ({
  games,
}: UseSectionGamesListParam): UseSectionGamesListReturn => {
  const { game: gameId } = useParams();

  const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  const filterStartedGames = (start_date: GamesHistory["start_date"]) =>
    start_date <= currentTimestamp;

  const hostedByMe = {
    title: "Hosted by me",
    data: games
      .filter(
              //@ts-ignore
        (game) => game?.hosted_by_me && filterStartedGames(game.start_date)
      )
      .map((game) => ({
        ...game,
        isActive: game.id === gameId,
      })),
  };

  const activeTickets = {
    title: "Active tickets",
    data: games
      .filter(
              //@ts-ignore
        (game) => !game?.hosted_by_me && filterStartedGames(game.start_date)
      )
      .map((game) => ({
        ...game,
        isActive: game.id === gameId,
      })),
  };

  const result: UseSectionGamesListReturn = [];
  if (hostedByMe.data?.length > 0) result.push(hostedByMe);
  if (activeTickets.data?.length > 0) result.push(activeTickets);

  return result;
};
