'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = { noteId: string; isPublic: boolean; publicSlug: string | null };

export default function NoteActions({ noteId, isPublic, publicSlug }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard');
    }
    dialogRef.current?.close();
  }

  const shareUrl = isPublic && publicSlug ? `/p/${publicSlug}` : null;

  return (
    <>
      <div className='flex gap-2'>
        {shareUrl && (
          <button
            type='button'
            onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
            className='cursor-pointer text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
          >
            Copy link
          </button>
        )}
        <Link
          href={`/notes/${noteId}/edit`}
          className='text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
        >
          Edit
        </Link>
        <button
          type='button'
          onClick={() => dialogRef.current?.showModal()}
          className='cursor-pointer text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950 transition-colors'
        >
          Delete
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className='m-auto rounded-lg p-6 shadow-xl backdrop:bg-black/50 max-w-sm w-full text-neutral-900 dark:text-neutral-100'
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <h2 className='text-lg font-semibold mb-2'>Delete note?</h2>
        <p className='text-sm text-neutral-500 mb-6'>This action cannot be undone.</p>
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={() => dialogRef.current?.close()}
            className='cursor-pointer text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleDelete}
            className='cursor-pointer text-sm bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 transition-colors'
          >
            Delete
          </button>
        </div>
      </dialog>
    </>
  );
}
