"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
export default function RegisterPage() {
    const { register, token } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate, token]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password);
            toast({ title: "Account created", description: "Welcome to EditFusion." });
            navigate("/dashboard");
        }
        catch (error) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsx("div", { className: "mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16", children: _jsxs("div", { className: "glass-card w-full max-w-md rounded-3xl p-8", children: [_jsx("h1", { className: "text-display text-3xl font-semibold", children: "Create account" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Start building with EditFusion." }), _jsxs("form", { className: "mt-6 space-y-4", onSubmit: handleSubmit, children: [_jsx("input", { type: "text", required: true, placeholder: "Name", className: "w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm", value: name, onChange: (event) => setName(event.target.value) }), _jsx("input", { type: "email", required: true, placeholder: "Email", className: "w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm", value: email, onChange: (event) => setEmail(event.target.value) }), _jsx("input", { type: "password", required: true, placeholder: "Password", className: "w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm", value: password, onChange: (event) => setPassword(event.target.value) }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground", children: isLoading ? "Creating..." : "Create account" })] }), _jsxs("p", { className: "mt-6 text-sm text-muted-foreground", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "text-primary", children: "Sign in" })] })] }) }) }));
}
