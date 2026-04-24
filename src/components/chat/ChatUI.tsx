'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { mockStreamGenerator } from '@/lib/mock-stream';
import { ChatComposer } from './ChatComposer';
import type { ChatMessageProps } from './ChatMessage';
import { ChatTranscript } from './ChatTranscript';

export function ChatUI() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || status === 'streaming') return;

    const userMessage: ChatMessageProps = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const assistantMessageId = crypto.randomUUID();
    const initialAssistantMessage: ChatMessageProps = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setStatus('streaming');
    setErrorMsg('');

    try {
      const stream = mockStreamGenerator(trimmed);
      let currentContent = '';

      for await (const chunk of stream) {
        currentContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: currentContent }
              : msg,
          ),
        );
      }
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    }
  };

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_auto]">
      <div role="status" aria-live="polite" className="sr-only">
        {status === 'streaming' && 'Assistant is typing...'}
        {status === 'error' && `Error: ${errorMsg}`}
      </div>

      <div className="relative flex min-h-0 w-full flex-col overflow-hidden">
        <ChatTranscript
          messages={messages}
          isStreaming={status === 'streaming'}
        />

        {status === 'streaming' && (
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-500 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
              <span className="font-medium">Composing response…</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {status === 'error' && (
          <div className="mx-6 mb-2 mt-2 flex shrink-0 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">
                Failed to generate response
              </h3>
              <p className="mt-0.5 text-sm text-red-600/80">{errorMsg}</p>
            </div>
          </div>
        )}

        <ChatComposer
          onSubmit={handleSubmit}
          isLocked={status === 'streaming'}
        />
      </div>
    </div>
  );
}
