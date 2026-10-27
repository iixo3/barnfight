import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import React from "react";

type SkeletonNavbarMenuProps = {};

const SkeletonNavbarMenu: React.FC<SkeletonNavbarMenuProps> = () => {
  return (
    <div className="flex items-center gap-x-5">
      <Skeleton className="w-[64px] h-[28px] rounded-md lg:flex hidden" />

      <div className="bg-component-highlight w-[1px] h-[20px] lg:flex hidden"></div>

      <div className="flex items-center gap-x-2 lg:flex hidden">
        <Skeleton className="w-[38px] h-[38px] rounded-lg" />

        <Skeleton className="w-[38px] h-[38px] rounded-lg" />
      </div>

      <div className="bg-component-highlight w-[1px] h-[20px] lg:flex hidden"></div>

      <Skeleton className="w-[44px] h-[44px] rounded-full" />
    </div>
  );
};
export default SkeletonNavbarMenu;
