"use client";

import { useState, useEffect } from "react";
import useStore from "@/store/useStore";
import { fetchProducts, createAdjustment, updateAdjustment } from "@/utils/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdjustmentModal() {
  const {
    isAdjustmentModalOpen,
    selectedAdjustment,
    adjustmentModalMode,
    closeAdjustmentModal,
    addAdjustment,
    updateAdjustment: updateStoreAdjustment,
  } = useStore();

  const [formData, setFormData] = useState({
    qty: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Determine modal mode
  const isViewMode = adjustmentModalMode === "view";
  const isEditMode = adjustmentModalMode === "edit";
  const isCreateMode = adjustmentModalMode === "create";

  // Load products from API for create mode
  useEffect(() => {
    if (isAdjustmentModalOpen && isCreateMode) {
      loadProductsFromAPI();
    }
  }, [isAdjustmentModalOpen, isCreateMode]);

  const loadProductsFromAPI = async () => {
    console.log("🔄 Loading products from API...");
    setProductsLoading(true);

    try {
      let allProducts = [];
      let page = 1;
      let hasMore = true;
      const maxPages = 10;

      while (hasMore && page <= maxPages) {
        const response = await fetchProducts(page, 50);

        if (
          response &&
          response.success &&
          response.data &&
          response.data.length > 0
        ) {
          allProducts = [...allProducts, ...response.data];
          hasMore = response.pagination?.hasNextPage || false;
          page += 1;

          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } else {
          hasMore = false;
        }
      }

      setProducts(allProducts);
    } catch (error) {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isAdjustmentModalOpen) {
      if (isEditMode && selectedAdjustment) {
        // Edit mode - populate with current quantity
        setFormData({
          qty: selectedAdjustment.qty?.toString() || "",
        });
      } else if (isCreateMode) {
        // Create mode - empty form
        setFormData({ qty: "" });
      }
      setErrors({});
    } else {
      setProducts([]);
    }
  }, [isAdjustmentModalOpen, selectedAdjustment, isEditMode, isCreateMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isCreateMode && !formData.product_id) {
      newErrors.product_id = "Product is required";
    }
    if (!formData.qty) newErrors.qty = "Quantity is required";
    if (formData.qty && (isNaN(formData.qty) || parseInt(formData.qty) === 0)) {
      newErrors.qty = "Quantity must be a non-zero number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare API payload
      const apiPayload = {
        qty: parseInt(formData.qty),
      };

      if (isCreateMode) {
        // Add product_id for create
        apiPayload.product_id = formData.product_id;
      }

      console.log(
        `${isEditMode ? "Updating" : "Creating"} adjustment:`,
        apiPayload
      );

      let response;
      if (isEditMode) {
        // Update existing adjustment
        response = await updateAdjustment(selectedAdjustment.id, apiPayload);
      } else {
        // Create new adjustment
        response = await createAdjustment(apiPayload);
      }

      console.log("API Response:", response);

      if (response && response.success) {
        if (isEditMode) {
          // Update in store
          const updatedAdjustment = {
            ...selectedAdjustment,
            qty: parseInt(formData.qty),
            amount:
              Math.abs(parseInt(formData.qty)) *
              (selectedAdjustment.price || 0),
          };
          updateStoreAdjustment(selectedAdjustment.id, updatedAdjustment);
        } else {
          // Add new to store
          const selectedProduct = products.find(
            (p) => p.id.toString() === formData.product_id
          );
          const adjustmentForStore = {
            id: response.data?.id || Date.now(),
            sku: selectedProduct?.sku || "N/A",
            title: selectedProduct?.title || "Unknown Product",
            image: selectedProduct?.image || null,
            price: selectedProduct?.price || 0,
            qty: parseInt(formData.qty),
            amount:
              Math.abs(parseInt(formData.qty)) * (selectedProduct?.price || 0),
            created_at: new Date().toISOString(),
            product_id: parseInt(formData.product_id),
          };
          addAdjustment(adjustmentForStore);
        }

        closeAdjustmentModal();
      } else {
        setErrors({
          submit:
            response?.message ||
            `Failed to ${isEditMode ? "update" : "create"} adjustment`,
        });
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} adjustment:`,
        error
      );
      setErrors({
        submit:
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} adjustment`,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (!isAdjustmentModalOpen) return null;

  // VIEW MODE
  if (isViewMode && selectedAdjustment) {
    const typeInfo =
      selectedAdjustment.qty > 0
        ? { type: "Stock In", color: "text-green-600 bg-green-50", icon: "+" }
        : { type: "Stock Out", color: "text-red-600 bg-red-50", icon: "-" };

    return (
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={closeAdjustmentModal}
        title="Adjustment Transaction Details"
        size="lg"
        backdropStyle="light"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {selectedAdjustment.image ? (
                <img
                  src={selectedAdjustment.image}
                  alt={selectedAdjustment.title}
                  className="w-full h-full object-cover"
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-400">No Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedAdjustment.title}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500">SKU:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedAdjustment.sku}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">
                    Transaction Type
                  </span>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${typeInfo.color}`}
                    >
                      {typeInfo.icon} {typeInfo.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Quantity</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.abs(selectedAdjustment.qty)}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Amount</span>
                  <p className="text-2xl font-bold text-gray-900">
                    ${selectedAdjustment.amount?.toFixed(2)}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="text-sm text-gray-700">
                    {formatDate(selectedAdjustment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={closeAdjustmentModal}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // CREATE/EDIT MODE
  const modalTitle = isEditMode
    ? `Edit Adjustment #${selectedAdjustment?.id}`
    : "Create New Adjustment";

  return (
    <Modal
      isOpen={isAdjustmentModalOpen}
      onClose={closeAdjustmentModal}
      title={modalTitle}
      size="md"
    >
      {isCreateMode && productsLoading ? (
        <div className="py-8">
          <LoadingSpinner text="Loading products..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Selection - Only for Create Mode */}
          {isCreateMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="product_id"
                  value={formData.product_id || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.product_id ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                  disabled={products.length === 0}
                >
                  <option value="">
                    {products.length === 0
                      ? "No products available"
                      : "Select a product"}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} ({product.sku}) - ${product.price}
                      {product.stock !== undefined
                        ? ` - Stock: ${product.stock}`
                        : ""}
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.product_id}
                  </p>
                )}
              </div>

              {/* Selected Product Preview */}
              {formData.product_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {(() => {
                    const selectedProduct = products.find(
                      (p) => p.id.toString() === formData.product_id
                    );
                    return selectedProduct ? (
                      <div className="flex items-center gap-3">
                        {selectedProduct.image && (
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            className="w-12 h-12 rounded-lg object-cover border"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <div>
                          <p className="font-medium text-blue-900">
                            {selectedProduct.title}
                          </p>
                          <p className="text-sm text-blue-700">
                            SKU: {selectedProduct.sku} | Price: $
                            {selectedProduct.price}
                            {selectedProduct.stock !== undefined &&
                              ` | Stock: ${selectedProduct.stock}`}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </>
          )}

          {/* Current Product Info - Only for Edit Mode */}
          {isEditMode && selectedAdjustment && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {selectedAdjustment.image && (
                  <img
                    src={selectedAdjustment.image}
                    alt={selectedAdjustment.title}
                    className="w-12 h-12 rounded-lg object-cover border"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedAdjustment.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    SKU: {selectedAdjustment.sku} | Price: $
                    {selectedAdjustment.price}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? "New Quantity" : "Quantity"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.qty ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter quantity (+ for stock in, - for stock out)"
              required
            />
            {errors.qty && (
              <p className="mt-1 text-sm text-red-600">{errors.qty}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use positive numbers for stock in (+), negative numbers for stock
              out (-)
            </p>
            {isEditMode && (
              <p className="mt-1 text-xs text-blue-600">
                Current quantity: <strong>{selectedAdjustment.qty}</strong>
              </p>
            )}
          </div>

          {/* Form Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={closeAdjustmentModal}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              disabled={isCreateMode && products.length === 0}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Adjustment"
                : "Create Adjustment"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
