import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewblogs.css'; // Custom CSS for the blog cards
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
// import placeholder from '../../../assets/placeholder.webp';
import { htmlToText } from 'html-to-text';

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/app/doctor/all-blogs?page=${page}&limit=10`);
        setBlogs(response.data);
        setTotalPages(response.data.totalPages);
        setLoading(false);
        setLoadingMore(false);
      } catch (err) {
        setError('Failed to fetch blogs');
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchBlogs();
  }, [page]);

  const handleEditBlog = (e, blogId) => {
    e.stopPropagation();
    navigate(`/edit-blog/${blogId}`);
  };

  const handleDeleteBlog = async (e, blogId) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/blogs/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError('Failed to delete blog');
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/${blogId}`);
  };

  const loadMorePosts = () => {
    if (page < totalPages) {
      setLoadingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  if (loading) return <div className="loading">Loading blogs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="blogs-section">
      <header className="blogs-header">
        <h2>Health & Wellness Blogs</h2>
        <p>Discover the latest insights from the CarePulse community</p>
      </header>

      <div className="blogs-list">
        {blogs.map(blog => {
          const plainTextContent = htmlToText(blog.content, {
            limits: { maxInputLength: 100000 },
            preserveNewlines: false,
          }).replace(/--+/g, ' ');
          const truncatedContent = plainTextContent.split(" ").slice(0, 20).join(" ") + '...';

          return (
            <div className="blog-card" key={blog._id} onClick={() => handleBlogClick(blog._id)}>
              <div className="blog-image-container">
                <img
                  src={blog.imageURL || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={blog.title}
                  className="blog-image"
                />
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-meta">By Dr. {blog.doctor.name}</p>
                <p className="blog-text">{truncatedContent}</p>
                {/* <div className="blog-actions">
                  <button className="action-btn edit" onClick={(e) => handleEditBlog(e, blog._id)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="action-btn delete" onClick={(e) => handleDeleteBlog(e, blog._id)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      {page < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMorePosts} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More Blogs'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewBlogs;