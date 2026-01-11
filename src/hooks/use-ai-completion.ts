'use client';

import { useCompletion as useVercelCompletion, type UseCompletionOptions } from '@ai-sdk/react';

/**
 * Custom hook for AI text completion using Vercel AI SDK.
 *
 * @example
 * ```tsx
 * const { completion, input, handleInputChange, handleSubmit, isLoading } = useAICompletion();
 *
 * return (
 *   <div>
 *     <form onSubmit={handleSubmit}>
 *       <input value={input} onChange={handleInputChange} />
 *       <button type="submit" disabled={isLoading}>Generate</button>
 *     </form>
 *     <p>{completion}</p>
 *   </div>
 * );
 * ```
 */
export function useAICompletion(options?: UseCompletionOptions) {
  return useVercelCompletion({
    api: '/api/completion',
    ...options,
  });
}

export { useVercelCompletion as useCompletion };
