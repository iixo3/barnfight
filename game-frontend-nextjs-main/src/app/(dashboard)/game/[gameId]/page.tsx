import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
import BattleRoyal from "@/entities/game/features/battle-royal/battle-royal";
import SkeletonBattle from "@/entities/game/features/battle-royal/ui/skeleton-battle";
import PrizeFormat from "@/entities/game/features/prize-format/prize-format";
import SkeletonPrizeFormat from "@/entities/game/features/prize-format/ui/skeleton-prize-format";
import PurchaseStake from "@/entities/game/features/purchase-stake/purchase-stake";
import SkeletonPurchaseStake from "@/entities/game/features/purchase-stake/ui/skeleton-purchase-stake";
import SidebarTrigger from "@/entities/game/features/sidebar/ui/sidebar-trigger/sidebar-trigger";
import Streaming from "@/entities/game/features/streaming/streaming";
import SkeletonStreaming from "@/entities/game/features/streaming/ui/skeleton-streaming";
import { getQueryClient } from "@/shared/utils/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Chat from "@/entities/game/features/chat/chat";
import SkeletonChat from "@/entities/game/features/chat/ui/skeleton-chat";
import ConfettiWrapper from "@/widgets/layouts/confetti-wrapper/confetti-wrapper";

// export const revalidate = 60;
// export const dynamic = "force-static";
// export const dynamicParams = true;

// export async function generateStaticParams() {
//   const games_from_db = [1, 2, 3, 4];

//   return games_from_db.map((game) => ({ game }));
// }

async function fetchGameWithRetry(gameId: string, retries = 10, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    const game = await adminGetDocument(`game/${gameId}`, {});
    if (game) return game;
    await new Promise((resolve) => setTimeout(resolve, delay));
    attempt++;
  }
  return null;
}

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const queryClient = getQueryClient();

  const game = await fetchGameWithRetry(params.gameId);

  if (!game) {
    return notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: ["game", params.gameId],
    queryFn: () => ({ ...game.fields, fromServer: true }),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <ConfettiWrapper />

      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={<></>}>
          <SidebarTrigger />
        </Suspense>

        <div className="min-h-screen h-full lg-game:h-view lg-game:min-h-[initial] relative w-full flex-grow flex">
          <div className="grow overflow-hidden relative flex w-full mb-4">
            <div className="flex [align-items:start] h-full w-full gap-5">
              <div className="grid-rows-none lg-game:grid-rows-2 md-game:ml-5 [align-items:start] h-full grid w-full gap-5 flex-1 sm-area md-game:md-cols md-game:md-area lg-game:lg-area lg-game:lg-cols">
                <section className="container-view-game [grid-area:purchase] ">
                  <div className="content-view-game">
                    <Suspense fallback={<SkeletonPurchaseStake />}>
                      <PurchaseStake game={params.gameId} />
                    </Suspense>
                  </div>
                </section>

                <section className="container-view-game [grid-area:streaming]">
                  <div className="content-view-game">
                    <Suspense fallback={<SkeletonStreaming />}>
                      <Streaming game={params.gameId} />
                    </Suspense>
                  </div>
                </section>

                <section className="container-view-game [grid-area:battle] ">
                  <div className="content-view-game">
                    <Suspense fallback={<SkeletonBattle />}>
                      <BattleRoyal game={params.gameId} />
                    </Suspense>
                  </div>
                </section>

                <section className="container-view-game [grid-area:prize]">
                  <div className="content-view-game">
                    <Suspense fallback={<SkeletonPrizeFormat />}>
                      <PrizeFormat game={params.gameId} />
                    </Suspense>
                  </div>
                </section>

                <section className="container-view-game [grid-area:chat]">
                  <div className="content-view-game min-h-[85vh]">
                    <Suspense fallback={<SkeletonChat />}>
                      <Chat game={params.gameId} />
                    </Suspense>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </HydrationBoundary>
    </>
  );
}
