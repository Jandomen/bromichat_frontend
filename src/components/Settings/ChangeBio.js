import React, { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ChangeBio = ({ bio, setBio }) => {
  const { user, setUser } = useContext(AuthContext);
  const [newBio, setNewBio] = useState(bio);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/user/bio`, 
        { bio: newBio },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBio(res.data.bio);
      setUser(prev => ({ ...prev, bio: res.data.bio }));
      alert('Bio actualizada correctamente');
    } catch (err) {
      //console.error(err);
      alert('Error al actualizar la bio');
    }
    setLoading(false);
  };

  const handleDelete = () => {
    setNewBio('');
    setBio('');
    handleSave();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md space-y-2">
      <h3 className="text-lg font-semibold text-white">Tu Bio</h3>
      <textarea
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
        className="w-full p-2 rounded-md bg-black/30 text-white"
        rows={4}
        placeholder="Escribe algo sobre ti..."
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-black"
        >
          Guardar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-black"
        >
          Eliminar Bio
        </button>
      </div>
    </div>
  );
};

export default ChangeBio;
