
import React, { Suspense } from "react";
import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
export const runtime = 'edge';
type RoomPageProps = {};
export default async function TwitchPage({
    params,
  }: {
    params: { gameId: string };
  }) {

//   const gameSnapshot = await fetch('https://httpbin.dev/ip').then((res) => res.json());
  const gameSnapshot = await adminGetDocument(`game/${params.gameId}`, {});

  console.log("game not found from here",  gameSnapshot);
  return (
    <div className="flex items-stretch w-full gap-5 flex-wrap">
    </div>
  );
};

