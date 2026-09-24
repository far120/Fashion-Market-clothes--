import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import { useCategories } from "../../hooks/useCategories";

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { categoriesQuery, createCategoryMutation, deleteCategoryMutation } = useCategories({
    page: 1,
    limit: 100,
    order: "desc",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "" },
  });

  const onSubmit = async (data) => {
    try {
      await createCategoryMutation.mutateAsync({ name: data.name.trim() });
      reset();
      toast.success("Category created ✅");
    } catch (err) {
      toast.error(err.message || "Failed to create category");
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }
    try {
      await deleteCategoryMutation.mutateAsync(category._id);
      toast.success("Category deleted ✅");
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {categoriesQuery.error.message}
        </div>
      </div>
    );
  }

  const categories = categoriesQuery.data?.result || [];
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,0.06)]">
          <h1 className="text-3xl font-black text-indigo-950">Admin Categories</h1>
          <p className="mt-2 text-sm text-indigo-700">Create menu categories for product management.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <div>
              <input
                placeholder="Category name"
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.name ? "border-red-500 bg-red-50" : "border-indigo-200 bg-indigo-50/50"
                  }`}
                {...register("name", { required: "Category name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.name.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="w-full rounded-xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50 shadow-md"
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-indigo-950">Current Categories</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search category by name"
              className="w-full max-w-xs rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="mt-5 space-y-3">
            {filteredCategories.map((category) => (
              <div key={category._id} className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                <p className="font-bold text-indigo-950">{category.name}</p>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={deleteCategoryMutation.isPending}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-sm text-indigo-700">
                No categories found.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
