import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['project', 'dataset', 'research']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String, // Markdown content
    required: true
  },
  link: {
    type: String
  },
  tags: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Item = mongoose.model("Item", itemSchema);
