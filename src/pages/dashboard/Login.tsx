import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        await register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
        toast({ title: "Account created", description: "Welcome to ResumeIQ!" });
      } else {
        await login(form.email, form.password);
        toast({ title: "Welcome back", description: "Login successful." });
      }
      navigate("/candidate");
    } catch (err: any) {
      toast({
        title: isRegister ? "Registration failed" : "Login failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex bg-gradient-hero p-12 flex-col justify-between text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <Link to="/" className="relative flex items-center gap-2 font-display font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-white/15 backdrop-blur grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          ResumeIQ
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Real-time hiring intelligence at your fingertips.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Sign in to upload resumes, rank candidates instantly, and close roles faster.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-bold">
            {isRegister ? "Create account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isRegister
              ? "Sign up to start analyzing your resume."
              : "Sign in to your ResumeIQ account."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="h-11"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-accent hover:opacity-90 shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRegister ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-primary font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-primary font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

