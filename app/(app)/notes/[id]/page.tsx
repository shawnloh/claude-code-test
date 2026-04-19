import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NoteEditorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authentication");

  return <p>Note editor page</p>;
}
