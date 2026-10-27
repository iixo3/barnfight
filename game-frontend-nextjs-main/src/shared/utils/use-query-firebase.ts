/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
"use client";
import { useEffect, useCallback, useMemo, useState } from "react";
import {
  DocumentSnapshot,
  Unsubscribe as FirestoreUnsubscribe,
} from "@firebase/firestore";
import {
  DocumentData,
  DocumentReference,
  FirestoreError,
  onSnapshot,
  SnapshotOptions,
} from "@firebase/firestore";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  hashKey,
} from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import {
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  Query,
  QuerySnapshot,
  SnapshotListenOptions,
} from "@firebase/firestore";

export type GetSnapshotSource = "server" | "cache" | undefined;

export type GetSnapshotOptions = {
  source?: GetSnapshotSource;
};

export type UseFirestoreHookOptions =
  | ({
      subscribe: true;
    } & SnapshotListenOptions)
  | ({
      subscribe?: false;
    } & GetSnapshotOptions);

export type WithIdField<D, F = void> = F extends string
  ? D & { [key in F]: string }
  : D;

export async function getSnapshot<T>(
  ref: DocumentReference<T>,
  source?: GetSnapshotSource
): Promise<DocumentSnapshot<T>> {
  let snapshot: DocumentSnapshot<T>;

  if (source === "cache") {
    snapshot = await getDocFromCache(ref);
  } else if (source === "server") {
    snapshot = await getDocFromServer(ref);
  } else {
    snapshot = await getDoc(ref);
  }

  return snapshot;
}

export type NamedQueryPromise<T> = () => Promise<Query<T> | null>;

export type NamedQuery<T = DocumentData> = Query<T> | NamedQueryPromise<T>;

export type QueryType<T> = Query<T> | NamedQuery<T>;

export async function getQuerySnapshot<T>(
  query: Query<T>,
  source?: GetSnapshotSource
): Promise<QuerySnapshot<T>> {
  let snapshot: QuerySnapshot<T>;

  if (source === "cache") {
    snapshot = await getDocsFromCache(query);
  } else if (source === "server") {
    snapshot = await getDocsFromServer(query);
  } else {
    snapshot = await getDocs(query);
  }

  return snapshot;
}

function isNamedQuery<T>(query: QueryType<T>): query is NamedQuery<T> {
  return typeof query === "function";
}

export async function resolveQuery<T>(query: QueryType<T>): Promise<Query<T>> {
  if (isNamedQuery(query)) {
    if (typeof query === "function") {
      // Firebase throws an error if the query doesn't exist.
      const resolved = await query();
      return resolved!;
    }

    return query;
  }

  return query;
}
type Unsubscribe = FirestoreUnsubscribe;

const unsubscribes: Record<string, any> = {};
const observerCount: Record<string, number> = {};
const eventCount: Record<string, number> = {};

interface CancellablePromise<T = void> extends Promise<T> {
  cancel?: () => void;
}

type UseSubscriptionOptions<TData, TError, R> = UseQueryOptions<
  TData,
  TError,
  R
> & {
  onlyOnce?: boolean;
  fetchFn?: () => Promise<TData>;
};

/**
 * Utility hook to subscribe to events, given a function that returns an observer callback.
 * @param queryKey The react-query queryKey
 * @param subscriptionKey A hashable key to store the subscription
 * @param subscribeFn Returns an unsubscribe function to the event
 * @param options
 * @returns
 */
