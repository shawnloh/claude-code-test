import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getNotesByUser } from "@/lib/notes";
import NoteCard from "@/app/components/NoteCard";

const PAGE_SIZE = 20;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authentication");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { notes, total } = getNotesByUser(session.user.id, PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

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

      {notes.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {page > 1 ? "No more notes." : "No notes yet. Create your first one!"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              updatedAt={note.updatedAt}
              isPublic={note.isPublic}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 text-sm">
          {page > 1 ? (
            <Link
              href={`/dashboard?page=${page - 1}`}
              className="text-foreground underline underline-offset-2"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-neutral-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/dashboard?page=${page + 1}`}
              className="text-foreground underline underline-offset-2"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
