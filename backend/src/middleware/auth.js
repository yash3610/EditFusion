import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export const requireAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "editfusion",
      audience: "editfusion:web",
    });
    const user = await User.findById(payload.sub).select("_id email name avatarUrl tokenVersion");
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
    next();
  } catch {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    next(error);
  }
};
