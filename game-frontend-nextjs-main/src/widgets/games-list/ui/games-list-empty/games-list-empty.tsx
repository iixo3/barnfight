import React from "react";
import GameHistorySectionCardEmpty from "../game-history-section-card-empty/game-history-section-card-empty";

const GamesListEmpty = () => {
  const emptyGames = [
    {
      title: "Hosted by me",
      data: [
        {
          title: "Fun game",
          hosted_by_me: true,
          users: 10,
          tickets: 100,
          total_reward: 1000,
          start_date: "4d,3h,2m,1s",
          percentage: 20,
        },
      ],
    },
    {
      title: "Active tickets",
      data: [
        {
          title: "Sample Game",
          hosted_by_me: false,
          users: 10,
          tickets: 100,
          total_reward: 1000,
          start_date: "4d,3h,2m,1s",
          percentage: 30,
        },
        {
          title: "Fun game",
          hosted_by_me: false,
          users: 10,
          tickets: 100,
          total_reward: 1000,
          start_date: "4d,3h,2m,1s",
          percentage: 75,
        },
      ],
    },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-y-8 relative p-3">
      <div className="absolute top-0 left-0 z-10 w-full h-full flex flex-col text-center items-center justify-center">
        <span className="handjet-bold-24 text-white">No games yet</span>
        <span className="handjet-bold-18 text-text-secondary">
          Create or join a game to get started!
        </span>
      </div>

      {emptyGames.map((section, index) => (
        <div key={index} className="flex flex-col gap-y-4">
          <span className="handjet-bold-18 text-text-secondary uppercase blur-sm">
            {section.title}
          </span>

          {section.data.map((gameData, gameIndex) => (
            <GameHistorySectionCardEmpty game={gameData} key={gameIndex} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GamesListEmpty;
