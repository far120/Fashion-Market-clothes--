import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import { API_BASE_URL } from "../../services/endpoints";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useBrands } from "../../hooks/useBrands";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { productsQuery, createProductMutation, updateProductMutation, deleteProductMutation } = useProducts({
    page: 1,
    limit: 100,
    order: "desc",
  });

  const { categoriesQuery } = useCategories({ page: 1, limit: 100, order: "desc" });
  const { brandsQuery } = useBrands({ page: 1, limit: 100, order: "desc" });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      available: "true",
    },
  });

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  const categories = categoriesQuery.data?.result || [];
  const brands = brandsQuery.data?.result || [];
  const products = productsQuery.data?.result || [];

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [categories]);

  const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [brands]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const categoryName = typeof product.category === "object" ? product.category?.name || "" : categoryMap.get(product.category) || "";
      const brandName = typeof product.brand === "object" ? product.brand?.name || "" : brandMap.get(product.brand) || "";
      const matchesSearch = !term || `${product.name} ${categoryName} ${brandName}`.toLowerCase().includes(term);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.available) ||
        (availabilityFilter === "unavailable" && !product.available);

      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, categoryMap, brandMap, availabilityFilter]);

  function beginEdit(product) {
    setEditingId(product._id);
    setValue("name", product.name || "");
    setValue("description", product.description || "");
    setValue("price", product.price || "");
    setValue("stock", product.stock || "");
    setValue(
      "category",
      typeof product.category === "object" ? product.category?._id || "" : product.category || ""
    );
    setValue(
      "brand",
      typeof product.brand === "object" ? product.brand?._id || "" : product.brand || ""
    );
    setValue("available", product.available ? "true" : "false");
    setImageFile(null);
  }

  function resetForm() {
    setEditingId(null);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      available: "true",
    });
    setImageFile(null);
  }

  const onSubmit = async (data) => {
    const payload = new FormData();
    payload.append("name", data.name);
    payload.append("description", data.description);
    payload.append("price", Number(data.price));
    payload.append("stock", Number(data.stock));
    payload.append("category", data.category);
    payload.append("brand", data.brand);
    payload.append("available", data.available);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({ productId: editingId, payload });
        toast.success("Product updated ✅");
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success("Product created ✅");
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Product deleted ✅");
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading || brandsQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError || brandsQuery.isError;
  const errorMessage = productsQuery.error?.message || categoriesQuery.error?.message || brandsQuery.error?.message;

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

  const isSaving = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,0.06)]">
          <h1 className="text-3xl font-black text-indigo-950">Admin Products</h1>
          <p className="mt-1 text-sm text-indigo-700">Create and update menu items.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <div>
              <input
                placeholder="Product name"
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.name ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                  }`}
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.name.message}</p>
              )}
            </div>

            <textarea
              rows={3}
              placeholder="Description"
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm outline-none"
              {...register("description")}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-indigo-900">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-indigo-700">
                {editingId ? "Choose a file only if you want to replace current image" : "Upload product image"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="0.01"
                  min={1}
                  placeholder="Price"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.price ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                    }`}
                  {...register("price", { required: "Price is required" })}
                />
                {errors.price && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  min={0}
                  placeholder="Stock"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.stock ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                    }`}
                  {...register("stock", { required: "Stock is required" })}
                />
                {errors.stock && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div>
              <select
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.category ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                  }`}
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <select
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.brand ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                  }`}
                {...register("brand", { required: "Brand is required" })}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brand && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.brand.message}</p>
              )}
            </div>

            <select
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm outline-none"
              {...register("available")}
            >
              <option value="true">Available</option>
              <option value="false">Not available</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50 shadow-md"
              >
                {isSaving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Reset
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-indigo-950">Current Products</h2>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search product by name"
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm lg:w-64 outline-none"
              />
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm lg:w-44 outline-none"
              >
                <option value="all">All availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {filteredProducts.map((product) => {
              const catName = typeof product.category === "object" ? product.category?.name : categoryMap.get(product.category) || "Uncategorized";
              return (
                <div key={product._id} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = "https://4.imimg.com/data4/RU/VC/MY-11853389/men-s-jackets-1000x1000.jpg";
                        }}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-indigo-950">{product.name}</p>
                        <p className="text-sm text-slate-600">{product.description || "No description"}</p>
                        <p className="text-xs text-indigo-700">Category: {catName}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-800">
                          {product.available ? "Available" : "Not available"} • Stock {product.stock ?? 0}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-indigo-700">${Number(product.price || 0).toFixed(2)}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(product)}
                      className="rounded-lg border border-indigo-300 bg-white px-3 py-1 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteProductMutation.isPending}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#fde68a] bg-[#fffbeb] p-4 text-sm text-[#a16207]">
                No products found.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
