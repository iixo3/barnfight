import React from "react";
import { IconProps } from "./icon.types";
import IconsList from "./icons-list";
import { cn } from "@/shared/utils";

const Icon: React.FC<IconProps> = ({
  icon = "plus",
  width = 10,
  height = 10,
  ...rest
}) => {
  const _iconPropsComponent = {
    ...rest,
    width: width,
    height: height,
    className: cn("fill-white duration-300", rest.className),
  };

  const IconComponent = !!icon && IconsList[icon as keyof typeof IconsList];

  return <IconComponent {..._iconPropsComponent} />;
};

export default Icon;
