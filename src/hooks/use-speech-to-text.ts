'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechToTextOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    onResult,
    onError,
    language = 'en-US',
    continuous = false,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  // Use refs for callbacks to avoid stale closures
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Get the SpeechRecognition constructor
  const getSpeechRecognition = useCallback(() => {
    return (
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType })
        .webkitSpeechRecognition
    );
  }, []);

  // Check for browser support on mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    setIsSupported(!!SpeechRecognition);

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [getSpeechRecognition]);

  // Create and configure a fresh recognition instance
  const createRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript && onResultRef.current) {
        onResultRef.current(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      if (onErrorRef.current) {
        onErrorRef.current(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    return recognition;
  }, [continuous, interimResults, language, getSpeechRecognition]);

  const startListening = useCallback(() => {
    if (isListening) return;

    // Abort any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    // Create a fresh instance each time (fixes network errors)
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setTranscript('');
    setError(null);

    try {
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start error:', err);
      setError('Failed to start speech recognition. Please try again.');
    }
  }, [isListening, createRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'audio-capture':
      return 'No microphone was found. Ensure that a microphone is installed.';
    case 'not-allowed':
      return 'Microphone permission was denied. Please allow microphone access.';
    case 'network': {
      // Check if user is on Brave
      const isBrave =
        (navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } }).brave !==
        undefined;
      if (isBrave) {
        return 'Brave blocks speech recognition. Go to brave://settings/privacy and enable "Use Google services for push messaging" or use Chrome/Safari.';
      }
      return 'Network error. Speech recognition requires an internet connection.';
    }
    case 'aborted':
      return 'Speech recognition was aborted.';
    case 'language-not-supported':
      return 'The language is not supported.';
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed. Try using Chrome or Safari.';
    default:
      return `Speech recognition error: ${error}`;
  }
}
