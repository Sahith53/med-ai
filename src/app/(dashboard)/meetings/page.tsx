import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import { loadSearchParams } from "@/modules/meetings/params";
import MeetingsListHeader from "@/modules/meetings/ui/components/meetings-list-header";
import MeetingsView from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { getSession } from "@/trpc/init";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  // Uses cached session — shared with any tRPC calls made in this request
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  // Await the prefetch so the data is actually in the cache before dehydration
  await queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Meetings"
              description="This may take a few seconds"
            />
          }
        >
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Failed to load meetings"
                description="Something went wrong"
              />
            }
          >
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
