import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./api/db.js";
import { apiRoutes } from "./api/routes.js";
import { authRoutes } from "./api/auth.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to MongoDB
  await connectDB();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api", apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
