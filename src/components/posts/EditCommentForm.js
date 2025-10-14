import React, { useState } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

const EditCommentForm = ({ initialComment, onSave, onCancel }) => {
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) onSave(comment);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 border rounded shadow-sm bg-white">
      <input
        type="text"
        aria-label="Editar comentario"
        placeholder="Edita tu comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm text-gray-800"
        >
          <FaTimes className="text-xs" />
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
        >
          <FaCheck className="text-xs" />
          Guardar
        </button>
      </div>
    </form>
  );
};

export default EditCommentForm;