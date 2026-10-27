import SwapExchangeWrapper from "../../ui/swap-exchange-wrapper/swap-exchange-wrapper";
import SwapStats from "../../ui/swap-stats/swap-stats";

export default async function SwapView() {
  return (
    <div className="flex items-stretch flex-wrap gap-4 w-full">
      <SwapStats />

      <div className="flex-grow shrink basis-[360px]">
        <SwapExchangeWrapper />
      </div>
    </div>
  );
}
