import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const baseClaims = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl,
  tokenVersion: user.tokenVersion || 0,
});

export const createAccessToken = (user) => {
  return jwt.sign(baseClaims(user), env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: "editfusion",
    audience: "editfusion:web",
  });
};

export const createRefreshToken = (user) => {
  return jwt.sign(baseClaims(user), env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: "editfusion",
    audience: "editfusion:web",
  });
};

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET, {
  issuer: "editfusion",
  audience: "editfusion:web",
});
