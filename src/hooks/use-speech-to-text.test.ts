import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeechToText } from './use-speech-to-text';

// Mock SpeechRecognition
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockAbort = vi.fn();

let mockOnResult: ((event: unknown) => void) | null = null;
let mockOnError: ((event: unknown) => void) | null = null;
let mockOnEnd: (() => void) | null = null;
let mockOnStart: (() => void) | null = null;

class MockSpeechRecognition {
  continuous = false;
  interimResults = true;
  lang = 'en-US';

  start = mockStart.mockImplementation(() => {
    // Simulate starting
    setTimeout(() => mockOnStart?.(), 0);
  });
  stop = mockStop.mockImplementation(() => {
    setTimeout(() => mockOnEnd?.(), 0);
  });
  abort = mockAbort;

  set onresult(handler: ((event: unknown) => void) | null) {
    mockOnResult = handler;
  }
  set onerror(handler: ((event: unknown) => void) | null) {
    mockOnError = handler;
  }
  set onend(handler: (() => void) | null) {
    mockOnEnd = handler;
  }
  set onstart(handler: (() => void) | null) {
    mockOnStart = handler;
  }
}

describe('useSpeechToText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnResult = null;
    mockOnError = null;
    mockOnEnd = null;
    mockOnStart = null;

    // Set up the mock on window
    (
      window as unknown as { webkitSpeechRecognition: typeof MockSpeechRecognition }
    ).webkitSpeechRecognition = MockSpeechRecognition;
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { webkitSpeechRecognition?: typeof MockSpeechRecognition })
      .webkitSpeechRecognition;
  });

  it('should detect browser support', () => {
    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(true);
  });

  it('should return not supported when SpeechRecognition is unavailable', () => {
    delete (window as unknown as { webkitSpeechRecognition?: typeof MockSpeechRecognition })
      .webkitSpeechRecognition;

    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(false);
  });

  it('should start listening when startListening is called', async () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it('should set isListening to true when recognition starts', async () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => {
      result.current.startListening();
    });

    // Simulate the onstart event
    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });
  });

  it('should stop listening when stopListening is called', async () => {
    const { result } = renderHook(() => useSpeechToText());

    // Start first
    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    // Then stop
    act(() => {
      result.current.stopListening();
    });

    expect(mockStop).toHaveBeenCalled();
  });

  it('should toggle listening state', async () => {
    const { result } = renderHook(() => useSpeechToText());

    // Toggle on
    act(() => {
      result.current.toggleListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    // Toggle off
    act(() => {
      result.current.toggleListening();
    });

    expect(mockStop).toHaveBeenCalled();
  });

  it('should call onResult callback with transcript', async () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechToText({ onResult }));

    act(() => {
      result.current.startListening();
    });

    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          isFinal: true,
          0: { transcript: 'hello world' },
        },
      },
    };

    act(() => {
      mockOnResult?.(mockEvent);
    });

    expect(result.current.transcript).toBe('hello world');
    expect(onResult).toHaveBeenCalledWith('hello world');
  });

  it('should handle interim results', async () => {
    const { result } = renderHook(() => useSpeechToText({ interimResults: true }));

    act(() => {
      result.current.startListening();
    });

    // Simulate interim result
    const mockEvent = {
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          isFinal: false,
          0: { transcript: 'hel' },
        },
      },
    };

    act(() => {
      mockOnResult?.(mockEvent);
    });

    expect(result.current.transcript).toBe('hel');
  });

  it('should handle errors', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechToText({ onError }));

    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    // Simulate error
    act(() => {
      mockOnError?.({ error: 'no-speech', message: '' });
    });

    expect(result.current.error).toBe('No speech was detected. Please try again.');
    expect(result.current.isListening).toBe(false);
    expect(onError).toHaveBeenCalledWith('No speech was detected. Please try again.');
  });

  it('should handle not-allowed error', async () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    act(() => {
      mockOnError?.({ error: 'not-allowed', message: '' });
    });

    expect(result.current.error).toBe(
      'Microphone permission was denied. Please allow microphone access.',
    );
  });

  it('should reset transcript', () => {
    const { result } = renderHook(() => useSpeechToText());

    // Set some transcript first
    act(() => {
      result.current.startListening();
    });

    const mockEvent = {
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          isFinal: true,
          0: { transcript: 'test' },
        },
      },
    };

    act(() => {
      mockOnResult?.(mockEvent);
    });

    expect(result.current.transcript).toBe('test');

    // Reset
    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
  });

  it('should set isListening to false when recognition ends', async () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    // Simulate end
    act(() => {
      mockOnEnd?.();
    });

    expect(result.current.isListening).toBe(false);
  });

  it('should abort recognition on unmount if listening', async () => {
    const { result, unmount } = renderHook(() => useSpeechToText());

    // Start listening first to create a recognition instance
    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });
});
