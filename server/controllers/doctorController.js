import jwt from 'jsonwebtoken';
import DoctorCredentials from '../models/doctorCredentials.js'; // Adjust import based on your project structure
import Doctor from '../models/Doctor.js';

import { populate } from 'dotenv';
import Blog from '../models/Blog.js';

export const doctorLogin = async (req, res) => {
  const { doctorId, key } = req.body;

  try {
    const doctor = await DoctorCredentials.findOne({ doctorId, key });

    if (!doctor || doctor.isUsed) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ doctorId }, 'secret', { expiresIn: '1h' });

    // 1 hour
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error in doctor login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).populate({ path: 'appointments', populate: { path: 'createdBy', populate : {path: 'userDetails'} } }).populate('Blogs')
    if (!doctor) {
      return res.status(404).json({ message: "No doctor found" })
    }
    res.status(200).json({ doctor, message: 'Doctor FOund' })
  } catch (error) {
    console.log('Error to find doctor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const addDocBlog = async (req, res) => {
  try {
    const { doctor, title, content, imageURL, tags } = req.body;
    const newDoctor = await Doctor.findById(doctor)
    if (!newDoctor) return res.status(404).json({ message: 'No Doctor Found' })
    const blog = new Blog({
      doctor, title, content, imageURL, tags
    })
    const savedBlog = await blog.save()
    newDoctor.Blogs.push(savedBlog._id)
    await newDoctor.save()
    res.status(201).json(savedBlog)
  } catch (error) {
    res.status(500).json({ message: 'Error adding blog', error });
  }
}

export const fetchBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('doctor')
    if (!blogs) return res.status(404).json({ message: 'No Blogs Found' })
    res.status(200).json(blogs)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const fetchBlogById = async (req, res) => {
  try {
    const {blogId} = req.params
    const blog = await Blog.findById(blogId).populate('doctor')
    if (!blog) return res.status(404).json({ message: 'No Blog found' })
    return res.status(200).json(blog)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const editBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content, tags, imageURL } = req.body; // Image URL will be passed from the frontend

    let blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Update the blog fields
    blog.title = title || blog.title;
    blog.content = content || blog.content; 
    blog.tags = tags || blog.tags;
    blog.imageURL = imageURL || blog.imageURL; // Directly update image URL

    await blog.save();
    res.status(200).json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Server error while updating blog' });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the blog by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Remove the blog reference from the doctor's Blogs array
    await Doctor.findByIdAndUpdate(blog.doctor, {
      $pull: { Blogs: blogId },
    });

    // Delete the blog
    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Server error while deleting blog' });
  }
};
