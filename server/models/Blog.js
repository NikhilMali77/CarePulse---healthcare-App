import mongoose from 'mongoose'
const Schema = mongoose.Schema

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Refers to the doctor/admin who created the post
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  imageURL: {type: String, required: true},
  tags: [{ type: String }], // Categories like 'Health', 'Diet', 'Mental Health'
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const Blog = mongoose.model('Blog', blogSchema)
export default Blog