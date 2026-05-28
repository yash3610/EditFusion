"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth-storage";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    useEffect(() => {
        const stored = getToken();
        if (stored) {
            setTokenState(stored);
        }
    }, []);
    const login = async (email, password) => {
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
    };
    const loginWithGoogle = async (idToken) => {
        const data = await apiFetch("/api/auth/google/token", {
            method: "POST",
            body: JSON.stringify({ idToken }),
        });
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
    };
    const register = async (name, email, password) => {
        const data = await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });
        setToken(data.token);
        setTokenState(data.token);
        setUser(data.user);
    };
    const logout = () => {
        clearToken();
        setTokenState(null);
        setUser(null);
    };
    const value = useMemo(() => ({ user, token, login, loginWithGoogle, register, logout }), [user, token]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
