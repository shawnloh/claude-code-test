"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";

type Props = { noteId: string };

export default function NoteActions({ noteId }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    }
    dialogRef.current?.close();
  }

  return (
    <>
      <div className="flex gap-2">
        <Link
          href={`/notes/${noteId}/edit`}
          className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="text-sm border border-red-300 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 shadow-xl backdrop:bg-black/40 max-w-sm w-full"
      >
        <h2 className="text-lg font-semibold mb-2">Delete note?</h2>
        <p className="text-sm text-neutral-600 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </dialog>
    </>
  );
}
