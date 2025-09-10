import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const { token } = useContext(AuthContext);

  const handleFileChange = (e) => {
    const files = [...e.target.files];
   // console.log('Selected files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    setMediaFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && mediaFiles.length === 0) {
      alert('Debes escribir algo o subir al menos una imagen o video');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

   // console.log('FormData entries:');
    for (let pair of formData.entries()) {
     // console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     // console.log('Post created:', res.data);
      setContent('');
      setMediaFiles([]);
      if (onPostCreated) onPostCreated(res.data);
    } catch (error) {
     // console.error('Error creando la publicación:', error.response?.data || error);
      alert(`Error creando la publicación: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <textarea
        placeholder="¿Qué tienes en mente :) ...?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="3"
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="block"
      />
      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaFiles.map((file, idx) => (
            <div
              key={idx}
              className="w-24 h-24 relative flex flex-col items-center justify-center border rounded p-1"
            >
              {file.type.startsWith('image') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="object-cover w-full h-full rounded"
                />
              ) : file.type.startsWith('video') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-full rounded"
                  muted
                  controls={false}
                />
              ) : (
                <span className="text-xs text-center break-words">{file.name}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Publicar
      </button>
    </form>
  );
};

export default CreatePost;