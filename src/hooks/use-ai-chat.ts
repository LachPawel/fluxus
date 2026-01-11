'use client';

import { useChat as useVercelChat, type UseChatOptions } from '@ai-sdk/react';

export type { Message } from '@ai-sdk/react';

/**
 * Custom hook for AI chat functionality using Vercel AI SDK.
 * Wraps useChat with default configuration for the app.
 *
 * @example
 * ```tsx
 * const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIChat();
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     {messages.map(m => <div key={m.id}>{m.content}</div>)}
 *     <input value={input} onChange={handleInputChange} />
 *     <button type="submit" disabled={isLoading}>Send</button>
 *   </form>
 * );
 * ```
 */
export function useAIChat(options?: UseChatOptions) {
  return useVercelChat({
    api: '/api/chat',
    ...options,
  });
}

export { useVercelChat as useChat };
