import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-7xl rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] sm:p-10">
        <div className="mb-8 rounded-full bg-indigo-50 p-1.5 sm:w-fit">
          <div className="rounded-full bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-8 py-3 text-center text-base font-bold text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)]">
            Welcome to the Smart Fashion Market System
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-wide text-slate-900 sm:text-5xl">
          Smart Fashion Market Operations, Beautifully Managed
        </h1>
        <p className="mb-8 max-w-3xl text-lg text-slate-600 sm:text-xl">
          From menu browsing and ordering to product, category, and order administration, everything runs from one clean, modern interface.
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            to="/menu"
            className="rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-8 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.3)] transition hover:brightness-110"
          >
            Explore Menu
          </Link>

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-8 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-100/60"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-8 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-100/60"
              >
                Create Account
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-8 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-100/60"
              >
                My Orders
              </Link>
              <Link
                to="/reviews"
                className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-8 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-100/60"
              >
                Reviews
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="rounded-2xl bg-[linear-gradient(90deg,#312e81_0%,#1e1b4b_100%)] px-8 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(30,27,75,0.35)] transition hover:brightness-110"
                >
                  Open Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { title: "Menu & Cart", desc: "Browse items, search quickly, and build orders in seconds." },
            { title: "Reviews", desc: "Collect customer ratings and feedback tied to each product." },
            { title: "Admin Control", desc: "Manage products, categories, and order statuses from one place." },
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-[0_8px_16px_rgba(30,41,59,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(30,41,59,0.08)]"
            >
              <h2 className="mb-2 text-2xl font-bold text-indigo-900">{feature.title}</h2>
              <p className="text-slate-600">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}