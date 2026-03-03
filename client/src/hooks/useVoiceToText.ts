'use client';

import { useEffect, useRef, useState } from 'react';

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useVoiceToText() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const firstResult = event.results?.[0]?.[0]?.transcript ?? '';
      setText(firstResult.trim());
      setListening(false);
      setError('');
    };

    recognition.onerror = (event) => {
      setListening(false);
      setError(event?.error || 'Voice input failed');
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setText('');
      setError('');
      setListening(true);
      recognitionRef.current.start();
    } catch {
      setListening(false);
      setError('Microphone is already active');
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const clearText = () => setText('');

  return { text, error, listening, startListening, stopListening, clearText };
}
