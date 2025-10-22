import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ✅ Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
      };
    }
  }
}

// ============================
// @desc   Protect Routes (Require Token)
// ============================
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // ✅ Check if decoded contains an id
    if (typeof decoded === "object" && "id" in decoded) {
      req.user = {
        id: decoded.id as string,
        role: (decoded as any).role || "user",
      };
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ============================
// @desc   Role Authorization
// ============================
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role || "")) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    next();
  };
};
