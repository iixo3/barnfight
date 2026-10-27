import React from "react";
import GamesDiscovery from "../../ui/games-discovery/games-discovery";

export default async function GamesHosted() {
  //   const games = await getGames({
  //     options: { hosted: true, emptyHosted: true },
  //   });
  //   return <GamesDiscovery type="hosted" games={games} />;

  return <GamesDiscovery type="hosted" />;
}
