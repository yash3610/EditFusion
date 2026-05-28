export const getToken = () => {
    if (typeof window === "undefined")
        return null;
    return localStorage.getItem("ef_token");
};
export const setToken = (token) => {
    if (typeof window === "undefined")
        return;
    localStorage.setItem("ef_token", token);
};
export const clearToken = () => {
    if (typeof window === "undefined")
        return;
    localStorage.removeItem("ef_token");
};
