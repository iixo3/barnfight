import React from "react";

type RoomPageProps = {};

const RoomPage: React.FC<RoomPageProps> = () => {
  return (
    <div className="w-full gap-5 min-h-view h-full flex items-stretch">
      {/* <Sidebar /> */}

      <div className="grid gap-4 grid-cols-[1fr_26%] w-full">
        <div className="grid grid-rows-2.5 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-[43.5%_1fr] gap-4">
            {/* <Suspense fallback={<SkeletonPurchaseStake />}>
              <PurchaseStake />
            </Suspense>

            <Suspense fallback={<SkeletonStreaming />}>
              <Streaming />
            </Suspense>
          </div>

          <div className="grid grid-rows-[minmax(max-content,1fr)] grid-cols-1 md:grid-cols-[1fr_43.5%] gap-4">
            <Suspense fallback={<SkeletonBattle />}>
              <BattleRoyal />
            </Suspense>

            <Suspense fallback={<SkeletonPrizeFormat />}>
              <PrizeFormat />
            </Suspense> */}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">Chat</div>
      </div>
    </div>
  );
};
export default RoomPage;
