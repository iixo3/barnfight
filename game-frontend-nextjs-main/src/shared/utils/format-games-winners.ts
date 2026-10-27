import { Game } from "../types/games/games";

export const formatWinners = (winners: Game["winners"]) => {
  if (!winners || winners.length === 0 || !Array.isArray(winners)) {
    return "-";
  }

  const concat = winners
    .map((winner) => {
      if (!winner || !Array.isArray(winner.winner_distribution)) {
        return "";
      }

      if (winner.winner_distribution[0]?.fair_distribution_all) {
        return "Split";
      }

      const count = winner.winner_distribution.reduce((sum, distribution) => {
        return sum + Number(distribution.num_winners || 0);
      }, 0);

      return count > 0 ? count.toString() : "";
    })
    .join("/");

  return concat;
};

interface FormatGamesWinnersProps {
  winners: Game["winners"];
  id: Game["id"];
}

export const formatGamesWinners = (data: FormatGamesWinnersProps[]) => {
  if (data.length === 0 || !Array.isArray(data)) {
    return {
      "": {
        places: [],
        tickets: "",
      },
    };
  }

  return data.reduce((acc, { id, winners }) => {
    if (!Array.isArray(winners)) {
      return {
        ...acc,
        [id.toString()]: {
          places: [],
          tickets: "",
        },
      };
    }

    if (winners.length === 0) {
      return {
        ...acc,
        [id.toString()]: {
          places: [],
          tickets: "",
        },
      };
    }

    const concat = winners
      .map((winner) => {
        if (!winner || !Array.isArray(winner.winner_distribution)) {
          return "";
        }

        if (winner.winner_distribution[0]?.fair_distribution_all) {
          return "Split";
        }

        const count = winner.winner_distribution.reduce((sum, distribution) => {
          return sum + Number(distribution.num_winners || 0);
        }, 0);

        return count > 0 ? count.toString() : "";
      })
      .join("/");

    const places = winners.map((winner) => winner.position);

    return {
      ...acc,
      [id.toString()]: {
        places,
        tickets: concat,
      },
    };
  }, {} as Record<string, { places: number[]; tickets: string }>);
};
