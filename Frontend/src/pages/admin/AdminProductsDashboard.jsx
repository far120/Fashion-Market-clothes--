import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBox, FiClock, FiLayers, FiShoppingBag } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import { getCategories, getOrders, getProducts } from "../../features/product/services/productApi";

export default function AdminProductsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
          getProducts({ page: 1, limit: 20, order: "desc" }),
          getCategories({ page: 1, limit: 20, order: "desc" }),
          getOrders({ page: 1, limit: 20, order: "desc" }),
        ]);

        if (mounted) {
          setProductsData(productsResponse);
          setCategoriesData(categoriesResponse);
          setOrdersData(ordersResponse);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const products = productsData?.result || [];
  const orders = ordersData?.result || [];

  const unavailableCount = useMemo(() => {
    return products.filter((item) => !item.available).length;
  }, [products]);

  const recentProducts = useMemo(() => products.slice(0, 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto max-w-7xl rounded-4xl border border-indigo-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-6 border-b border-indigo-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700">
              Commerce Dashboard
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Products and orders live together.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              This dashboard is for catalog operations, category health, and order visibility without mixing in user
              management or activity logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:brightness-110"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-2xl bg-[linear-gradient(90deg,#312e81_0%,#1e1b4b_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(30,41,59,0.18)] transition hover:brightness-110"
            >
              Manage Orders
            </Link>
            <Link
              to="/admin/categories"
              className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
            >
              Manage Categories
            </Link>
             
            <Link
              to="/admin/brands"
              className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
            >
              Manage Brands
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="mb-2 inline-flex rounded-2xl bg-indigo-100 p-2 text-indigo-700">
              <FiBox className="text-xl" />
            </div>
            <p className="text-sm font-semibold text-indigo-700">Total Products</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{productsData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="mb-2 inline-flex rounded-2xl bg-indigo-100 p-2 text-indigo-700">
              <FiLayers className="text-xl" />
            </div>
            <p className="text-sm font-semibold text-indigo-700">Total Categories</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{categoriesData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="mb-2 inline-flex rounded-2xl bg-indigo-100 p-2 text-indigo-700">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-sm font-semibold text-indigo-700">Orders Count</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{ordersData?.totalResults || 0}</p>
          </article>

          <article className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="mb-2 inline-flex rounded-2xl bg-indigo-100 p-2 text-indigo-700">
              <FiClock className="text-xl" />
            </div>
            <p className="text-sm font-semibold text-indigo-700">Unavailable</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{unavailableCount}</p>
          </article>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-[0_14px_32px_rgba(30,41,59,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Catalog</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Recent products</h2>
              </div>
              <FiBox className="text-2xl text-indigo-400" />
            </div>

            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product._id} className="rounded-2xl border border-indigo-100 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{product.name || "Product"}</p>
                      <p className="mt-1 text-sm text-slate-500">${Number(product.price || 0).toFixed(2)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${product.available ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                      {product.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))}

              {recentProducts.length === 0 && (
                <p className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-sm text-indigo-700">
                  No products found.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-indigo-900 bg-[radial-gradient(circle_at_top_left,#252b78_0%,#181b40_50%,#2d1b54_100%)] p-5 text-white shadow-[0_14px_32px_rgba(30,41,59,0.18)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Orders</p>
                <h2 className="mt-1 text-xl font-black">Recent order activity</h2>
              </div>
              <FiShoppingBag className="text-2xl text-indigo-300" />
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => {
                const customer = order?.user && typeof order.user === "object"
                  ? order.user.username || order.user.email || "Customer"
                  : "Customer";

                return (
                  <div key={order._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{customer}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          {order.items?.length || 0} items • ${Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        {order.status || "pending"}
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent order"}
                    </p>
                  </div>
                );
              })}

              {recentOrders.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300">
                  No orders found.
                </p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
