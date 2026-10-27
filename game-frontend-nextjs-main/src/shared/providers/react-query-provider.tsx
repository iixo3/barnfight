"use client";

import React, { ReactNode, useState } from "react";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getQueryClient } from "../utils/get-query-client";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
