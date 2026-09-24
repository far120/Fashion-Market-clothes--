import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginMutation } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      toast.success("Login successful ✅");
      navigate("/profile", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#353d9a_0%,#2b307b_48%,#8453ad_100%)] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-[#f7f7fb] p-6 shadow-[0_24px_70px_rgba(19,23,79,0.38)] sm:p-10">
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-full bg-[#dbdbe3] p-1.5">
          <Link
            to="/login"
            className="rounded-full bg-[linear-gradient(90deg,#ff6a8d_0%,#ff2f74_100%)] px-4 py-3 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(255,68,135,0.45)]"
            aria-current="page"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full px-4 py-3 text-center text-base font-bold text-white/80 transition hover:text-white"
          >
            Register
          </Link>
        </div>

        <h2 className="mb-8 text-center text-4xl font-extrabold tracking-wide text-[#171b3d]">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full rounded-2xl border px-5 py-3 pr-12 text-base outline-none transition ${errors.email
                ? "border-red-500 bg-red-50"
                : "border-[#d9def0] bg-[#edf2fc] focus:border-[#6f7eea]"
                }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email",
                },
              })}
            />
            <FiMail className="pointer-events-none absolute right-4 top-12 text-xl text-[#474d9d]" />
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full rounded-2xl border px-5 py-3 pr-12 text-base outline-none transition ${errors.password
                ? "border-red-500 bg-red-50"
                : "border-[#d5d9eb] bg-white shadow-[0_8px_16px_rgba(58,69,131,0.12)] focus:border-[#6f7eea]"
                }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-12 text-xl text-[#474d9d]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isDirty || loginMutation.isPending}
              onClick={() => reset()}
              className="rounded-2xl border border-[#cfd4ea] px-5 py-3 text-base font-semibold text-[#2a2f68] transition hover:bg-[#ecefff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!isValid || loginMutation.isPending}
              className="rounded-2xl bg-[linear-gradient(90deg,#3d3fa5_0%,#1d2146_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(31,35,82,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}