import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import './addblog.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';

function AddBlog({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleEditorChange = (content) => {
    setContent(content);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleTagInput = (e) => {
    const newTags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setTags(newTags);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let uploadedImageURL = '';

      // Upload image to Cloudinary
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'ml_default');

        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dmx577ow7/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedImageURL = uploadData.secure_url;
      }

      // Save blog post to MongoDB
      const blogData = {
        doctor: user._id,
        title,
        content,
        imageURL: uploadedImageURL,
        tags,
      };

      const response = await axios.post('http://localhost:5000/app/doctor/add-blog', blogData);

      if (response.status === 201) {
        setSuccess('Blog post created successfully!');
        setTitle('');
        setContent('');
        setTags([]);
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => navigate(-1), 1500);
      } else {
        throw new Error('Failed to save blog post.');
      }
    } catch (error) {
      setError(error.message || 'Error adding blog. Please try again.');
      console.error('Error adding blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="add-blog-container">
      <div className="add-blog-box animate-slide-in">
        <h1 className="heading">Create a New Blog Post 📝</h1>
        <form className="blog-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="title">Blog Title</label>
            <input
              type="text"
              id="title"
              value={title}
              placeholder="Enter the title of your blog..."
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="image">Cover Image</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="image" className="file-input-label">
                <FontAwesomeIcon icon={faUpload} /> {imageFile ? imageFile.name : 'Choose an image'}
              </label>
            </div>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Content</label>
            <Editor
              apiKey="vm26iscrddva8boaks1s5t629zu1t29kl82qs5yztguenl7t"
              value={content}
              onEditorChange={handleEditorChange}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_style: 'body { font-family: Poppins, sans-serif; font-size: 16px; color: #333; background: #f9f9f9; }',
              }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              value={tags.join(', ')}
              placeholder="e.g., Health, Diet, Mental Health"
              onChange={handleTagInput}
              className="input-field"
            />
            {tags.length > 0 && (
              <div className="tag-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="btn-group">
            <button type="button" className="back-btn" onClick={handleBack} disabled={isSubmitting}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Publish Blog'}
            </button>
          </div>

          {error && <p className="error-message animate-fade-in">{error}</p>}
          {success && <p className="success-message animate-fade-in">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default AddBlog;