import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./api/db";
import { apiRoutes } from "./api/routes";
import { authRoutes } from "./api/auth";

// 👇 මෙතන තිබ්බ Vite Import එක අපි සම්පූර්ණයෙන්ම අයින් කරා!

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().catch(err => console.error("MongoDB Connection Error:", err));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// 👇 Dynamic Import එක (මේක Vercel එකේදී Run වෙන්නේ නැහැ, PC එකේ විතරයි)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  });
} else {
  // Production / Vercel සඳහා
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Local PC එකේදී විතරක් Listen කිරීම
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
