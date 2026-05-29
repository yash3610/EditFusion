import { setToken, setUser, getToken } from "@/lib/auth-storage";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const refreshSession = async () => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    if (data?.token) {
        setToken(data.token);
    }
    if (data?.user) {
        setUser(data.user);
    }
    return data;
};

export const apiFetch = async (path, options = {}, retry = true) => {
    const token = typeof window !== "undefined" ? getToken() : null;
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;
    if (response.status === 401 && retry && !path.startsWith("/api/auth")) {
        const refreshed = await refreshSession();
        if (refreshed) {
            return apiFetch(path, options, false);
        }
    }
    if (!response.ok) {
        const message = data?.message || "Request failed";
        throw new Error(message);
    }
    return data;
};
