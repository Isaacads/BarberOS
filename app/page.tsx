import { IS_MOCK } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  if (IS_MOCK) {
    redirect("/dashboard");
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  } catch (e) {
    console.error("RootPage error:", e);
  }

  redirect("/landing");
}
