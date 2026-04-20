'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Editor } from '@tiptap/react';
import NoteEditor from '@/app/components/NoteEditor';

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: object;
  initialIsPublic: boolean;
  initialPublicSlug: string | null;
};

export default function EditNoteForm({
  noteId,
  initialTitle,
  initialContent,
  initialIsPublic,
  initialPublicSlug,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicSlug, setPublicSlug] = useState<string | null>(initialPublicSlug);
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content_json, is_public: isPublic }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to save note.');
        return;
      }

      const updated = await res.json();
      setPublicSlug(updated.publicSlug ?? null);

      router.push(`/notes/${noteId}/view`);
    } finally {
      setLoading(false);
    }
  }

  const shareUrl = isPublic && publicSlug ? `${window.location.origin}/p/${publicSlug}` : null;

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <label htmlFor='title' className='text-sm font-medium'>
          Title
        </label>
        <input
          id='title'
          type='text'
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Note title'
          className='bg-background text-foreground border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400'
        />
      </div>

      <div className='flex flex-col gap-1'>
        <span className='text-sm font-medium'>Content</span>
        <NoteEditor editorRef={handleEditorRef} initialContent={initialContent} />
      </div>

      <div className='flex flex-col gap-2 border border-neutral-200 rounded-lg p-4'>
        <label className='flex items-center gap-3 cursor-pointer'>
          <input
            type='checkbox'
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className='w-4 h-4 rounded'
          />
          <span className='text-sm font-medium'>Public sharing</span>
        </label>
        {shareUrl && (
          <div className='flex items-center gap-2 mt-1'>
            <input
              type='text'
              readOnly
              value={shareUrl}
              className='flex-1 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-600 select-all'
            />
            <button
              type='button'
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className='cursor-pointer text-xs border border-neutral-300 rounded px-2 py-1 hover:bg-neutral-100 transition-colors'
            >
              Copy
            </button>
          </div>
        )}
        {isPublic && !shareUrl && (
          <p className='text-xs text-neutral-500'>A link will be generated when you save.</p>
        )}
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}

      <div className='flex justify-end gap-2'>
        <button
          type='button'
          onClick={() => router.push(`/notes/${noteId}/view`)}
          className='cursor-pointer border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={loading}
          className='cursor-pointer bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity'
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
