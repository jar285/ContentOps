import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_USERS } from '@/lib/auth/constants';
import { decrypt } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { mockStreamGenerator } from '@/lib/mock-stream';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const sessionCookie = req.cookies.get('contentops_session');
    let userId = DEMO_USERS.find((u) => u.role === 'Creator')?.id;

    if (sessionCookie) {
      const payload = await decrypt(sessionCookie.value);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Math.floor(Date.now() / 1000);

    // Run DB ops inside a transaction
    let activeConversationId = conversationId;
    db.transaction(() => {
      // Ensure conversation exists and belongs to the user
      const existingConv = activeConversationId 
        ? db.prepare('SELECT id FROM conversations WHERE id = ? AND user_id = ?').get(activeConversationId, userId)
        : null;

      if (!activeConversationId || !existingConv) {
        activeConversationId = crypto.randomUUID();
        db.prepare(
          'INSERT INTO conversations (id, user_id, title, created_at) VALUES (?, ?, ?, ?)',
        ).run(activeConversationId, userId, 'New Conversation', now);
      }

      const userMessageId = crypto.randomUUID();
      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
      ).run(userMessageId, activeConversationId, 'user', message, now);
    })();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // We yield the conversation ID first so the client can update its state
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ conversationId: activeConversationId }) + '\n',
          ),
        );

        let fullResponse = '';
        try {
          const generator = mockStreamGenerator(message);
          for await (const chunk of generator) {
            fullResponse += chunk;
            // Send chunk data as JSON lines or Server-Sent Events.
            // We'll use simple JSON lines.
            controller.enqueue(
              encoder.encode(JSON.stringify({ chunk }) + '\n'),
            );
          }

          // Save assistant message after stream completes
          const assistantMessageId = crypto.randomUUID();
          db.prepare(
            'INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
          ).run(
            assistantMessageId,
            activeConversationId,
            'assistant',
            fullResponse,
            Math.floor(Date.now() / 1000),
          );
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: error.message }) + '\n'),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
