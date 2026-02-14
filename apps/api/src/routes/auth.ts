import { Router } from "express";
import jwt from "jsonwebtoken";
import { users } from "../data/store.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  const match = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET || "dev-secret";

  const token = jwt.sign(
    { sub: match.id, role: match.role, name: match.name, department: match.department },
    secret,
    { expiresIn: "8h" }
  );

  return res.json({ token, role: match.role, name: match.name, userId: match.id, department: match.department, username: match.username });
});

export default router;
