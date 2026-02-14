import type { Role } from "./rbac.js";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: Role };
    }
  }
}

export {};
