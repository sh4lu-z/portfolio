import { Router } from "express";
import { Item } from "./models.js";
import { requireAdmin } from "./auth.js";

export const apiRoutes = Router();

// Get items by type
apiRoutes.get("/items/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const items = await Item.find({ type }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Create a new item
apiRoutes.post("/items", requireAdmin, async (req, res) => {
  try {
    const { type, title, description, link, tags } = req.body;
    
    if (!type || !title || !description) {
      return res.status(400).json({ error: "Type, title, and description are required." });
    }

    const newItem = new Item({
      type,
      title,
      description,
      link,
      tags: tags ? tags.split(",").map((t: string) => t.trim()) : []
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete an item
apiRoutes.delete("/items/:id", requireAdmin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});
