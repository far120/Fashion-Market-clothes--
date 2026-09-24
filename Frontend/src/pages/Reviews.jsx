import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { useReviews } from "../hooks/useReviews";

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { productsQuery } = useProducts({ page: 1, limit: 100, order: "desc" });
  const products = productsQuery.data?.result || [];

  // Automatically select first product if none selected
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]._id);
    }
  }, [products, selectedProduct]);

  const { reviewsQuery, createReviewMutation, updateReviewMutation, deleteReviewMutation } = useReviews(
    selectedProduct ? { productId: selectedProduct } : false
  );

  const reviews = reviewsQuery.data?.reviews || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const myUserId = user?._id || user?.id;

  const selectedProductName = useMemo(() => {
    return products.find((item) => item._id === selectedProduct)?.name || "Selected Product";
  }, [products, selectedProduct]);

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    if (!selectedProduct) {
      toast.error("Choose a product first");
      return;
    }

    try {
      if (editingId) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingId,
          payload: { rating: Number(data.rating), comment: data.comment },
        });
        toast.success("Review updated ✅");
      } else {
        await createReviewMutation.mutateAsync({
          productId: selectedProduct,
          rating: Number(data.rating),
          comment: data.comment,
        });
        toast.success("Review published ✅");
      }

      setEditingId(null);
      reset({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setValue("rating", review.rating || 5);
    setValue("comment", review.comment || "");
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      toast.success("Review deleted ✅");
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  if (productsQuery.isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 shadow-sm">
          {productsQuery.error?.message || "Failed to load products"}
        </div>
      </div>
    );
  }

  const isSubmitting = createReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f1f5f9_100%)] px-4 py-10 sm:py-16">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.1fr]">
        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_40px_rgba(30,41,59,0.06)]">
          <h1 className="text-3xl font-black text-indigo-950">Product Reviews</h1>
          <p className="mt-2 text-sm text-indigo-700">Help others with your feedback and ratings.</p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-indigo-900">Product</label>
            <select
              value={selectedProduct}
              onChange={(event) => {
                setSelectedProduct(event.target.value);
                setEditingId(null);
                reset({ rating: 5, comment: "" });
              }}
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm font-medium text-indigo-900 outline-none"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-indigo-900">Rating</label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                {...register("rating", {
                  required: "Rating is required",
                  min: { value: 1, message: "Minimum rating is 1" },
                  max: { value: 5, message: "Maximum rating is 5" },
                })}
              />
              {errors.rating && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-indigo-900">Comment</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                placeholder="Share your experience"
                {...register("comment", { required: "Comment is required" })}
              />
              {errors.comment && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.comment.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[linear-gradient(90deg,#4f46e5_0%,#3730a3_100%)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_18px_40px_rgba(30,41,59,0.06)]">
          <h2 className="text-2xl font-black text-indigo-950">Reviews For {selectedProductName}</h2>

          {reviewsQuery.isLoading ? (
            <div className="py-8 text-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {reviews.map((review) => {
                const reviewUserId = review?.user?._id || review?.user?.id;
                const canManage = myUserId && reviewUserId === myUserId;

                return (
                  <div key={review._id} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-indigo-950">{review?.user?.email || "User"}</p>
                        <p className="text-sm font-medium text-indigo-700">Rating: {review.rating}/5</p>
                      </div>
                      {canManage && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(review)}
                            className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review._id)}
                            disabled={deleteReviewMutation.isPending}
                            className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-slate-700">{review.comment || "No comment"}</p>
                  </div>
                );
              })}

              {reviews.length === 0 && (
                <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-sm text-indigo-700">
                  No reviews yet for this product.
                </p>
              )}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
