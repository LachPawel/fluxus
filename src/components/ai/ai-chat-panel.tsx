'use client';

import { useState } from 'react';
import { useAIChat, type Message } from '@/hooks/use-ai-chat';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface AIChatPanelProps {
  /** System prompt to set the AI's behavior */
  systemPrompt?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

/**
 * AI Chat Panel component using Vercel AI SDK.
 * Can be integrated into the flow editor for AI-assisted workflow creation.
 */
export function AIChatPanel({
  systemPrompt = 'You are a helpful assistant for creating workflows and automations.',
  placeholder = 'Ask AI to help with your workflow...',
  className = '',
}: AIChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, stop } =
    useAIChat({
      body: { system: systemPrompt },
    });

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg border border-slate-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium text-slate-900">AI Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Start a conversation with AI</p>
            <p className="text-xs text-slate-400 mt-1">Ask for help creating your workflow</p>
          </div>
        )}

        {messages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <p>Error: {error.message}</p>
            <button onClick={() => reload()} className="text-red-600 underline mt-1">
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-500' : 'bg-slate-100'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-slate-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
