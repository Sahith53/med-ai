import { meetingsRouter } from "@/modules/meetings/server/procedures";
import { createTRPCRouter } from "../init";
import { agentsRouter } from "@/modules/agents/server/procedures";
import { triageRouter } from "@/modules/triage/server/procedures";

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  triage: triageRouter,
});

export type AppRouter = typeof appRouter;
