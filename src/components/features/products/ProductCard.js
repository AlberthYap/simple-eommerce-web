"use client";

import { useState } from "react";
import useStore from "@/store/useStore";
import { deleteProduct } from "@/utils/api";

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const {
    openProductModal,
    openProductDetail,
    deleteProduct: removeProduct,
  } = useStore();

  const handleEdit = () => {
    openProductModal(product);
  };

  const handleDetail = () => {
    openProductDetail(product);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
    try {
      await deleteProduct(product.id);
      removeProduct(product.id);
    } catch (error) {
      alert("Failed to delete product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (stock) => {
    if (stock > 50) return "bg-green-100 text-green-800";
    if (stock > 10) return "bg-yellow-100 text-yellow-800";
    if (stock > 0) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Product Image - Fixed */}
      <div className="relative aspect-square bg-gray-50">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-xs text-gray-400">No Image</p>
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStockColor(
              product.stock
            )}`}
          >
            {product.stock} left
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title & SKU */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.sku}
          </p>
        </div>

        {/* Description - New */}
        {product.description && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDetail}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? (
              "..."
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
