import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import React from "react";

type SkeletonPurchaseStakeProps = {};

const SkeletonPurchaseStake: React.FC<SkeletonPurchaseStakeProps> = () => {
  return <Skeleton className="rounded-xl h-full w-full" />;
};
export default SkeletonPurchaseStake;
