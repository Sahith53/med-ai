import { getSession } from "@/trpc/init";
import { redirect } from "next/navigation";
import { TriageView } from "@/modules/triage/ui/views/triage-view";

export default async function TriagePage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return <TriageView />;
}
