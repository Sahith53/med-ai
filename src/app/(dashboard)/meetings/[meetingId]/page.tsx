import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import MeetingIdView from "@/modules/meetings/ui/views/meeting-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { getSession } from "@/trpc/init";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { meetingId } = await params;

  // Uses cached session — no extra DB call
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  // Await the prefetch so the data is actually in cache before dehydration
  await queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Meeting"
              description="This may take a few seconds"
            />
          }
        >
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Failed to load meeting"
                description="Something went wrong"
              />
            }
          >
            <MeetingIdView meetingId={meetingId} />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
