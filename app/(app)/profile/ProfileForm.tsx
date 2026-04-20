'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Profile } from '@/lib/profile';

export default function ProfileForm({
  profile,
  gravatarUrl,
}: {
  profile: Profile;
  gravatarUrl: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image: image || null }),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to save profile');
    }
  }

  async function handleDelete() {
    const res = await fetch('/api/profile', { method: 'DELETE' });
    if (res.ok) {
      router.push('/authentication');
    }
    dialogRef.current?.close();
  }

  return (
    <>
      <form onSubmit={handleSave} className='flex flex-col gap-5'>
        <div className='bg-background border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 flex flex-col gap-4'>
          <div className='flex items-center gap-4'>
            <Image
              src={image || gravatarUrl}
              alt={name || 'Avatar'}
              width={64}
              height={64}
              className='rounded-full'
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = gravatarUrl;
              }}
            />
            <div>
              <p className='text-sm font-medium'>{name || 'Your name'}</p>
              <p className='text-xs text-neutral-500'>{profile.email}</p>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='email' className='text-sm font-medium'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={profile.email}
              disabled
              className='bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-lg px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 cursor-not-allowed'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='name' className='text-sm font-medium'>
              Display name
            </label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              className='bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='image' className='text-sm font-medium'>
              Avatar URL <span className='text-neutral-400 font-normal'>(optional)</span>
            </label>
            <input
              id='image'
              type='url'
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder='https://...'
              className='bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400'
            />
          </div>
        </div>

        {error && <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>}
        {success && <p className='text-sm text-green-600 dark:text-green-400'>Profile saved.</p>}

        <div className='flex items-center justify-between'>
          <button
            type='submit'
            disabled={saving}
            className='bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50'
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <button
            type='button'
            onClick={() => dialogRef.current?.showModal()}
            className='cursor-pointer text-sm text-red-600 dark:text-red-400 hover:underline'
          >
            Delete account
          </button>
        </div>
      </form>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className='m-auto rounded-lg p-6 shadow-xl backdrop:bg-black/50 max-w-sm w-full'
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <h2 className='text-lg font-semibold mb-2'>Delete account?</h2>
        <p className='text-sm text-neutral-500 mb-6'>
          Your account will be deactivated. This cannot be undone.
        </p>
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
            Delete account
          </button>
        </div>
      </dialog>
    </>
  );
}
