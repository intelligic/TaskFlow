'use client';

import { useState } from 'react';
import { Mic, Send, X, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const startRecording = () => {
    setIsRecording(true);

    // simulate 2 sec recording
    setTimeout(() => {
      setIsRecording(false);
      setIsConverting(true);

      // simulate voice to text
      setTimeout(() => {
        setIsConverting(false);
        setText('Please complete this task by today.');
      }, 1500);
    }, 2000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setIsConverting(false);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="border-t bg-white p-3 flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message or use voice..."
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
      />

      {/* Voice Button */}
      {!isRecording && !isConverting && (
        <button
          onClick={startRecording}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}

      {/* Recording State */}
      {isRecording && (
        <button
          onClick={cancelRecording}
          className="flex items-center gap-1 text-red-600 text-sm px-2"
        >
          🎙️ Listening...
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Converting State */}
      {isConverting && (
        <div className="flex items-center gap-1 text-blue-600 text-sm px-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Converting...
        </div>
      )}

      {/* Send */}
      <button
        onClick={handleSend}
        className="p-2 rounded-full bg-black text-white hover:opacity-80"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}