import SwapIntro from "@/entities/swap/features/swap-intro/swap-intro";
import { Suspense } from "react";
import SkeletonSwapView from "@/entities/swap/features/swap-view/ui/skeleton-swap-view";
import SwapView from "@/entities/swap/features/swap-view/swap-view";

export default async function SwapPage() {
  return (
    <div className="mt-[50px] max-w-[1148px] pb-10 w-full mx-auto">
      <div className="flex flex-col gap-y-4">
        <SwapIntro />

        <Suspense fallback={<SkeletonSwapView />}>
          <SwapView />
        </Suspense>
      </div>
    </div>
  );
}
