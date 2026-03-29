import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coffee, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  // Redirect already-authenticated users (must be in effect, not during render)
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/pos", { replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setServerError("");
    try {
      const session = login(email, password);
      navigate(session.role === "admin" ? "/admin" : "/pos", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left: Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#F9F7E8]">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-sage-800 flex items-center justify-center shadow-md">
              <Coffee size={22} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-extrabold text-sage-900 tracking-tight">Green Grounds</p>
              <p className="text-xs text-sage-500 font-medium">Coffee Management System</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-sage-900 mb-1">Welcome back</h1>
          <p className="text-sm text-sage-500 mb-8">Sign in to continue to your dashboard</p>

          {/* Demo credentials callout */}
          <div className="bg-sage-100 border border-sage-200 rounded-2xl p-4 mb-6 text-xs text-sage-700 space-y-1">
            <p className="font-semibold text-sage-800 mb-1">Demo accounts</p>
            <p>🛡️ <strong>Admin</strong> — admin@coffee.com / password</p>
            <p>👤 <strong>Staff</strong>  — staff@coffee.com &nbsp;/ password</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox id="remember" />
                <span className="text-xs text-sage-600">Remember me</span>
              </label>
              <button type="button" className="text-xs text-sage-600 hover:text-sage-900 underline underline-offset-2">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-sm text-center text-sage-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-sage-800 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Image Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&auto=format&fit=crop"
          alt="Coffee shop interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/80 via-sage-900/30 to-transparent" />

        {/* Quote */}
        <div className="relative mt-auto p-12 text-white">
          <p className="text-4xl font-extrabold leading-tight mb-3">
            Craft Every Cup.<br />Own Every Day.
          </p>
          <p className="text-sage-200 text-sm max-w-xs">
            Manage your coffee shop with precision — from the first espresso to the last latte.
          </p>
        </div>
      </div>
    </div>
  );
}
