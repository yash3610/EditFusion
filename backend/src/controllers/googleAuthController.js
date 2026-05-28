import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { createToken } from "../services/token.js";

const googlePayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  googleId: z.string().min(3),
  avatarUrl: z.string().url().optional(),
});

export const handleGoogleCallback = async (req, res, next) => {
  try {
    const payload = googlePayloadSchema.parse(req.body);
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        avatarUrl: payload.avatarUrl,
      });
    } else if (!user.googleId) {
      user.googleId = payload.googleId;
      user.avatarUrl = payload.avatarUrl;
      await user.save();
    }

    const token = createToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      redirectUrl: `${env.FRONTEND_URL}/dashboard`,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    const profile = await response.json();
    if (!response.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload = googlePayloadSchema.parse({
      email: profile.email,
      name: profile.name || profile.given_name || "Google User",
      googleId: profile.sub,
      avatarUrl: profile.picture,
    });

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        avatarUrl: payload.avatarUrl,
      });
    } else if (!user.googleId) {
      user.googleId = payload.googleId;
      user.avatarUrl = payload.avatarUrl;
      await user.save();
    }

    const token = createToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
