import React, { useEffect, useRef } from "react";
import { useInfiniteHits, UseInfiniteHitsProps } from "react-instantsearch";
import Hit from "./Hit";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import { ExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";

const InfiniteScroll: React.FC<
  UseInfiniteHitsProps<any> & {
    type: "history" | "popular" | "hosted";
    exchangeRates: ExchangeRates;
  }
> = (props) => {
  const { items, isLastPage, showMore } = useInfiniteHits(props);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (sentinelRef.current !== null) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLastPage) {
            showMore();
          }
        });
      });

      observer.observe(sentinelRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [isLastPage, showMore]);

  return (
    <div className="w-full [&>ol]:flex [&>ol]:flex-col [&>ol]:gap-y-3">
      <ol className="ais-InfiniteHits-list">
        {items.map((hit) => (
          <li key={hit.objectID} className="ais-InfiniteHits-item">
            <Hit
              hit={hit}
              type={props.type}
              exchangeRates={props.exchangeRates}
            />
          </li>
        ))}

        <li
          ref={sentinelRef}
          className={cn(
            "flex items-center justify-center py-2.5",
            isLastPage && "hidden"
          )}
        >
          <Loader size={40} strokeWidth={3} />
        </li>
      </ol>
    </div>
  );
};
export default InfiniteScroll;
