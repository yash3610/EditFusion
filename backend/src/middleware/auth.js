import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    next(error);
  }
};
