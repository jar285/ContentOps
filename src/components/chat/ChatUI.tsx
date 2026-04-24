'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { mockStreamGenerator } from '@/lib/mock-stream';
import { ChatComposer } from './ChatComposer';
import type { ChatMessageProps } from './ChatMessage';
import { ChatTranscript } from './ChatTranscript';

export interface ChatUIProps {
  initialMessages?: ChatMessageProps[];
  conversationId?: string | null;
}

export function ChatUI({
  initialMessages = [],
  conversationId = null,
}: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(conversationId);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeConversationId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to generate response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          let data;
          try {
            data = JSON.parse(line);
          } catch (e) {
            console.error('Error parsing stream line:', e);
            continue;
          }
            
          if (data.conversationId) {
            setActiveConversationId(data.conversationId);
          } else if (data.error) {
            throw new Error(data.error);
          } else if (data.chunk) {
            currentContent += data.chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: currentContent }
                  : m
              )
            );
          }
        }
      }

      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.error) throw new Error(data.error);
        } catch (e) {
          // ignore
        }
      }

      setStatus('idle');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      setStatus('error');
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
