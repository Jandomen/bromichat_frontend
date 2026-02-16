import React, { useState } from 'react';

const EditPostForm = ({ initialContent, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) onSave(content);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow bg-white">
      <textarea
        aria-label="Editar publicación"
        className="w-full p-4 border-2 border-gray-100 rounded-[1.5rem] resize-none focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 text-slate-900 text-lg font-bold tracking-tight leading-tight transition-all"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu publicación..."
      />
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
        >
          Guardar Historia
        </button>
      </div>
    </form>
  );
};

export default EditPostForm;