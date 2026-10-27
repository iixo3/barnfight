import React from "react";

type GamePageProps = {};

const GamePage: React.FC<GamePageProps> = () => {
  return (
    <>
      {/* <Suspense fallback={<></>}>
        <SidebarTrigger />
      </Suspense> */}

      <div className="min-h-screen h-full lg-game:h-view lg-game:min-h-[initial] relative w-full flex-grow flex">
        <div className="grow overflow-hidden relative flex w-full mb-4">
          <div className="flex [align-items:start] h-full w-full gap-5">
            {/* <Sidebar /> */}

            {/* v1  */}
            {/* <div className="[align-items:start] h-full grid w-full gap-5 flex-1 grid-cols-18 grid-rows-2">
              <section className="container-view-game row-span-1 col-span-6">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPurchaseStake />}>
                    <PurchaseStake />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game  row-span-1 col-span-7">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonStreaming />}>
                    <Streaming />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game row-span-2 row-start-2 col-span-7">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonBattle />}>
                    <BattleRoyal />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game row-span-2 row-start-2 col-span-6">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPrizeFormat />}>
                    <PrizeFormat />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game row-span-3 col-span-5">
                <div className="content-view-game">
                  <div className="bg-component-main h-full w-full rounded-xl"></div>
                </div>
              </section>
            </div> */}

            {/* v2 */}
            {/* <div className="[align-items:start] h-full grid w-full gap-5 flex-1 sm-area md-game:md-area lg-game:grid-cols-18 lg-game:grid-rows-2">
              <section className="container-view-game [grid-area:purchase] lg-game:row-span-1 lg-game:col-span-6">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPurchaseStake />}>
                    <PurchaseStake />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:streaming] lg-game:row-span-1 lg-game:col-span-7">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonStreaming />}>
                    <Streaming />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:battle] lg-game:row-span-2 lg-game:row-start-2 lg-game:col-span-7">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonBattle />}>
                    <BattleRoyal />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:prize] lg-game:row-span-2 lg-game:row-start-2 lg-game:col-span-6">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPrizeFormat />}>
                    <PrizeFormat />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:chat] lg-game:row-span-3 lg-game:col-span-5">
                <div className="content-view-game">
                  <div className="bg-component-main h-full w-full rounded-xl"></div>
                </div>
              </section>
            </div> */}

            {/* 3v */}
            {/* <div className="ml-5 [align-items:start] h-full grid w-full gap-5 flex-1 sm-area md-game:md-cols md-game:md-area lg-game:lg-area lg-game:lg-cols">
              <section className="container-view-game [grid-area:purchase] ">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPurchaseStake />}>
                    <PurchaseStake />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:streaming]">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonStreaming />}>
                    <Streaming />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:battle] ">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonBattle />}>
                    <BattleRoyal />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:prize]">
                <div className="content-view-game">
                  <Suspense fallback={<SkeletonPrizeFormat />}>
                    <PrizeFormat />
                  </Suspense>
                </div>
              </section>

              <section className="container-view-game [grid-area:chat]">
                <div className="content-view-game">
                  <div className="bg-component-main h-full w-full rounded-xl"></div>
                </div>
              </section>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default GamePage;
