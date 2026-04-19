import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for 5 minutes — avoids refetching on every navigation
        staleTime: 5 * 60 * 1000,
        // Keep inactive queries in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Don't retry on failure, fail fast
        retry: 1,
        // Don't refetch when window regains focus — reduces unnecessary DB calls
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {},
    },
  });
}
