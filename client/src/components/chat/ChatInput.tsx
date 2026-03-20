'use client';

import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { Mic, Plus, Send, X, Calendar, Tag, Paperclip } from 'lucide-react';
import { TASK_TAGS, getTagClasses } from '@/lib/task-tags';

export default function ChatInput({
  onSend,
}: {
  onSend: (msg: string, files?: File[], dueDate?: string, tags?: string[]) => void;
}) {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceFallback, setVoiceFallback] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFilesRef = useRef<File[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const minDueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;

  // Close pickers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
        setShowTagPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilePick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAudioPick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (audioInputRef.current) audioInputRef.current.value = '';
    setVoiceFallback(true);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setDueDate('');
    setSelectedTag(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  };

  const handleSend = () => {
    const message = text.trim();
    if (!message && selectedFiles.length === 0) return;

    if (dueDate && dueDate < minDueDate) {
      setDueDate('');
    }

    onSend(message, selectedFiles, dueDate || undefined, selectedTag ? [selectedTag] : undefined);
    setText('');
    setDueDate('');
    setSelectedTag(null);
    setShowDatePicker(false);
    setShowTagPicker(false);
    setSelectedFiles([]);
  };

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceFallback(true);
      audioInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const ext = recorder.mimeType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `voice-note-${Date.now()}.${ext}`, {
          type: recorder.mimeType || 'audio/webm',
        });
        setSelectedFiles((prev) => [...prev, file]);

        const mergedFiles = [...selectedFilesRef.current, file];
        onSend(text.trim(), mergedFiles, dueDate || undefined, selectedTag ? [selectedTag] : undefined);
        setText('');
        setDueDate('');
        setSelectedTag(null);
        setShowDatePicker(false);
        setShowTagPicker(false);
        setSelectedFiles([]);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        chunksRef.current = [];
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setVoiceFallback(true);
      audioInputRef.current?.click();
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.stop();
  };

  const hasMetadata = selectedFiles.length > 0 || dueDate || selectedTag;
  const formattedTimer = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="relative border-t bg-white/80 p-3 backdrop-blur-md">
      {/* Selection Pickers (Anchor strictly ABOVE the input bar) */}
      {(showDatePicker || showTagPicker) && (
        <div 
          ref={pickerRef}
          className="absolute bg-black right-0 z-100 mb-4 w-80 origin-bottom-right animate-in fade-in slide-in-from-bottom-150 zoom-in-95 duration-300"
        >
          <div className="rounded-3xl border-2 border-blue-500 bg-white p-6 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.5)] ring-1 ring-black/5">
            {showDatePicker && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Calendar size={14} className="text-blue-500" />
                    Due Date
                  </h4>
                  <button onClick={() => setShowDatePicker(false)} className="rounded-full p-1 hover:bg-slate-100 transition-colors">
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (e.target.value) setShowDatePicker(false);
                  }}
                  min={minDueDate}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>
            )}
            {showTagPicker && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Tag size={14} className="text-indigo-500" />
                    Task Tags
                  </h4>
                  <button onClick={() => setShowTagPicker(false)} className="rounded-full p-1 hover:bg-slate-100 transition-colors">
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TASK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                        selectedTag === tag
                          ? getTagClasses(tag, 'selected')
                          : getTagClasses(tag, 'unselected') + ' border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Metadata Display (Floating Pill Badges) */}
      {hasMetadata && (
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1 animate-in slide-in-from-bottom-2 duration-300">
          {dueDate && (
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 shadow-sm">
              <Calendar size={13} className="text-blue-600" />
              <span className="text-[11px] font-bold text-blue-700">{new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <button onClick={() => setDueDate('')} className="rounded-full hover:bg-blue-200 transition-colors">
                <X size={13} className="text-blue-400" />
              </button>
            </div>
          )}
          {selectedTag && (
            <div 
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm transition-all ${getTagClasses(selectedTag, 'badge')}`}
            >
              <Tag size={13} />
              <span className="text-[11px] font-bold">{selectedTag}</span>
              <button onClick={() => setSelectedTag(null)} className="rounded-full hover:bg-black/5 transition-colors">
                <X size={13} className="opacity-50" />
              </button>
            </div>
          )}
          {selectedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
              <Paperclip size={13} className="text-slate-400" />
              <span className="max-w-25 truncate text-[11px] font-bold text-slate-600">{file.name}</span>
              <button onClick={() => removeFile(i)} className="rounded-full hover:bg-red-100 transition-colors">
                <X size={13} className="text-slate-300 hover:text-red-500" />
              </button>
            </div>
          ))}
          <button onClick={clearAll} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors px-2">Clear All</button>
        </div>
      )}

      {(voiceFallback || isRecording) && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            )}
            {isRecording ? `Recording... ${formattedTimer}` : 'Voice capture fallback enabled'}
          </div>
          {isRecording && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 rounded bg-red-400 animate-pulse h-2" />
              <span className="w-1 rounded bg-red-400 animate-pulse h-3" />
              <span className="w-1 rounded bg-red-400 animate-pulse h-1.5" />
              <span className="w-1 rounded bg-red-400 animate-pulse h-2.5" />
              <span className="w-1 rounded bg-red-400 animate-pulse h-1" />
            </div>
          )}
          {!isRecording && voiceFallback && (
            <button
              type="button"
              onClick={() => setVoiceFallback(false)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-700"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Main Bar (Premium Ultra Compact Design) */}
      <div className="group relative flex items-center gap-2 rounded-3xl border border-slate-200 bg-[#F9FAFB] p-2 pr-2.5 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 shadow-sm hover:shadow-md">
        <button
          type="button"
          onClick={triggerFilePicker}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
          title="Attach files"
        >
          <Plus size={22} className="transition-transform group-focus-within:rotate-90" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilePick}
        />
        <input
          ref={audioInputRef}
          type="file"
          className="hidden"
          accept="audio/*"
          onChange={handleAudioPick}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message or task title..."
          rows={1}
          className="flex-1 resize-none bg-transparent py-2.5 px-1 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none scrollbar-hide"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* Dynamic Action Controls (Icon Only) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setShowDatePicker(!showDatePicker); setShowTagPicker(false); }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${dueDate ? 'bg-blue-100 text-blue-600 scale-105 shadow-sm' : 'text-slate-400 hover:bg-slate-200/60'}`}
            title="Set Due Date"
          >
            <Calendar size={20} />
          </button>

          <button
            type="button"
            onClick={() => { setShowTagPicker(!showTagPicker); setShowDatePicker(false); }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${selectedTag ? 'bg-indigo-100 text-indigo-600 scale-105 shadow-sm' : 'text-slate-400 hover:bg-slate-200/60'}`}
            title="Assing Tags"
          >
            <Tag size={20} />
          </button>

          <button
            type="button"
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' : 'text-slate-400 hover:bg-slate-200/60'}`}
            title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
          >
            <Mic size={20} />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() && selectedFiles.length === 0}
            className="ml-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:bg-slate-400 disabled:shadow-none"
            title="Send Message/Task"
          >
            <Send size={18} className="translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
