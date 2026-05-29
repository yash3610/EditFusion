export const getToken = () => {
    if (typeof window === "undefined")
        return null;
    return localStorage.getItem("ef_token");
};

export const getUser = () => {
    if (typeof window === "undefined")
        return null;
    const raw = localStorage.getItem("ef_user");
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
export const setToken = (token) => {
    if (typeof window === "undefined")
        return;
    localStorage.setItem("ef_token", token);
};

export const setUser = (user) => {
    if (typeof window === "undefined")
        return;
    localStorage.setItem("ef_user", JSON.stringify(user));
};
export const clearToken = () => {
    if (typeof window === "undefined")
        return;
    localStorage.removeItem("ef_token");
};

export const clearUser = () => {
    if (typeof window === "undefined")
        return;
    localStorage.removeItem("ef_user");
};
