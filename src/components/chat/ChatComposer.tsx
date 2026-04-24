import { ArrowUp } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';

export interface ChatComposerProps {
  onSubmit: (text: string) => void;
  isLocked: boolean;
}

export function ChatComposer({ onSubmit, isLocked }: ChatComposerProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (isLocked) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-6 pb-4 pt-3.5">
      <div className="relative mx-auto flex max-w-2xl items-end gap-2.5 rounded-xl border border-gray-200 bg-white p-2 transition-all focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
        <label htmlFor="chat-composer-input" className="sr-only">
          Type a message
        </label>
        <textarea
          id="chat-composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder="Ask about brand voice, content pillars, or the first-week calendar…"
          className="max-h-40 min-h-[38px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0"
          rows={1}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLocked || !text.trim()}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-25 disabled:hover:bg-indigo-600"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
        </button>
      </div>
      <div className="mt-2 text-center font-mono text-[10px] tracking-wide text-gray-300">
        shift + enter for new line
      </div>
    </div>
  );
}
