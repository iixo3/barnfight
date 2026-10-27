import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import React from "react";

type SkeletonBattleProps = {};

const SkeletonBattle: React.FC<SkeletonBattleProps> = () => {
  return <Skeleton className="rounded-xl w-full h-full"></Skeleton>;
};
export default SkeletonBattle;
