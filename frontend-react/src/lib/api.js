export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const apiFetch = async (path, options = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ef_token") : null;
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token)
        headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;
    if (!response.ok) {
        const message = data?.message || "Request failed";
        throw new Error(message);
    }
    return data;
};
