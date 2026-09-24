import { useState } from "react";
import { useForm } from "react-hook-form";
import Spinner from "../../../components/ui/Spinner";
import { useUser } from "../hooks/useUser";

export default function AdminUserLogs() {
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const logQueryParams = {
    page,
    order: "desc",
    email: emailFilter || undefined,
  };

  const { logsQuery } = useUser(null, logQueryParams);

  function onFilterSubmit(data) {
    setPage(1);
    setEmailFilter((data.email || "").trim());
  }

  function handleClearFilter() {
    reset({ email: "" });
    setEmailFilter("");
    setPage(1);
  }

  if (logsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (logsQuery.isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {logsQuery.error.message}
        </div>
      </div>
    );
  }

  const logsData = logsQuery.data || {};
  const logs = logsData.result || [];
  const totalPages = logsData.totalPages || 1;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-6xl rounded-4xl border border-indigo-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur sm:p-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-6">
          <div>
            <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700">
              Audit & Security
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              User Activity Logs
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Trace endpoint calls, request methods, user emails, and response status codes.
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_14px_32px_rgba(30,41,59,0.06)]">
          <div className="border-b border-indigo-100 bg-indigo-50/50 p-6">
            <form onSubmit={handleSubmit(onFilterSubmit)} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by email address..."
                  className="w-full rounded-2xl border border-indigo-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  {...register("email")}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:brightness-110 active:scale-95 sm:whitespace-nowrap"
              >
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

            {emailFilter && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-slate-600 font-medium">Filtering by:</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  {emailFilter}
                  <button onClick={handleClearFilter} className="hover:text-indigo-900">
                    ✕
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-indigo-100 bg-indigo-50/80 text-left text-indigo-900">
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Method</th>
                  <th className="px-6 py-4 font-bold">URL</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-indigo-50">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="transition-colors hover:bg-indigo-50/40 text-slate-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-950">{log.username || "-"}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{log.email || "-"}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                          {log.action || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-bold ${
                            log.method === "GET"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : log.method === "POST"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                              : log.method === "PUT"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : log.method === "DELETE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {log.method || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-[220px] truncate font-mono text-xs text-slate-600" title={log.url}>
                          {log.url || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            !log.statusCode
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : log.statusCode >= 200 && log.statusCode < 300
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : log.statusCode >= 300 && log.statusCode < 400
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : log.statusCode >= 400 && log.statusCode < 500
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {log.statusCode || "-"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-bold text-slate-700">No logs found</p>
                        <p className="text-sm text-slate-500">Try adjusting your search filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-indigo-100 bg-indigo-50/50 px-6 py-4 sm:flex-row">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Page <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg">{page}</span> of <span className="text-indigo-700 font-bold">{totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || logsQuery.isFetching}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || logsQuery.isFetching}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}