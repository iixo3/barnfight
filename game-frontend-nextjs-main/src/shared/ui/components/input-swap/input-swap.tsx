import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useCallback,
  memo,
} from "react";
import { Input } from "../input/input";
import { Button } from "../button/button";
import { cn } from "@/shared/utils";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SwapSchemaType } from "@/entities/swap/ui/swap-exchange/hook/use-swap";

type InputSwapProps = {
  leftText?: string | null;
  eventLeftText?: () => void;
  type?: "ticket" | "solana";
  isAuthenticated: boolean;
};

const InputSwap = memo(
  forwardRef<HTMLInputElement, InputSwapProps>(
    (
      {
        leftText = "",
        eventLeftText = () => {},
        type = "ticket",
        isAuthenticated,
      },
      ref
    ) => {
      const { register, control } = useFormContext<SwapSchemaType>();
      const { solanaUsd, ticketsUsd, solana, tickets } = useWatch({
        control,
      });

      const inputRef = useRef<HTMLInputElement | null>(null);
      const spanRef = useRef<HTMLSpanElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const containerRefCurrent = containerRef && containerRef.current;
        const inputRefCurrent = inputRef && inputRef.current;
        const px = 40;

        if (containerRefCurrent && inputRefCurrent) {
          inputRefCurrent.style.maxWidth =
            (containerRefCurrent.clientWidth - px) / 1.8 + "px";
        }
      }, [containerRef]);

      useEffect(() => {
        if (inputRef.current && spanRef.current) {
          const value = type === "ticket" ? tickets : solana;

          spanRef.current.innerHTML = value!
            .toString()
            .replace(/\s/g, "&nbsp;");
          inputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
        }
      }, [tickets, solana, type]);

      const handleChangeTicket = useCallback(
        (
          e: React.ChangeEvent<HTMLInputElement>,
          onChange: (value: string) => void
        ) => {
          let inputValue = e.target.value;

          if (type === "ticket") {
            if (/^[0-9]*$/.test(inputValue)) {
              inputValue = inputValue.replace(/^0+(?=\d)/, "");

              if (inputValue === "") {
                inputValue = "0";
              }

              onChange(inputValue);
            }
          } else if (type === "solana") {
            if (/^[0-9]*\.?[0-9]*$/.test(inputValue)) {
              inputValue = inputValue.replace(/^0+(?=\d)/, "");

              if (inputValue === "" || inputValue === ".") {
                inputValue = "0";
              }

              onChange(inputValue);
            }
          }
        },
        []
      );

      return (
        <div
          ref={containerRef}
          className="bg-component-highlight rounded-[20px] h-[77px] flex justify-end items-center px-5"
        >
          <div className={cn("flex flex-col justify-end gap-y-1.5")}>
            <div className="flex items-center gap-x-2 justify-end">
              {leftText && eventLeftText && (
                <Button
                  type="button"
                  onClick={eventLeftText}
                  variant="outline_secondary"
                  size="xxs"
                >
                  {leftText}
                </Button>
              )}
              <div className="relative">
                <span
                  ref={spanRef}
                  className="handjet-bold-20 text-white absolute opacity-0 whitespace-pre"
                ></span>

                <Controller
                  control={control}
                  name={type === "ticket" ? "tickets" : "solana"}
                  render={({ field: { onChange, value, ref } }) => {
                    return (
                      <Input
                        disabled={!isAuthenticated}
                        ref={(node) => {
                          ref(node);
                          inputRef.current = node;
                        }}
                        onChange={
                          isAuthenticated
                            ? (e) => handleChangeTicket(e, onChange)
                            : () => {}
                        }
                        value={isAuthenticated ? value : "0.0"}
                        variant="swap"
                        maxLength={20}
                        size="swap"
                        className="px-0 min-w-[1.1em] bg-transparent"
                      />
                    );
                  }}
                />
              </div>
            </div>

            <span className="aeonik-light-13 text-text-secondary text-right">
              {Number(type === "ticket" ? ticketsUsd : solanaUsd).toFixed(2)}$
            </span>
          </div>
        </div>
      );
    }
  )
);

InputSwap.displayName = "InputSwap";

export default InputSwap;
