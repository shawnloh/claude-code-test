"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Editor } from "@tiptap/react";
import NoteEditor from "@/app/components/NoteEditor";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
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

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content_json }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create note.");
        return;
      }

      const { id } = await res.json();
      router.push(`/notes/${id}/view`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">New Note</h1>
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
          <NoteEditor editorRef={handleEditorRef} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Saving…" : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
