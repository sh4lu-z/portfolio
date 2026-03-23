import { Router } from "express";
import jwt from "jsonwebtoken";

export const authRoutes = Router();

authRoutes.post("/login", (req, res) => {
  const { adminKey } = req.body;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "ADMIN_SECRET not configured on server" });
  }

  if (adminKey === secret) {
    // Generate JWT
    const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "24h" });
    
    // Set HttpOnly cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid Admin Key" });
  }
});

authRoutes.post("/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

authRoutes.get("/check", (req, res) => {
  const token = req.cookies.admin_token;
  const secret = process.env.ADMIN_SECRET;

  if (!token || !secret) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, secret);
    res.json({ authenticated: true });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

// Middleware to protect routes
export const requireAdmin = (req: any, res: any, next: any) => {
  const token = req.cookies.admin_token;
  const secret = process.env.ADMIN_SECRET;

  if (!token || !secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
