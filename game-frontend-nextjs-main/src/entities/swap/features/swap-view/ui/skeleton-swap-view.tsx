import React from "react";
import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";

type SkeletonSwapViewProps = {};

const SkeletonSwapView: React.FC<SkeletonSwapViewProps> = () => {
  return (
    <div className="flex items-stretch flex-wrap gap-4 w-full p-2">
      <div className="grow-[12] shrink basis-[580px] flex flex-col gap-4">
        <Skeleton className="rounded-[20px] h-[130px] w-full" />
        <Skeleton className="rounded-[20px] w-full flex-1 basis-[400px]" />
      </div>

      <div className="flex-grow shrink basis-[360px] h-[724px]">
        <Skeleton className="rounded-[20px] w-full h-full" />
      </div>
    </div>
  );
};
export default SkeletonSwapView;
