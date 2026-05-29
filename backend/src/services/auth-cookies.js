import { env } from "../config/env.js";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api/auth",
};

export const setRefreshCookie = (res, token) => {
  res.cookie("ef_refresh", token, {
    ...refreshCookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie("ef_refresh", refreshCookieOptions);
};
