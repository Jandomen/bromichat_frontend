import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

export default function GroupChatInput({ onSend, conversationId }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert('File size exceeds 100MB limit'); // Correct limit
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
    <div className="flex flex-col gap-2 p-4 border-t bg-gray-50">
      {file && (
        <div className="flex items-center gap-2">
          {filePreview ? (
            file.type.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Preview"
                className="max-w-[100px] max-h-[100px] rounded object-cover"
              />
            ) : (
              <video
                src={filePreview}
                className="max-w-[100px] max-h-[100px] rounded"
                controls
              />
            )
          ) : (
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {file.name}
            </span>
          )}
          <button
            onClick={handleRemoveFile}
            className="text-red-500 text-sm hover:text-red-600"
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
          disabled={isSending}
          aria-label="Type message"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none"
          aria-label="Attach file"
          disabled={isSending}
        >
          <PaperClipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          aria-hidden="true"
        />
        <button
          onClick={handleSend}
          className={`p-2 rounded-full ${
            isSending || (!text.trim() && !file)
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:text-blue-600'
          } focus:outline-none`}
          disabled={isSending || (!text.trim() && !file)}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}