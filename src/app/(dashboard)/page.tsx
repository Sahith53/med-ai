import { getSession } from "@/trpc/init";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/sign-in");
  } else {
    redirect("/agents");
  }
}
