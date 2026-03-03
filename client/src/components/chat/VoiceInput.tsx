'use client';

import { useEffect } from 'react';
import { useVoiceToText } from '@/hooks/useVoiceToText';

type Props = {
  onResult: (text: string) => void;
};

export default function VoiceInput({ onResult }: Props) {
  const { text, error, listening, startListening, stopListening, clearText } = useVoiceToText();

  useEffect(() => {
    if (!text) return;
    onResult(text);
    clearText();
  }, [text, onResult, clearText]);

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`rounded border px-3 py-2 text-sm ${
        listening ? 'bg-red-100 text-red-600' : 'bg-white'
      }`}
      title={error || 'Voice to Text'}
    >
      {listening ? 'Stop' : 'Mic'}
    </button>
  );
}
