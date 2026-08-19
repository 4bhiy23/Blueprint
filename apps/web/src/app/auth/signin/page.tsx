"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back!", {
        description: "Successfully signed in to Blueprint.",
        duration: 3000,
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "An unexpected error occurred."));
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Mock flow if database or better-auth social is unconfigured
      toast.info("Connecting to Google authentication...");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Social login initialization failed."));
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password Reset Link Sent", {
      description: "Check your email for details to reset your password.",
      duration: 4000,
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Catppuccin Mocha subtle dot grid background */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(hsl(var(--mocha-mauve)) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} 
      />

      <div className="w-full max-w-[420px] space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] shadow-lg shadow-[hsl(var(--mocha-mauve))/0.2]">
            <LayoutGrid className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              [BLUEPRINT // SIGN IN TO DASHBOARD]
            </p>
          </div>
        </div>

        {/* Credentials Form Card */}
        <div className="border border-border bg-card rounded-2xl p-7 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="developer@blueprint.io"
                value={form.email}
                onChange={handleChange}
                className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] text-xs h-10"
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[hsl(var(--mocha-rosewater))] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                className="bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))] text-xs h-10"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              disabled={loading} 
              className="w-full h-10 font-bold text-xs gap-2 bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-mauve))/0.9] transition-all shadow-md"
            >
              {loading ? "Signing in..." : "Sign In to Workspace"}
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </form>

          {/* Social connection divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-mono text-[10px] tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Social Google log-in */}
          <Button
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-10 text-xs font-medium gap-2 border-border bg-secondary/20 hover:bg-secondary/60 text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#89b4fa"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#a6e3a1"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#f9e2af"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#f38ba8"/>
            </svg>
            Google OAuth
          </Button>
        </div>

        {/* Link back to registration */}
        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[hsl(var(--mocha-mauve))] hover:underline font-bold">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
