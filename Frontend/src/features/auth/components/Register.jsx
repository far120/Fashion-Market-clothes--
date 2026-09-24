import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const navigate = useNavigate();
  const { registerMutation } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    try {
      const userData = {
        email: data.email,
        password: data.password,
        username: data.username,
      };

      await registerMutation.mutateAsync(userData);
      toast.success("Registration successful ✅");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Registration failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#353d9a_0%,#2b307b_48%,#8453ad_100%)] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-[#f7f7fb] p-6 shadow-[0_24px_70px_rgba(19,23,79,0.38)] sm:p-10">
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-full bg-[#dbdbe3] p-1.5">
          <Link
            to="/login"
            className="rounded-full px-4 py-3 text-center text-base font-bold text-white/80 transition hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-[linear-gradient(90deg,#ff6a8d_0%,#ff2f74_100%)] px-4 py-3 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(255,68,135,0.45)]"
            aria-current="page"
          >
            Register
          </Link>
        </div>

        <h2 className="mb-8 text-center text-4xl font-extrabold tracking-wide text-[#171b3d]">
          Create Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className={`w-full rounded-2xl border px-5 py-3 text-base outline-none transition ${errors.username
                ? "border-red-500 bg-red-50"
                : "border-[#d9def0] bg-[#edf2fc] focus:border-[#6f7eea]"
                }`}
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`w-full rounded-2xl border px-5 py-3 text-base outline-none transition ${errors.email
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
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className={`w-full rounded-2xl border px-5 py-3 text-base outline-none transition ${errors.password
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
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Retype your password"
              className={`w-full rounded-2xl border px-5 py-3 text-base outline-none transition ${errors.confirmPassword
                ? "border-red-500 bg-red-50"
                : "border-[#d5d9eb] bg-white shadow-[0_8px_16px_rgba(58,69,131,0.12)] focus:border-[#6f7eea]"
                }`}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) =>
                  val === passwordValue || "Passwords do not match.",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-3 text-sm text-[#4f5376]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#b7bfd8] text-[#393e98] focus:ring-[#626ee0]"
                {...register("termsAccepted", {
                  required: "You must accept the terms.",
                })}
              />
              I agree to the terms and conditions
            </label>
            {errors.termsAccepted && (
              <p className="mt-2 text-sm font-medium text-red-500">
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isDirty || registerMutation.isPending}
              onClick={() => reset()}
              className="rounded-2xl border border-[#cfd4ea] px-5 py-3 text-base font-semibold text-[#2a2f68] transition hover:bg-[#ecefff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!isValid || registerMutation.isPending}
              className="rounded-2xl bg-[linear-gradient(90deg,#3d3fa5_0%,#1d2146_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(31,35,82,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {registerMutation.isPending ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}