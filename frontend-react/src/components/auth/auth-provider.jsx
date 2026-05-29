"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearToken, clearUser, getToken, getUser, setToken, setUser } from "@/lib/auth-storage";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const bootstrap = async () => {
            const stored = getToken();
            const storedUser = getUser();
            if (stored) {
                setTokenState(stored);
            }
            if (storedUser) {
                setUser(storedUser);
            }
            try {
                const me = await apiFetch("/api/auth/me", { method: "GET" });
                if (me?.user) {
                    setUser(me.user);
                }
            }
            catch {
                try {
                    const refreshed = await apiFetch("/api/auth/refresh", { method: "POST" }, false);
                    if (refreshed?.token) {
                        setToken(refreshed.token);
                        setTokenState(refreshed.token);
                    }
                    if (refreshed?.user) {
                        setUser(refreshed.user);
                    }
                }
                catch {
                    clearToken();
                    clearUser();
                    setTokenState(null);
                    setUser(null);
                }
            }
            finally {
                setIsLoading(false);
            }
        };
        bootstrap();
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
    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" }, false);
        }
        catch {
        }
        clearToken();
        clearUser();
        setTokenState(null);
        setUser(null);
    };
    const value = useMemo(() => ({ user, token, isLoading, login, loginWithGoogle, register, logout }), [user, token, isLoading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
