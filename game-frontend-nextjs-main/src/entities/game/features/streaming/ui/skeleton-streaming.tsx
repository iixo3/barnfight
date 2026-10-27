import { Skeleton } from "@/shared/ui/components/skeleton/skeleton";
import React from "react";

type SkeletonStreamingProps = {};

const SkeletonStreaming: React.FC<SkeletonStreamingProps> = () => {
  return <Skeleton className="rounded-xl w-full h-full"></Skeleton>;
};
export default SkeletonStreaming;
