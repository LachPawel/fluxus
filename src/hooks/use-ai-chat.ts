'use client';

import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export type { UIMessage as Message };

/**
 * Custom hook for AI chat functionality using Vercel AI SDK v6.
 * Wraps useChat with default configuration for the app.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, status } = useAIChat();
 * const [input, setInput] = useState('');
 *
 * return (
 *   <form onSubmit={(e) => {
 *     e.preventDefault();
 *     if (input.trim()) {
 *       sendMessage({ text: input });
 *       setInput('');
 *     }
 *   }}>
 *     {messages.map(m => (
 *       <div key={m.id}>
 *         {m.parts.map((p, i) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
 *       </div>
 *     ))}
 *     <input value={input} onChange={(e) => setInput(e.target.value)} />
 *     <button type="submit" disabled={status !== 'ready'}>Send</button>
 *   </form>
 * );
 * ```
 */
export function useAIChat(overrides?: { api?: string }) {
  return useChat({
    transport: new DefaultChatTransport({
      api: overrides?.api ?? '/api/chat',
    }),
  });
}

export { useChat };
