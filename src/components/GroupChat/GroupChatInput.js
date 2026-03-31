import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../context/UIContext';

export default function GroupChatInput({ onSend, conversationId }) {
  const { showToast } = useUI();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        showToast('El archivo excede el límite de 100MB', 'error');
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else if (selectedFile.type.startsWith('video/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    } else {
      setFile(null);
      setFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    setIsSending(true);
    try {
      await onSend({ content: text, file, conversationId });
      setText('');
      setFile(null);
      setFilePreview(null);
    } catch (err) {
      // console.error('Error sending message:', err.response?.data || err.message);
      // Rely on parent component for error display
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {file && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-2 border border-indigo-100 animate-in slide-in-from-bottom-2">
          {filePreview ? (
            file.type.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <video
                src={filePreview}
                className="w-16 h-16 rounded-lg shadow-sm"
                controls
              />
            )
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-500 rounded-lg">
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1 text-gray-400 hover:text-red-500 transition"
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-100 rounded-3xl px-2 py-1 border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-200">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 xs:p-2 text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none rounded-full hover:bg-white/50"
          aria-label="Attach file"
          disabled={isSending}
        >
          <PaperClipIcon className="w-5 h-5 xs:w-6 xs:h-6" />
        </button>

        <input
          type="text"
          className="flex-1 px-1 xs:px-2 py-1.5 xs:py-2.5 sm:py-3 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-[13px] xs:text-sm sm:text-base"
          placeholder="Manda un mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
          disabled={isSending}
          autoComplete="off"
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />

        <button
          onClick={handleSend}
          className={`p-2 rounded-full transition-all duration-200 shadow-sm ${isSending || (!text.trim() && !file)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          disabled={isSending || (!text.trim() && !file)}
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}