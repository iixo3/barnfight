import React from "react";
import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";

type SkeletonDiscoveryGameCardProps = {};

const SkeletonDiscoveryGameCard: React.FC<
  SkeletonDiscoveryGameCardProps
> = () => {
  return (
    <div className="bg-component-main border border-component-highlight flex-wrap rounded-[20px] py-[17px] pl-9 pr-7 flex items-center justify-between gap-y-4 gap-x-2">
      <div className="flex items-center gap-x-10 text-nowrap flex-nowrap mr-14">
        <Skeleton className="h-[28px] w-[10px] rounded-md" />

        <Skeleton className="w-[216px] h-[56px] rounded-md" />
      </div>

      <div className="ml-12 grow-[4] shrink-[1] basis-[auto] flex items-center gap-4 justify-start flex-wrap lg:flex-nowrap">
        <Skeleton className="w-[180px] h-[48px] rounded-md" />
        <Skeleton className="w-[170px] h-[48px] rounded-md" />
        <Skeleton className="w-[125px] h-[48px] rounded-md" />
        <Skeleton className="w-[152px] h-[48px] rounded-md" />
        <Skeleton className="w-[66px] h-[48px] rounded-md" />
      </div>

      <div className="ml-12 overflow-x-auto no-scrollbar py-3 px-5 rounded-2xl bg-component-highlight flex items-center gap-x-2">
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
        <Skeleton className="w-[32px] h-[32px] rounded-full" />
      </div>
    </div>
  );
};
export default SkeletonDiscoveryGameCard;
