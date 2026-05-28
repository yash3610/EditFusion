"use client";
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
    return (<div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="glass-card w-full max-w-md rounded-3xl p-8">
          <h1 className="text-display text-3xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building with EditFusion.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input type="text" required placeholder="Name" className="w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm" value={name} onChange={(event) => setName(event.target.value)}/>
            <input type="email" required placeholder="Email" className="w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm" value={email} onChange={(event) => setEmail(event.target.value)}/>
            <input type="password" required placeholder="Password" className="w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm" value={password} onChange={(event) => setPassword(event.target.value)}/>
            <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
              {isLoading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>);
}
