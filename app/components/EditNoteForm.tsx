"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Editor } from "@tiptap/react";
import NoteEditor from "@/app/components/NoteEditor";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: object;
};

export default function EditNoteForm({ noteId, initialTitle, initialContent }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const handleEditorRef = useCallback((ed: Editor | null) => {
    editorRef.current = ed;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;

    setError(null);
    setLoading(true);

    try {
      const content_json = JSON.stringify(editor.getJSON());

      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content_json }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save note.");
        return;
      }

      router.push(`/notes/${noteId}/view`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="bg-background text-foreground border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Content</span>
        <NoteEditor editorRef={handleEditorRef} initialContent={initialContent} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push(`/notes/${noteId}/view`)}
          className="cursor-pointer border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
