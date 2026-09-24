import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../../../components/ui/Spinner.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useUser } from "../hooks/useUser.js";

export default function Profile() {
  const { user, isBootstrapping } = useAuth();
  const { updateProfileMutation } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await updateProfileMutation.mutateAsync({
        username: data.username.trim(),
        email: data.email.trim(),
      });
      toast.success("Profile updated successfully ✅");
    } catch (error) {
      toast.error(error.message || "Failed to update profile ❌");
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#353d9a_0%,#2b307b_48%,#8453ad_100%)] px-4 py-10 sm:py-16">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl bg-[#f7f7fb] p-8 text-center shadow-[0_24px_70px_rgba(19,23,79,0.38)] sm:p-10">
          <div className="mb-4 rounded-full bg-[#ecefff] px-4 py-1 text-sm font-bold tracking-wide text-[#5057a1]">
            Profile
          </div>
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-semibold text-[#2b3278]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#353d9a_0%,#2b307b_48%,#8453ad_100%)] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-[#f7f7fb] p-6 shadow-[0_24px_70px_rgba(19,23,79,0.38)] sm:p-10">
        <div className="mb-8 rounded-full bg-[#dbdbe3] p-1.5">
          <div className="rounded-full bg-[linear-gradient(90deg,#ff6a8d_0%,#ff2f74_100%)] px-4 py-3 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(255,68,135,0.45)]">
            Profile Settings
          </div>
        </div>

        <h1 className="mb-3 text-center text-4xl font-extrabold tracking-wide text-[#171b3d]">
          My Profile
        </h1>
        <p className="mb-8 text-center text-sm text-[#5a5f85] sm:text-base">
          Update your account details using your profile manager.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#171b3d]">
              Username
            </label>
            <input
              type="text"
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

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isDirty || updateProfileMutation.isPending}
              onClick={() =>
                reset({
                  username: user?.username || "",
                  email: user?.email || "",
                })
              }
              className="rounded-2xl border border-[#cfd4ea] px-5 py-3 text-base font-semibold text-[#2a2f68] transition hover:bg-[#ecefff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!isValid || !isDirty || updateProfileMutation.isPending}
              className="rounded-2xl bg-[linear-gradient(90deg,#3d3fa5_0%,#1d2146_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(31,35,82,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-[#d9def0] bg-white p-5 shadow-[0_8px_16px_rgba(58,69,131,0.08)]">
          <h2 className="text-xl font-bold text-[#2c3380]">Security</h2>
          <p className="mt-2 text-sm text-[#5d6288]">
            If you think your password is weak or exposed, update it now.
          </p>

          <Link
            to="/reset-password"
            className="mt-4 inline-flex rounded-2xl bg-[linear-gradient(90deg,#3d3fa5_0%,#1d2146_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(31,35,82,0.35)] transition hover:brightness-110"
          >
            Reset Password
          </Link>
        </section>
      </div>
    </div>
  );
}