export function useSubscription<TData, TError, R = TData>(
  queryKey: QueryKey,
  subscriptionKey: QueryKey,
  subscribeFn: (cb: (data: TData | null) => Promise<void>) => Unsubscribe,
  options?: UseSubscriptionOptions<TData, TError, R>
): UseQueryResult<R, TError> {
  const hashFn = options?.queryKeyHashFn || hashKey;
  const subscriptionHash = hashFn(subscriptionKey);
  const queryClient = getQueryClient();
  const [mounted, setMounted] = useState(false);
  if (!options?.onlyOnce) {
    // if it's a subscription, we have at least one observer now
    observerCount[subscriptionHash] ??= 1;
  }

  function cleanupSubscription(subscriptionHash: string) {
    if (observerCount[subscriptionHash] === 1) {
      const unsubscribe = unsubscribes[subscriptionHash];
      unsubscribe();
      delete unsubscribes[subscriptionHash];
      delete eventCount[subscriptionHash];
    }
  }

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!options?.onlyOnce && mounted) {
      observerCount[subscriptionHash] += 1;
      return () => {
        observerCount[subscriptionHash] -= 1;
        cleanupSubscription(subscriptionHash);
      };
    }
  }, [mounted]);

  let resolvePromise: (data: TData | null) => void = () => null;
  let rejectPromise: (err: any) => void = () => null;
  const result: CancellablePromise<TData | null> = new Promise<TData | null>(
    (resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    }
  );

  result.cancel = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  let unsubscribe: Unsubscribe;

  if (typeof navigator === "undefined") {
    unsubscribe = unsubscribes[subscriptionHash];
    const old = queryClient.getQueryData<TData | null>(queryKey);
    resolvePromise(old || null);
  } else {
    if (!options?.onlyOnce) {
      if (unsubscribes[subscriptionHash]) {
        unsubscribe = unsubscribes[subscriptionHash];
        const old = queryClient.getQueryData<TData | null>(queryKey);

        resolvePromise(old || null);
      } else {
        unsubscribe = subscribeFn(async (data) => {
          eventCount[subscriptionHash] ??= 0;
          eventCount[subscriptionHash]++;
          if (eventCount[subscriptionHash] === 1) {
            resolvePromise(data || null);
          } else {
            queryClient.setQueryData(queryKey, data);
          }
        });
        unsubscribes[subscriptionHash] = unsubscribe;
      }
    } else {
      if (!options.fetchFn) {
        throw new Error("You must specify fetchFn if using onlyOnce mode.");
      } else {
        options
          .fetchFn()
          .then(resolvePromise)
          .catch((err) => {
            rejectPromise(err);
          });
      }
    }
  }

  const queryFn: QueryFunction<TData, QueryKey> = () => {
    return result as Promise<TData>;
  };

  return useQuery<TData, TError, R>({
    ...options,
    queryFn,
    queryKey,
    retry: false,
    staleTime: Infinity,
    refetchInterval: undefined,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

type NextOrObserver<T, ID> = (
  data: WithIdField<T, ID> | undefined
) => Promise<void>;

export function useFirestoreDocumentData<
  T = DocumentData,
  R = WithIdField<T> | undefined
>(
  queryKey: QueryKey,
  ref: DocumentReference<T>,
  options?: UseFirestoreHookOptions & SnapshotOptions,
  useQueryOptions?: Omit<
    UseQueryOptions<WithIdField<T> | undefined, FirestoreError, R>,
    "queryFn"
  >
): UseQueryResult<R, FirestoreError>;

export function useFirestoreDocumentData<
  ID extends string,
  T = DocumentData,
  R = WithIdField<T, ID> | undefined
>(
  queryKey: QueryKey,
  ref: DocumentReference<T>,
  options?: UseFirestoreHookOptions & SnapshotOptions & { idField: ID },
  useQueryOptions?: Omit<
    UseQueryOptions<WithIdField<T, ID> | undefined, FirestoreError, R>,
    "queryFn"
  >
): UseQueryResult<R, FirestoreError>;

export function useFirestoreDocumentData<
  ID extends string,
  T = DocumentData,
  R = WithIdField<T, ID> | undefined
>(
  queryKey: QueryKey,
  ref: DocumentReference<T>,
  options?: UseFirestoreHookOptions & SnapshotOptions & { idField?: ID },
  useQueryOptions?: Omit<
    UseQueryOptions<WithIdField<T, ID> | undefined, FirestoreError, R>,
    "queryFn"
  >
): UseQueryResult<R, FirestoreError> {
  const isSubscription = !!options?.subscribe;

  const subscribeFn = useCallback(
    (callback: NextOrObserver<T, ID>) => {
      const unsubscribe = onSnapshot(ref, (snapshot: DocumentData) => {
        let data = snapshot.data({
          serverTimestamps: options?.serverTimestamps,
        });

        if (data && options?.idField) {
          data = {
            ...data,
            [options.idField]: snapshot.id,
          };
        }

        // Cannot figure out how to get this working without a cast!
        const _dataWithIdField = data as WithIdField<T, ID> | undefined;
        callback(_dataWithIdField);
      });
      return unsubscribe;
    },
    [ref.id]
  );

  const fetchFn = async () => {
    //@ts-ignore
    const source: GetSnapshotSource =
      options?.source === "default" ? undefined : options?.source;
    return getSnapshot(ref, source).then((snapshot: DocumentSnapshot<T>) => {
      let data = snapshot.data({
        serverTimestamps: options?.serverTimestamps,
      });

      if (data && options?.idField) {
        data = {
          ...data,
          [options.idField]: snapshot.id,
        };
      }
      return data as WithIdField<T, ID> | undefined;
    });
  };

  return useSubscription<WithIdField<T, ID> | undefined, FirestoreError, R>(
    queryKey,
    ["useFirestoreDocument", ref.id],
    subscribeFn,
    {
      ...useQueryOptions,
      queryKey,
      onlyOnce: !isSubscription,
      fetchFn,
    }
  );
}
