import { ReactNode } from 'react';

type Mark = { type: string };
type TiptapNode = {
  type: string;
  text?: string;
  marks?: Mark[];
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
};

function applyMarks(text: string, marks: Mark[] = []): ReactNode {
  let node: ReactNode = text;
  for (const mark of marks) {
    if (mark.type === 'bold') node = <strong>{node}</strong>;
    else if (mark.type === 'italic') node = <em>{node}</em>;
    else if (mark.type === 'code') node = <code>{node}</code>;
  }
  return node;
}

function renderNode(node: TiptapNode, index: number): ReactNode {
  switch (node.type) {
    case 'doc':
      return <>{node.content?.map((child, i) => renderNode(child, i))}</>;

    case 'paragraph':
      return <p key={index}>{node.content?.map((child, i) => renderNode(child, i))}</p>;

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const children = node.content?.map((child, i) => renderNode(child, i));
      if (level === 1) return <h1 key={index}>{children}</h1>;
      if (level === 2) return <h2 key={index}>{children}</h2>;
      return <h3 key={index}>{children}</h3>;
    }

    case 'bulletList':
      return <ul key={index}>{node.content?.map((child, i) => renderNode(child, i))}</ul>;

    case 'listItem':
      return <li key={index}>{node.content?.map((child, i) => renderNode(child, i))}</li>;

    case 'codeBlock':
      return (
        <pre key={index}>
          <code>{node.content?.map((child, i) => renderNode(child, i))}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={index} />;

    case 'text':
      return <span key={index}>{applyMarks(node.text ?? '', node.marks)}</span>;

    default:
      return null;
  }
}

type Props = { content: TiptapNode };

export default function NoteViewer({ content }: Props) {
  return <div className='ProseMirror'>{renderNode(content, 0)}</div>;
}
