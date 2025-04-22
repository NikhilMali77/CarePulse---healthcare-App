import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './blogpost.css';
import { formatDistanceToNow } from 'date-fns';

function BlogPost() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const navigate = useNavigate();

  // Function to navigate back
  const backFunction = () => {
    navigate(-1);
  };

  // Fetch the blog data when the component mounts
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/app/doctor/blog/${blogId}`); // Adjust API endpoint as needed
        setBlog(response.data);
        console.log(blog)
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (!blog) {
    return <h1>Loading...</h1>; // Loading state while fetching the blog data
  }

  const timeAgo = formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true });

  return (
    <div className="upper">
      <div className="mainV"> {/* Removed lightMode reference */}
        <h1>{blog.title}</h1>
        <div className="imgClass">
          <img className="blogImg" src={blog.imageURL} alt={blog.title} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: blog.content }} /> {/* Render blog content */}
        <p className='timeClass'><span>Posted {timeAgo}</span></p>
        <p>Posted by {blog.doctor.name}</p>
        <div className="blogBtns">
          <button onClick={backFunction} className="backBtn">Back</button> {/* Back button to navigate */}
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
