"use client";

import { useState, useEffect } from "react";
import useStore from "@/store/useStore";
import { createProduct, updateProduct } from "@/utils/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProductModal() {
  const {
    isProductModalOpen,
    selectedProduct,
    closeProductModal,
    addProduct,
    updateProduct: updateStoreProduct,
  } = useStore();

  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    description: "",
    image: "",
    price: "",
    stock: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isProductModalOpen) {
      if (selectedProduct) {
        setFormData({
          title: selectedProduct.title || "",
          sku: selectedProduct.sku || "",
          description: selectedProduct.description || "",
          image: selectedProduct.image || "",
          price: selectedProduct.price?.toString() || "",
          stock: selectedProduct.stock?.toString() || "",
        });
      } else {
        setFormData({
          title: "",
          sku: "",
          description: "",
          image: "",
          price: "",
          stock: "",
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isProductModalOpen, selectedProduct]);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Product title is required";
        if (value.length < 2) return "Title must be at least 2 characters";
        if (value.length > 100) return "Title must be less than 100 characters";
        return "";

      case "sku":
        if (!value.trim()) return "SKU is required";
        if (!/^[A-Z0-9-]+$/i.test(value))
          return "SKU can only contain letters, numbers, and dashes";
        if (value.length < 3) return "SKU must be at least 3 characters";
        return "";

      case "description":
        if (value && value.length > 500)
          return "Description must be less than 500 characters";
        return "";

      case "price":
        if (!value) return "Price is required";
        const price = parseFloat(value);
        if (isNaN(price)) return "Price must be a valid number";
        if (price <= 0) return "Price must be greater than 0";
        if (price > 999999) return "Price cannot exceed $999,999";
        return "";

      case "image":
        if (value && !isValidUrl(value)) return "Please enter a valid URL";
        return "";

      default:
        return "";
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const productData = {
        title: formData.title.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (selectedProduct) {
        const response = await updateProduct(selectedProduct.id, productData);
        updateStoreProduct(selectedProduct.id, response.data || productData);
      } else {
        const response = await createProduct(productData);
        addProduct(response.data || { ...productData, id: Date.now() });
      }

      closeProductModal();
    } catch (error) {
      if (error.message.includes("SKU already exists")) {
        setErrors({ sku: "This SKU is already in use" });
      } else {
        setErrors({ submit: error.message || "Failed to save product" });
      }
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!selectedProduct;

  return (
    <Modal
      isOpen={isProductModalOpen}
      onClose={closeProductModal}
      title={
        isEditMode ? `Edit Product #${selectedProduct?.id}` : "Add New Product"
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Title */}
        <Input
          label="Product Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.title ? errors.title : ""}
          placeholder="Enter product title"
          required
        />

        {/* SKU */}
        <Input
          label="SKU (Stock Keeping Unit)"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.sku ? errors.sku : ""}
          placeholder="e.g., PROD-001"
          helperText="Use uppercase letters, numbers, and dashes only"
          required
        />

        {/* Description - New Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows="3"
            className={`
              w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              resize-none
              ${
                errors.description && touched.description
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
            placeholder="Optional: Enter product description..."
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && touched.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Optional: Brief product description
              </p>
            )}
            <span className="text-xs text-gray-400">
              {formData.description.length}/500
            </span>
          </div>
        </div>

        {/* Image URL */}
        <Input
          label="Product Image URL"
          name="image"
          type="url"
          value={formData.image}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.image ? errors.image : ""}
          placeholder="https://example.com/image.jpg"
          helperText="Optional: Link to product image"
        />

        {/* Price and Stock */}
        <Input
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          max="999999"
          value={formData.price}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.price ? errors.price : ""}
          placeholder="0.00"
          required
        />

        {/* Image Preview */}
        {formData.image && isValidUrl(formData.image) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

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
            onClick={closeProductModal}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
