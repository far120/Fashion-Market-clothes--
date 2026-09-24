import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [dataInput, setDataInput] = useState({
    email: "",
    username: "",
    role: "",
    isActive: "",
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      username: "",
      email: "",
      role: "",
      isActive: "",
    },
  });

  const userQueryParams = {
    page,
    limit: 5,
    order: "desc",
    email: dataInput.email || undefined,
    username: dataInput.username || undefined,
    role: dataInput.role || undefined,
    isActive: dataInput.isActive || undefined,
  };

  const {
    usersQuery,
    changeRoleMutation,
    activateUserMutation,
    deleteUserMutation,
  } = useUser(userQueryParams);

  const handleRoleChange = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      await changeRoleMutation.mutateAsync({ userId: targetUser._id, role: nextRole });
      toast.success(`Role updated to ${nextRole} ✅`);
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleActivationToggle = async (targetUser) => {
    try {
      await activateUserMutation.mutateAsync(targetUser._id);
      toast.success(targetUser.isActive ? "User deactivated ✅" : "User activated ✅");
    } catch (err) {
      toast.error(err.message || "Failed to activate/deactivate user");
    }
  };

  const handleDelete = async (targetUser) => {
    const confirmed = window.confirm(
      `Delete user ${targetUser.username || targetUser.email}?`
    );
    if (!confirmed) return;

    try {
      await deleteUserMutation.mutateAsync(targetUser._id);
      toast.success("User deleted successfully ✅");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const onFilterSubmit = (data) => {
    setDataInput({
      email: (data.email || "").trim(),
      username: (data.username || "").trim(),
      role: data.role || "",
      isActive: data.isActive || "",
    });
    setPage(1);
  };

  const handleClearFilter = () => {
    reset({ username: "", email: "", role: "", isActive: "" });
    setDataInput({ email: "", username: "", role: "", isActive: "" });
    setPage(1);
  };

  if (usersQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {usersQuery.error.message}
        </div>
      </div>
    );
  }

  const usersData = usersQuery.data || {};
  const users = usersData.result || [];
  const totalPages = usersData.totalPages || 1;

  const isActionPending =
    changeRoleMutation.isPending ||
    activateUserMutation.isPending ||
    deleteUserMutation.isPending;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-6xl rounded-4xl border border-indigo-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur sm:p-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-6">
          <div>
            <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700">
              Admin Portal
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              User Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage permissions, toggle account statuses, and review active system users.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6">
          <form onSubmit={handleSubmit(onFilterSubmit)} className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Username</label>
                <input
                  type="text"
                  placeholder="Search by username"
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  {...register("username")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  {...register("email")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Role</label>
                <select
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  {...register("role")}
                >
                  <option value="">All roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Status</label>
                <select
                  className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  {...register("isActive")}
                >
                  <option value="">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:brightness-110 active:scale-95 lg:whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilter}
              className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              Clear
            </button>
          </form>

          {(dataInput.username || dataInput.email || dataInput.role || dataInput.isActive) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium">Filtering by:</span>
              {dataInput.username && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  user: {dataInput.username}
                </span>
              )}
              {dataInput.email && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  email: {dataInput.email}
                </span>
              )}
              {dataInput.role && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  role: {dataInput.role}
                </span>
              )}
              {dataInput.isActive && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  status: {dataInput.isActive === "true" ? "active" : "inactive"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-3xl border border-indigo-100 bg-white shadow-[0_14px_32px_rgba(30,41,59,0.06)]">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50/80 text-left text-indigo-900 border-b border-indigo-100">
              <tr>
                <th className="px-6 py-4 font-bold">Username</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isCurrentUser = item._id === currentUser?._id;

                return (
                  <tr key={item._id} className="border-t border-indigo-50 hover:bg-indigo-50/40 transition-colors text-slate-700">
                    <td className="px-6 py-4 font-bold text-slate-950">{item.username}</td>
                    <td className="px-6 py-4 text-slate-600">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${item.isActive
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.isActive ? "bg-indigo-500" : "bg-rose-500"
                          }`}></span>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleRoleChange(item)}
                          disabled={isActionPending || isCurrentUser}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {item.role === "admin" ? "Make User" : "Make Admin"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActivationToggle(item)}
                          disabled={isActionPending || isCurrentUser}
                          className="rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-900 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isActionPending || isCurrentUser}
                          className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-xs font-bold text-rose-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="text-5xl mb-3">📭</div>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 px-6 py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || usersQuery.isFetching}
            className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Page <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg">{page}</span> of <span className="text-indigo-700 font-bold">{totalPages}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || usersQuery.isFetching}
            className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}
