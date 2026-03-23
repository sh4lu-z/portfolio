import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./api/db.js";
import { apiRoutes } from "./api/routes.js";
import { authRoutes } from "./api/auth.js";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Database එකට Connect වීම 
connectDB();

// 2. Middlewares
app.use(express.json());
app.use(cookieParser());

// 3. API Routes 
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// 4. Vite middleware
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
  });
} else {
  // Production සඳහා Static files
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
