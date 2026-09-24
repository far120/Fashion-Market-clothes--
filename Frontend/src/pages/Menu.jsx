import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFilter, FiShoppingCart, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { addToCart, getCartItemQuantity, getCartTotals, readCart, syncCartWithInventory } from "../utils/cart";
import { API_BASE_URL } from "../services/endpoints";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

const priceRanges = [
  { value: "all", label: "All prices" },
  { value: "under-10", label: "Under $10" },
  { value: "10-25", label: "$10 - $25" },
  { value: "25-50", label: "$25 - $50" },
  { value: "50-plus", label: "$50+" },
];

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const [cartItems, setCartItems] = useState(() => readCart());

  const { productsQuery } = useProducts({ page: 1, limit: 100, order: "desc" });
  const { categoriesQuery } = useCategories({ page: 1, limit: 100, order: "desc" });

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop&auto=format";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  const products = productsQuery.data?.result || [];
  const categories = categoriesQuery.data?.result || [];

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => map.set(category._id, category.name));
    return map;
  }, [categories]);

  const activeCartItems = useMemo(() => {
    return syncCartWithInventory(cartItems, products);
  }, [cartItems, products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const hasCustomMin = customMinPrice !== "" && Number.isFinite(Number(customMinPrice));
    const hasCustomMax = customMaxPrice !== "" && Number.isFinite(Number(customMaxPrice));

    return products.filter((product) => {
      const candidate = `${product.name} ${product.description || ""} ${categoryMap.get(product.category) || ""}`.toLowerCase();
      const matchesSearch = !term || candidate.includes(term);

      const productCategoryId = typeof product.category === "object" ? product.category?._id : product.category;
      const matchesCategory = selectedCategory === "all" || productCategoryId === selectedCategory;

      const price = Number(product.price || 0);
      const matchesPresetPrice =
        selectedPriceRange === "all" ||
        (selectedPriceRange === "under-10" && price < 10) ||
        (selectedPriceRange === "10-25" && price >= 10 && price < 25) ||
        (selectedPriceRange === "25-50" && price >= 25 && price < 50) ||
        (selectedPriceRange === "50-plus" && price >= 50);

      const matchesCustomMin = !hasCustomMin || price >= Number(customMinPrice);
      const matchesCustomMax = !hasCustomMax || price <= Number(customMaxPrice);
      const matchesPrice = matchesPresetPrice && matchesCustomMin && matchesCustomMax;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [
    categoryMap,
    products,
    search,
    selectedCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
  ]);

  const cartTotals = useMemo(() => getCartTotals(activeCartItems), [activeCartItems]);

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "Uncategorized";
    }
    return categoryMap.get(product.category) || "Uncategorized";
  }

  function handleAdd(product) {
    const existingQuantity = getCartItemQuantity(activeCartItems, product._id);
    const stock = Number(product.stock || 0);

    if (!product.available || stock <= 0) {
      toast.error("This product is not available right now");
      return;
    }

    if (existingQuantity >= stock) {
      toast.error("You already reached the available stock");
      return;
    }

    const nextCart = addToCart(product, 1);
    setCartItems(syncCartWithInventory(nextCart, products));
    toast.success("Added to order cart 🛒");
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setCustomMinPrice("");
    setCustomMaxPrice("");
  }

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;
  const errorMessage = productsQuery.error?.message || categoriesQuery.error?.message;

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_46px_rgba(30,41,59,0.06)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-block rounded-full bg-indigo-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">
                Fashion Market Menu
              </p>
              <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">Explore Our Collection</h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Explore our daily menu and add your favorites to the live order cart.
              </p>
            </div>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.3)] transition hover:brightness-110"
            >
              <FiShoppingCart />
              Cart ({cartTotals.itemsCount})
            </Link>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-3">
              <FiSearch className="text-indigo-600" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search items..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-900 outline-none"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriceRange}
              onChange={(event) => setSelectedPriceRange(event.target.value)}
              className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-900 outline-none"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100/60"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={customMinPrice}
              onChange={(event) => setCustomMinPrice(event.target.value)}
              placeholder="Custom min price"
              className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-900 outline-none"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={customMaxPrice}
              onChange={(event) => setCustomMaxPrice(event.target.value)}
              placeholder="Custom max price"
              className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-900 outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
            <FiFilter />
            <span>Filters applied</span>
            <span className="rounded-full bg-indigo-100/70 px-3 py-1 text-indigo-800">
              {selectedCategory === "all" ? "All categories" : "Category selected"}
            </span>
            <span className="rounded-full bg-indigo-100/70 px-3 py-1 text-indigo-800">
              {priceRanges.find((range) => range.value === selectedPriceRange)?.label}
            </span>
            <span className="rounded-full bg-indigo-100/70 px-3 py-1 text-indigo-800">
              Min {customMinPrice === "" ? "Any" : customMinPrice}
            </span>
            <span className="rounded-full bg-indigo-100/70 px-3 py-1 text-indigo-800">
              Max {customMaxPrice === "" ? "Any" : customMaxPrice}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product._id}
              className="group rounded-3xl border border-indigo-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,41,59,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,41,59,0.12)]"
            >
              <img
                src={resolveImageUrl(product.image)}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop&auto=format";
                }}
                className="mb-4 h-48 w-full rounded-2xl object-cover"
              />
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900">{product.name}</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  {product.available ? "Available" : "Sold out"}
                </span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                {getCategoryName(product)}
              </p>

              <p className="min-h-12 text-sm text-slate-600">{product.description || "Collection item"}</p>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-3xl font-black text-indigo-700">${Number(product.price || 0).toFixed(2)}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Stock {product.stock ?? 0}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={
                  !product.available ||
                  Number(product.stock || 0) <= 0 ||
                  getCartItemQuantity(activeCartItems, product._id) >= Number(product.stock || 0)
                }
                className="mt-5 w-full rounded-xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!product.available || Number(product.stock || 0) <= 0
                  ? "Sold Out"
                  : getCartItemQuantity(activeCartItems, product._id) >= Number(product.stock || 0)
                  ? "Max in Cart"
                  : "Add To Cart"}
              </button>
            </article>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center text-indigo-700">
              No products matched your search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
