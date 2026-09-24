import { useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import { useOrders } from "../../hooks/useOrders";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const queryParams = {
    page: currentPage,
    limit: 12,
    order: "desc",
    populate: "items,user",
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { ordersQuery, updateOrderMutation } = useOrders(queryParams);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderMutation.mutateAsync({ orderId, payload: { status } });
      toast.success("Order status updated ✅");
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  function getStatusStyles(status) {
    switch (status) {
      case "processing":
        return "border-[#fde68a] bg-[#fffbeb] text-[#b45309]";
      case "delivered":
        return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
      case "cancelled":
        return "border-[#fecaca] bg-[#fff1f2] text-[#be123c]";
      default:
        return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
    }
  }

  function getOrderCustomer(order) {
    const customer = order?.user;
    if (customer && typeof customer === "object") {
      return {
        name: customer.username || customer.email || "Customer",
        email: customer.email || "No email",
      };
    }
    if (typeof customer === "string" && customer.length > 0) {
      return {
        name: `Customer #${customer.slice(-6)}`,
        email: "User details not populated",
      };
    }
    return {
      name: "Customer",
      email: "User details not available",
    };
  }

  function renderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Item";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div key={`${order._id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{productName}</p>
              <p className="text-xs text-slate-500">
                Qty {item.quantity} · ${unitPrice.toFixed(2)} each
              </p>
            </div>
            <p className="text-sm font-bold text-slate-950">${(unitPrice * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      );
    });
  }

  if (ordersQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {ordersQuery.error.message}
        </div>
      </div>
    );
  }

  const ordersData = ordersQuery.data || {};
  const orders = ordersData.result || [];
  const totalPages = ordersData.totalPages || 1;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-indigo-100 bg-white/90 p-5 shadow-[0_24px_80px_rgba(30,41,59,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700">
              Commerce Operations
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Orders Management
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Manage customer orders, update statuses, and view purchase details powered by React Query.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-900 outline-none"
          >
            <option value="all">All statuses</option>
            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Orders on screen</p>
            <p className="mt-2 text-3xl font-black text-indigo-950">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Items on screen</p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {orders.reduce((count, order) => count + (order.items || []).length, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Total value</p>
            <p className="mt-2 text-3xl font-black text-violet-950">
              ${orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orders.map((order) => {
            const customer = getOrderCustomer(order);

            return (
              <article key={order._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                      Order #{order._id?.slice(-6)}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{customer.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent order"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">{renderItems(order)}</div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
                    <p className="text-2xl font-black text-slate-950">${Number(order.totalAmount || 0).toFixed(2)}</p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(event) => handleStatusChange(order._id, event.target.value)}
                    disabled={updateOrderMutation.isPending}
                    className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 outline-none disabled:opacity-50"
                  >
                    {statusList.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <p className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm text-sky-700">
              No orders found.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
          <button
            type="button"
            disabled={currentPage <= 1 || ordersQuery.isFetching}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
            Page {currentPage} / {totalPages}
          </p>
          <button
            type="button"
            disabled={currentPage >= totalPages || ordersQuery.isFetching}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
