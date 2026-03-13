'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { Mic, Plus, Send, X } from 'lucide-react';

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: null | (() => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  onend: null | (() => void);
  onerror: null | (() => void);
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

export default function ChatInput({
  onSend,
}: {
  onSend: (msg: string, files?: File[]) => void;
}) {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilePick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    const message = text.trim();
    if (!message && selectedFiles.length === 0) return;

    onSend(message, selectedFiles);
    setText('');
    clearFiles();
  };

  const toggleVoiceInput = () => {
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    };
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setText((prev) => `${prev} ${finalTranscript.trim()}`.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className=" bg-white px-4 py-3">
      {selectedFiles.length > 0 && (
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {selectedFiles.map((file) => (
            <span
              key={`${file.name}-${file.lastModified}`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {file.name}
            </span>
          ))}
          <button
            type="button"
            onClick={clearFiles}
            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={triggerFilePicker}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors hover:bg-slate-300"
          title="Attach files"
          aria-label="Attach files"
        >
          <Plus className="h-4 w-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilePick}
        />

        <div className="flex min-h-10 flex-1 items-center rounded-lg border border-slate-200 bg-slate-100 pl-4 pr-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type task or message..."
            rows={1}
            className="h-6 max-h-20 w-full resize-none overflow-y-auto bg-transparent py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </div>

        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
            isRecording
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
          aria-label="Record voice"
          title="Record voice"
        >
          {isRecording ? (
            <span className="inline-block h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={handleSend}
          className="inline-flex h-10 items-center gap-1 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Send
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
