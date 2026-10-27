import React from "react";
import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";

type SkeletonPrizeFormatProps = {};

const SkeletonPrizeFormat: React.FC<SkeletonPrizeFormatProps> = () => {
  return <Skeleton className="w-full h-full rounded-xl"></Skeleton>;
};
export default SkeletonPrizeFormat;
