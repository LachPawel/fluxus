'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
} from 'lucide-react';
import type { UIMessage } from '@ai-sdk/react';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

interface FlowAIChatPanelProps {
  messages: UIMessage[];
  status: string;
  error: Error | undefined;
  onSendMessage: (message: { text: string }) => void;
  onRegenerate: () => void;
  onStop: () => void;
}

export function FlowAIChatPanel({
  messages,
  status,
  error,
  onSendMessage,
  onRegenerate,
  onStop,
}: FlowAIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Speech-to-text hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    error: speechError,
    toggleListening,
  } = useSpeechToText({
    onResult: (transcript) => {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
    continuous: false,
    interimResults: true,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      onSendMessage({ text: input });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Render message content
  const renderMessageContent = (message: UIMessage) => {
    if (!message.parts) return null;

    return message.parts.map((part, index) => {
      if (part.type === 'text') {
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part.text}
          </span>
        );
      }
      // Handle tool invocation parts (type is like 'tool-addNode', 'tool-updateNode', etc.)
      if (part.type.startsWith('tool-')) {
        const toolName = part.type.replace('tool-', '');
        // Cast to access state property which exists on tool parts
        const toolPart = part as { type: string; state?: string };
        const state = toolPart.state;

        return (
          <div key={index} className="my-2 p-2 bg-slate-100 rounded-md text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">{formatToolName(toolName)}</span>
              {(state === 'input-streaming' || state === 'input-available') && (
                <Loader2 className="w-3 h-3 animate-spin ml-auto" />
              )}
              {state === 'output-available' && <span className="ml-auto text-green-600">✓</span>}
            </div>
          </div>
        );
      }
      return null;
    });
  };

  const formatToolName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-50"
        title="Open AI Flow Assistant"
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed left-4 right-4 bottom-4 md:left-auto md:right-6 md:bottom-6 md:w-[400px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all ${
        isMinimized ? 'h-14' : 'h-[70vh] md:h-[600px] md:max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-black rounded-t-xl">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Flow AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-slate-800" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Flow AI Assistant</h3>
                <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                  Describe what you want to build and I'll create the flow for you. Try:
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'Create a welcome flow for new users',
                    'Add a keyword trigger for "help"',
                    'Build a customer support bot',
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="block w-full text-left text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-black text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                </div>
              </div>
            ))}

            {status === 'streaming' && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
                <button
                  onClick={onStop}
                  className="ml-auto text-xs text-red-500 hover:text-red-600"
                >
                  Stop
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <p>Error: {error.message}</p>
                <button onClick={onRegenerate} className="text-red-600 underline mt-1">
                  Try again
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100">
            {speechError && (
              <div className="mb-2 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
                {speechError}
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening...' : 'Describe what you want to build...'}
                className={`flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px] max-h-[120px] ${
                  isListening ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                rows={1}
                disabled={status === 'streaming'}
              />
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={status === 'streaming'}
                  className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || status !== 'ready'}
                className="w-11 h-11 bg-black text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              {isSpeechSupported
                ? 'Press Enter to send • Shift+Enter for new line • Click mic to speak'
                : 'Press Enter to send, Shift+Enter for new line'}
            </p>
          </form>
        </>
      )}
    </div>
  );
}
