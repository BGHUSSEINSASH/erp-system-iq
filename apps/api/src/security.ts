import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { hasPermission, type Permission, type Role } from "./rbac.js";

type AuthPayload = {
  sub: string;
  role: Role;
};

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ message: "Missing Authorization header" });
    return;
  }

  const token = header.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, () => {
      const user = req.user as AuthPayload | undefined;
      if (!user || !hasPermission(user.role, permission)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      next();
    });
  };
}
