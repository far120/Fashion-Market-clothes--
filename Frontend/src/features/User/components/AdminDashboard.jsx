import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiClock, FiPackage, FiShield, FiUsers } from "react-icons/fi";
import { useAuth } from "../../auth/hooks/useAuth";

export default function AdminDashboard() {
  const { isAdmin, isManager } = useAuth();
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-7xl rounded-4xl border border-indigo-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_14px_32px_rgba(30,41,59,0.06)]">
            <p className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">
              Admin Hub
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Choose the right dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Split the administration experience into two clear operating rooms: commerce for products and orders,
              and people for users and activity logs.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {isAdmin && (
              <Link
                to="/admin/dashboard/products"
                className="group rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-5 py-4 text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:brightness-110 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">Commerce</p>
                    <h2 className="mt-1 text-lg font-black">Products and orders</h2>
                  </div>
                  <FiPackage className="text-2xl text-indigo-200 transition group-hover:translate-x-1" />
                </div>
              </Link>
              )}

               { isManager && (
              <Link
                to="/admin/dashboard/users"
                className="group rounded-2xl bg-[linear-gradient(90deg,#312e81_0%,#1e1b4b_100%)] px-5 py-4 text-white shadow-[0_10px_24px_rgba(30,41,59,0.18)] transition hover:brightness-110 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">People</p>
                    <h2 className="mt-1 text-lg font-black">Users and logs</h2>
                  </div>
                  <FiUsers className="text-2xl text-indigo-200 transition group-hover:translate-x-1" />
                </div>
              </Link>
               )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Navigation</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">Two focused dashboards</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Design</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">Premium global look</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Flow</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">Less clutter, more clarity</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-indigo-900 bg-[radial-gradient(circle_at_top_left,#252b78_0%,#181b40_50%,#2d1b54_100%)] p-6 text-white shadow-[0_18px_50px_rgba(30,41,59,0.18)]">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              Command Overview
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
               {isAdmin && (
                <>
              <Link
                to="/admin/products"
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Manage</p>
                <h3 className="mt-2 text-lg font-black">Products</h3>
              </Link>
              <Link
                to="/admin/orders"
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Review</p>
                <h3 className="mt-2 text-lg font-black">Orders</h3>
              </Link>
                </>
               )}
              {isManager && (
                <>
              <Link
                to="/admin/users"
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Manage</p>
                <h3 className="mt-2 text-lg font-black">Users</h3>
              </Link>
              <Link
                to="/admin/logs"
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Inspect</p>
                <h3 className="mt-2 text-lg font-black">Logs</h3>
              </Link>
                </>
                )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <FiBarChart2 className="text-2xl text-indigo-300" />
                <div>
                  <p className="text-sm font-semibold text-indigo-200">System posture</p>
                  <p className="text-sm text-slate-300">Each dashboard now has a single purpose and a cleaner visual hierarchy.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
              <FiClock className="text-indigo-300" />
              <span>Optimized for quick admin access across desktop and mobile.</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
