import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { Slider } from "@/shared/ui/components/slider/slider";
import { cn } from "@/shared/utils";
import React, { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SwapSchemaType } from "../hook/use-swap";

type SwapExchangeHeaderProps = {
  isAuthenticated: boolean;
};

const SwapExchangeHeader: React.FC<SwapExchangeHeaderProps> = ({
  isAuthenticated,
}) => {
  const [openSettings, setOpenSettings] = useState(false);

  const { control } = useFormContext<SwapSchemaType>();

  const slippageValue = useWatch({
    control,
    name: "slippage",
  });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <span className="handjet-bold-24 text-white">Swap</span>
        <Button
          type="button"
          onClick={() =>
            isAuthenticated ? setOpenSettings((prev) => !prev) : {}
          }
          variant="ghosted"
          size="icon_padding"
        >
          <Icon
            icon="settings"
            width={20}
            height={20}
            className={cn(
              openSettings
                ? "fill-white"
                : "fill-text-secondary group-hover:fill-white",
              {
                "rotate-180": openSettings,
              }
            )}
          />
        </Button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          openSettings ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div
          className="flex flex-col gap-y-1.5 transform transition-transform duration-300 origin-top"
          style={{ transform: openSettings ? "scaleY(1)" : "scaleY(0)" }}
        >
          <span className="handjet-bold-14 text-text-offset">Slippage</span>
          <div className="flex items-center gap-x-3">
            <Controller
              name="slippage"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Slider
                  onValueChange={(value) => onChange(value[0])}
                  value={[value]}
                  max={5}
                  min={0.1}
                  step={0.1}
                />
              )}
            />
            <span className="handjet-bold-14 bg-clip-text text-transparent bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2">
              {slippageValue}%
            </span>
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          !openSettings ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <span
          className="handjet-bold-14 text-text-offset block transform transition-transform duration-300 origin-top"
          style={{ transform: !openSettings ? "scaleY(1)" : "scaleY(0)" }}
        >
          *VOTES is only tradable with MemeTank contracts
        </span>
      </div>
    </div>
  );
};
export default SwapExchangeHeader;
