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
        className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu publicación..."
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default EditPostForm;