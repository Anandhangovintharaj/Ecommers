import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api'; // Corrected import
import './FileUpload.css';

const FileUpload = ({ onFileUploadSuccess, initialImageUrl, addToast }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [initialImageUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      uploadFile(file);
    } else {
      setSelectedFile(null);
      // If no file selected, and there was an initial image, revert to initialImageUrl
      setPreviewUrl(initialImageUrl || null);
      // Also, inform parent about the current image URL (which might be the initial one or empty)
      onFileUploadSuccess(initialImageUrl || '');
    }
  };

  const uploadFile = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        addToast('Image uploaded successfully!', 'success');
        onFileUploadSuccess(response.data.imageUrl);
      } else {
        addToast(response.data.message || 'Failed to upload image', 'error');
        // Revert to initialImageUrl if upload fails
        onFileUploadSuccess(initialImageUrl || '');
        setPreviewUrl(initialImageUrl || null); // Revert preview as well
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      addToast(error.response?.data?.message || 'Error uploading file', 'error');
      // Revert to initialImageUrl if error occurs
      onFileUploadSuccess(initialImageUrl || '');
      setPreviewUrl(initialImageUrl || null); // Revert preview as well
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <button type="button" className="admin-button" onClick={() => fileInputRef.current.click()}>
        {loading ? 'Uploading...' : (previewUrl ? 'Change Image' : 'Select Image')}
      </button>
      {previewUrl && (
        <div className="image-preview-container">
          <img src={previewUrl} alt="Preview" className="image-preview" />
        </div>
      )}
      {!previewUrl && !loading && <p>No image selected.</p>}
    </div>
  );
};

export default FileUpload;
