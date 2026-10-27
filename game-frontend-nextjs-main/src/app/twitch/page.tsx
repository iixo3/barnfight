import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
import React, { Suspense } from "react";

export const runtime = 'edge';
type RoomPageProps = {};
const TwitchPage: React.FC<RoomPageProps> = async () => {
  const gameSnapshot = await adminGetDocument(`game/${process.env.TWITCH_DEMO_GAME_ID}`, {});
  console.log("game not found from here", gameSnapshot);
  return (
    <div className="flex items-stretch w-full gap-5 flex-wrap">
    </div>
  );
};

export default TwitchPage;
