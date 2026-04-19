import React, { Suspense } from "react";
import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import { getQueryClient, trpc } from "@/trpc/server";
import { getSession } from "@/trpc/init";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import AgentIdView from "@/modules/agents/ui/views/agent-id-view";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ agentId: string }>;
}

const Page = async ({ params }: Props) => {
  const { agentId } = await params;

  // Uses cached session — no extra DB call
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  // Await the prefetch so the data is in cache before dehydration
  await queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({
      id: agentId,
    })
  );
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Agent"
              description="This may take a few seconds"
            />
          }
        >
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Failed to load agent"
                description="Something went wrong"
              />
            }
          >
            <AgentIdView agentId={agentId} />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
