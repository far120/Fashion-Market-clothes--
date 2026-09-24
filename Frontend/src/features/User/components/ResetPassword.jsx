import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { resetPasswordMutation } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data) => {
    try {
      await resetPasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully. Please login again.");
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#353d9a_0%,#2b307b_48%,#8453ad_100%)] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-[#f7f7fb] p-6 shadow-[0_24px_70px_rgba(19,23,79,0.38)] sm:p-10">
        <div className="mb-8 rounded-full bg-[#dbdbe3] p-1.5 sm:w-fit">
          <div className="rounded-full bg-[linear-gradient(90deg,#ff6a8d_0%,#ff2f74_100%)] px-8 py-3 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(255,68,135,0.45)]">
            Reset Password
          </div>
        </div>

        <h1 className="mb-3 text-center text-4xl font-extrabold tracking-wide text-[#171b3d]">
          Change Password
        </h1>
        <p className="mb-8 text-center text-sm text-[#5a5f85] sm:text-base">
          Enter your current password and choose a new secure password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full rounded-2xl border border-[#d5d9eb] bg-white px-5 py-3 text-base outline-none shadow-[0_8px_16px_rgba(58,69,131,0.12)] transition focus:border-[#6f7eea]"
              {...register("currentPassword", {
                required: "Current password is required",
                minLength: {
                  value: 6,
                  message: "Must be at least 6 characters",
                },
              })}
            />
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              New Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="w-full rounded-2xl border border-[#d5d9eb] bg-white px-5 py-3 text-base outline-none shadow-[0_8px_16px_rgba(58,69,131,0.12)] transition focus:border-[#6f7eea]"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Must be at least 6 characters",
                },
              })}
            />
            {errors.newPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-2xl border border-[#d5d9eb] bg-white px-5 py-3 text-base outline-none shadow-[0_8px_16px_rgba(58,69,131,0.12)] transition focus:border-[#6f7eea]"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (val) =>
                  val === newPasswordValue || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isDirty || resetPasswordMutation.isPending}
              onClick={() => reset()}
              className="rounded-2xl border border-[#cfd4ea] px-5 py-3 text-base font-semibold text-[#2a2f68] transition hover:bg-[#ecefff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!isValid || resetPasswordMutation.isPending}
              className="rounded-2xl bg-[linear-gradient(90deg,#3d3fa5_0%,#1d2146_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(31,35,82,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
