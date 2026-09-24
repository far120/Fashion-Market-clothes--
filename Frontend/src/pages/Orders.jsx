import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import { clearCart, getCartTotals, readCart, removeCartItem, syncCartWithInventory, updateCartItem } from "../utils/cart";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function OrdersPage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [cart, setCart] = useState(() => readCart());
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { productsQuery } = useProducts({ page: 1, limit: 100, order: "desc" });
  const inventory = productsQuery.data?.result || [];

  const syncedCart = useMemo(() => {
    return syncCartWithInventory(cart, inventory);
  }, [cart, inventory]);

  const queryParams = isAuthenticated
    ? {
      page: currentPage,
      limit: 6,
      order: "desc",
      populate: "items,user",
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }
    : false;

  const { ordersQuery, createOrderMutation, updateOrderMutation } = useOrders(queryParams);

  const ordersData = ordersQuery.data || {};
  const allOrders = ordersData.result || [];
  const ownOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const orderUserId = order?.user && typeof order.user === "object" ? order.user?._id : order?.user;
      return !user?._id || String(orderUserId) === String(user._id);
    });
  }, [allOrders, user]);

  const totalPages = ordersData.totalPages || 1;
  const totals = useMemo(() => getCartTotals(syncedCart), [syncedCart]);

  const orderItemCount = useMemo(() => {
    return ownOrders.reduce((count, order) => {
      return count + (order.items || []).length;
    }, 0);
  }, [ownOrders]);

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

  function renderOrderUser(order) {
    const orderUser = order?.user;
    if (orderUser && typeof orderUser === "object") {
      return orderUser.username || orderUser.email || "Customer";
    }
    if (typeof orderUser === "string" && orderUser.length > 0) {
      return `Customer #${orderUser.slice(-6)}`;
    }
    return "Customer";
  }

  function renderOrderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Product";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div
          key={`${order._id}-${index}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
        >
          <div>
            <p className="font-semibold text-[#111827]">{productName}</p>
            <p className="text-xs text-[#6b7280]">
              Qty {item.quantity} · ${unitPrice.toFixed(2)} each
            </p>
          </div>
          <p className="text-sm font-bold text-[#111827]">${(unitPrice * item.quantity).toFixed(2)}</p>
        </div>
      );
    });
  }

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    if (syncedCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        items: syncedCart.map((item) => ({ product: item.productId, quantity: item.quantity })),
      });
      clearCart();
      setCart([]);
      toast.success("Order placed successfully ✅");
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    }
  }

  async function handleOrderUpdate(orderId, status) {
    try {
      await updateOrderMutation.mutateAsync({ orderId, payload: isAdmin ? { status } : {} });
      toast.success(isAdmin ? "Order status updated ✅" : "Order cancelled ✅");
    } catch (err) {
      toast.error(err.message || "Failed to update order");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-[#fecaca] bg-[#fff7f7] p-8 text-center shadow-[0_18px_40px_rgba(127,29,29,0.08)]">
        <h1 className="text-3xl font-black text-[#7f1d1d]">Login Required</h1>
        <p className="mt-3 text-[#b91c1c]">Sign in to place and manage your orders.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-[#dc2626] px-5 py-3 font-semibold text-white transition hover:brightness-110"
        >
          Go To Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-7xl rounded-4xl border border-indigo-100 bg-white/90 p-5 shadow-[0_24px_80px_rgba(30,41,59,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700">
              Order Center
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Build orders in checkout, then review them in history.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              The checkout panel stays focused on placing a new order while the history panel keeps previous orders,
              users, and products easy to inspect.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-105">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Cart items</p>
              <p className="mt-2 text-3xl font-black text-indigo-950">{totals.itemsCount}</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Orders tracked</p>
              <p className="mt-2 text-3xl font-black text-indigo-950">{ownOrders.length}</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Lines reviewed</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{orderItemCount}</p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Cart total</p>
              <p className="mt-2 text-3xl font-black text-violet-950">${totals.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article id="checkout" className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 shadow-[0_16px_40px_rgba(30,41,59,0.06)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Checkout</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Create order</h2>
              </div>
              <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Total ${totals.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {syncedCart.map((item) => (
                <div key={item.productId} className="rounded-2xl border border-indigo-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">${Number(item.price).toFixed(2)} each</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCart(removeCartItem(item.productId))}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        setCart(updateCartItem(item.productId, Number(event.target.value || 1)))
                      }
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                    />
                    <span className="text-sm font-medium text-slate-500">
                      Line total ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {syncedCart.length === 0 && (
                <p className="rounded-2xl border border-dashed border-indigo-200 bg-white p-5 text-sm text-slate-500">
                  Cart is empty. Add products from the menu to start a new order.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Summary</p>
                  <p className="mt-1 text-sm text-slate-500">Review before you submit the order.</p>
                </div>
                <p className="text-3xl font-black text-slate-900">${totals.totalAmount.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending || syncedCart.length === 0}
                className="mt-5 w-full rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(79,70,229,0.25)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createOrderMutation.isPending ? "Submitting..." : "Place Order"}
              </button>
            </div>
          </article>

          <article id="history" className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 shadow-[0_16px_40px_rgba(30,41,59,0.06)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">History</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Your orders</h2>
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-900 outline-none"
              >
                <option value="all">All statuses</option>
                {statusList.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              This area is intentionally separate from checkout so order review stays focused, readable, and easy to
              scan.
            </p>

            {ordersQuery.isLoading ? (
              <div className="mt-8 flex items-center justify-center py-10">
                <Spinner />
              </div>
            ) : ordersQuery.isError ? (
              <div className="mt-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
                  {ordersQuery.error.message}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {ownOrders.map((order) => (
                  <article key={order._id} className="rounded-3xl border border-indigo-100 bg-white p-4 shadow-[0_12px_26px_rgba(30,41,59,0.06)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                          Order #{order._id?.slice(-6)}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-slate-900">{renderOrderUser(order)}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          <span className="rounded-full bg-slate-50 px-3 py-1">
                            {order.user && typeof order.user === "object" ? order.user.email : "Customer details loaded"}
                          </span>
                          <span className="rounded-full bg-slate-50 px-3 py-1">
                            {(order.items || []).length} products
                          </span>
                        </div>
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

                    <div className="mt-4 space-y-2">{renderOrderItems(order)}</div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
                        <p className="text-2xl font-black text-slate-900">${Number(order.totalAmount || 0).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <select
                            value={order.status}
                            onChange={(event) => handleOrderUpdate(order._id, event.target.value)}
                            disabled={updateOrderMutation.isPending}
                            className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-sm font-semibold text-indigo-900 outline-none disabled:opacity-50"
                          >
                            {statusList.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          order.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleOrderUpdate(order._id, "cancelled")}
                              disabled={updateOrderMutation.isPending}
                              className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              Cancel order
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {ownOrders.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-indigo-200 bg-white p-5 text-sm text-slate-500">
                    No orders yet. Place the first one from the checkout panel.
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || ordersQuery.isFetching}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-50"
                  >
                    Previous
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                    Page {currentPage} / {totalPages}
                  </p>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || ordersQuery.isFetching}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
