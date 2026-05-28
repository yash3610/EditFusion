"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
export default function LoginPage() {
    const { login, loginWithGoogle, token } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate, token]);
    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId)
            return;
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => {
            if (!window.google)
                return;
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        await loginWithGoogle(response.credential);
                        toast({ title: "Signed in", description: "Google login successful." });
                        navigate("/dashboard");
                    }
                    catch (error) {
                        toast({
                            title: "Google login failed",
                            description: error.message,
                            variant: "destructive",
                        });
                    }
                },
            });
            window.google.accounts.id.renderButton(document.getElementById("google-signin"), {
                theme: "outline",
                size: "large",
                width: 320,
            });
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [loginWithGoogle, navigate, toast]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast({ title: "Welcome back", description: "Login successful." });
            navigate("/dashboard");
        }
        catch (error) {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsx("div", { className: "mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16", children: _jsxs("div", { className: "glass-card w-full max-w-md rounded-3xl p-8", children: [_jsx("h1", { className: "text-display text-3xl font-semibold", children: "Sign in" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Access your EditFusion workspace." }), _jsxs("form", { className: "mt-6 space-y-4", onSubmit: handleSubmit, children: [_jsx("input", { type: "email", required: true, placeholder: "Email", className: "w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm", value: email, onChange: (event) => setEmail(event.target.value) }), _jsx("input", { type: "password", required: true, placeholder: "Password", className: "w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm", value: password, onChange: (event) => setPassword(event.target.value) }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground", children: isLoading ? "Signing in..." : "Sign in" })] }), _jsxs("div", { className: "my-6 flex items-center gap-3 text-xs text-muted-foreground", children: [_jsx("span", { className: "h-px flex-1 bg-border/60" }), "Or", _jsx("span", { className: "h-px flex-1 bg-border/60" })] }), _jsx("div", { id: "google-signin", className: "flex justify-center" }), _jsxs("p", { className: "mt-6 text-sm text-muted-foreground", children: ["New here?", " ", _jsx(Link, { to: "/register", className: "text-primary", children: "Create an account" })] })] }) }) }));
}
