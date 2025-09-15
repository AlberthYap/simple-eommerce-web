"use client";

import { useState } from "react";
import useStore from "@/store/useStore";
import { deleteProduct } from "@/utils/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ProductDetailModal() {
  const {
    isProductDetailOpen,
    selectedProduct,
    closeProductDetail,
    openProductModal,
    deleteProduct: removeProduct,
  } = useStore();

  const [loading, setLoading] = useState(false);

  if (!selectedProduct) return null;

  const handleEdit = () => {
    closeProductDetail();
    openProductModal(selectedProduct);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${selectedProduct.title}"?`))
      return;

    setLoading(true);
    try {
      await deleteProduct(selectedProduct.id);
      removeProduct(selectedProduct.id);
      closeProductDetail();
    } catch (error) {
      alert("Failed to delete product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock > 50)
      return { label: "In Stock", color: "text-green-600 bg-green-50" };
    if (stock > 10)
      return { label: "Low Stock", color: "text-yellow-600 bg-yellow-50" };
    if (stock > 0)
      return { label: "Very Low", color: "text-orange-600 bg-orange-50" };
    return { label: "Out of Stock", color: "text-red-600 bg-red-50" };
  };

  const stockStatus = getStockStatus(selectedProduct.stock);

  return (
    <Modal
      isOpen={isProductDetailOpen}
      onClose={closeProductDetail}
      title="Product Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Product Image and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto w-16 h-16 text-gray-300"
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
                  <p className="mt-2 text-sm text-gray-400">
                    No Image Available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProduct.title}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">SKU:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {selectedProduct.sku}
                </span>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500 block mb-1">
                    Description
                  </span>
                  <p className="text-gray-700">{selectedProduct.description}</p>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${selectedProduct.price?.toLocaleString() || "0"}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {selectedProduct.stock}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Category */}
            {selectedProduct.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {selectedProduct.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={closeProductDetail}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Edit Product
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}
