'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      title={title}
      onClick={onClick}
      className={`cursor-pointer px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className='flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200'>
      {/* Text style */}
      <ToolbarButton
        title='Bold'
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title='Italic'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <em>I</em>
      </ToolbarButton>

      <div className='w-px h-5 bg-neutral-200 mx-1' aria-hidden />

      {/* Headings */}
      <ToolbarButton
        title='Heading 1'
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        title='Heading 2'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title='Heading 3'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title='Normal text'
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive('paragraph')}
      >
        ¶
      </ToolbarButton>

      <div className='w-px h-5 bg-neutral-200 mx-1' aria-hidden />

      {/* Lists */}
      <ToolbarButton
        title='Bullet list'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
      >
        ≡
      </ToolbarButton>

      <div className='w-px h-5 bg-neutral-200 mx-1' aria-hidden />

      {/* Code */}
      <ToolbarButton
        title='Inline code'
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
      >
        <code className='font-mono text-xs'>{'`'}</code>
      </ToolbarButton>
      <ToolbarButton
        title='Code block'
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
      >
        <code className='font-mono text-xs'>{'<>'}</code>
      </ToolbarButton>

      <div className='w-px h-5 bg-neutral-200 mx-1' aria-hidden />

      {/* Block elements */}
      <ToolbarButton
        title='Horizontal rule'
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </ToolbarButton>
    </div>
  );
}

type Props = {
  initialContent?: object;
  onChange?: (json: object) => void;
  editorRef?: (editor: Editor | null) => void;
};

export default function NoteEditor({ initialContent, onChange, editorRef }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    onCreate({ editor }) {
      editorRef?.(editor);
    },
    onDestroy() {
      editorRef?.(null);
    },
  });

  return (
    <div className='bg-background border border-neutral-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-neutral-400'>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className='px-3 py-2 min-h-64 text-sm cursor-text' />
    </div>
  );
}
