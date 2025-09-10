import React, { useState } from 'react';

const FileInputTest = () => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Test Input Múltiple</h2>
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        accept="image/*,video/*"
        className="mb-4"
      />
      <div className="grid grid-cols-4 gap-2">
        {files.map((file, idx) => (
          <div key={idx} className="w-20 h-20 border rounded overflow-hidden">
            {file.type.startsWith('image') ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name} 
                className="w-full h-full object-cover" 
              />
            ) : file.type.startsWith('video') ? (
              <video 
                src={URL.createObjectURL(file)} 
                className="w-full h-full object-cover" 
                muted 
                controls 
              />
            ) : (
              <p className="text-xs text-center">{file.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileInputTest;
