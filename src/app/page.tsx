import { Layers } from 'lucide-react';
import { ChatUI } from '@/components/chat/ChatUI';

export default function Home() {
  return (
    <main className="grid h-screen max-h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#f8f9fa] font-sans text-gray-900">
      <header className="z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 py-3.5">
        <h1 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Layers
              className="h-3.5 w-3.5"
              aria-hidden="true"
              strokeWidth={2.5}
            />
          </span>
          ContentOps Studio
        </h1>
        <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[10px] text-gray-400">
          sprint-1
        </span>
      </header>
      <div className="flex min-h-0 w-full justify-center overflow-hidden">
        <div className="relative flex h-full w-full max-w-[52rem] flex-col border-x border-gray-100 bg-white">
          <ChatUI />
        </div>
      </div>
    </main>
  );
}
