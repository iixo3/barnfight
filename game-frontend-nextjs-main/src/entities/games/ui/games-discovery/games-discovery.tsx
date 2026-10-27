"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import React from "react";
import {
  Configure,
  Hits,
  InfiniteHits,
  InstantSearch,
} from "react-instantsearch";
import Hit from "./Hit";
import NoResultsBoundary from "./no-result-boundary";
import SearchInput from "./SearchInput";
import InfiniteScroll from "./infinite-scroll";
import { useExchangeRates } from "@/entities/swap/ui/swap-exchange/hook/use-exchange-rates";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ""
);

type GamesDiscoveryProps = {
  type: "history" | "popular" | "hosted";
  gameIds?: string[];
};

const GamesDiscovery: React.FC<GamesDiscoveryProps> = (props) => {
  const { publicKey, connected } = useWallet();
  const { data: exchangeRates, loading } = useExchangeRates("solana");

  const gameIds = (props.gameIds || ["NONE"])
    .map((gameId) => `id:${gameId}`)
    .join(" OR ");

  // console.log(
  //   "gameIDS",
  //   gameIds,
  //   props.type,
  //   "key",
  //   `${props.type}-${JSON.stringify(props.gameIds)}`
  // );

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX || ""}
      key={`${props.type}-${JSON.stringify(props.gameIds)}`}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <div className="flex flex-col gap-y-14 w-full items-center justify-center">
        <div className="max-w-[370px] w-full">
          <SearchInput />
        </div>

        {props.type === "hosted" ? (
          <Configure
            filters={`creator:${publicKey ? publicKey.toString() : "NOTHING"}`}
          />
        ) : null}

        {props.type == "history" ? <Configure filters={gameIds} /> : null}

        <NoResultsBoundary type={props.type}>
          <InfiniteScroll exchangeRates={exchangeRates} type={props.type} />
          {/* <Configure hitsPerPage={20} />
          <Hits
            className="w-full [&>ol]:flex [&>ol]:flex-col [&>ol]:gap-y-3"
            hitComponent={({ hit }) => <Hit type={props.type} hit={hit} />}
          /> */}
        </NoResultsBoundary>
      </div>
    </InstantSearch>
  );
};

export default GamesDiscovery;
