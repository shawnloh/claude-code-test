import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authentication");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your Notes</h1>
        <Link
          href="/notes/new"
          className="bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          New Note
        </Link>
      </div>
    </div>
  );
}
