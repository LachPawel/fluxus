'use client';

import { useCompletion, type UseCompletionOptions } from '@ai-sdk/react';

/**
 * Custom hook for AI text completion using Vercel AI SDK.
 *
 * @example
 * ```tsx
 * const { completion, complete, isLoading } = useAICompletion();
 *
 * return (
 *   <div>
 *     <button onClick={() => complete('Write a poem')} disabled={isLoading}>
 *       Generate
 *     </button>
 *     <p>{completion}</p>
 *   </div>
 * );
 * ```
 */
export function useAICompletion(options?: UseCompletionOptions) {
  return useCompletion({
    api: '/api/completion',
    ...options,
  });
}

export { useCompletion };
