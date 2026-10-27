import { cn } from "@/shared/utils";
import React from "react";

type LoaderProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const Loader: React.FC<LoaderProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
}) => {
  return (
    <div
      style={{
        width: size + "px",
        height: size + "px",
        borderWidth: strokeWidth + "px",
      }}
      className={cn(
        `border-text-secondary border-t-transparent rounded-full animate-spin`,
        className
      )}
    />
  );
};
export default Loader;
