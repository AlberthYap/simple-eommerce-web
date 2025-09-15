"use client";

import { useEffect, useState, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import useStore from "@/store/useStore";
import { fetchProducts } from "@/utils/api";
import ProductGrid from "./ProductGrid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductList() {
  const {
    products,
    productPage,
    productHasMore,
    productLoading,
    openProductModal,
    setProducts,
    addProducts,
    setProductPage,
    setProductHasMore,
    setProductLoading,
    resetProducts,
  } = useStore();

  const [mounted, setMounted] = useState(false);

  const loadProducts = useCallback(
    async (page = 1, reset = false) => {
      if (productLoading) return;

      setProductLoading(true);
      try {
        const response = await fetchProducts(page, 8);

        if (response && response.success && response.data) {
          const newProducts = response.data;

          if (reset || page === 1) {
            setProducts(newProducts);
          } else {
            addProducts(newProducts);
          }

          setProductPage(page);
          setProductHasMore(response.pagination?.hasNextPage || false);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setProductLoading(false);
      }
    },
    [
      productLoading,
      setProducts,
      addProducts,
      setProductPage,
      setProductHasMore,
      setProductLoading,
    ]
  );

  const loadMore = useCallback(() => {
    if (!productLoading && productHasMore) {
      loadProducts(productPage + 1, false);
    }
  }, [productLoading, productHasMore, productPage, loadProducts]);

  const refresh = useCallback(() => {
    resetProducts();
    loadProducts(1, true);
  }, [resetProducts, loadProducts]);

  const sentinelRef = useInfiniteScroll({
    loading: productLoading,
    hasMore: productHasMore,
    onLoadMore: loadMore,
    rootMargin: "200px",
  });

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (products.length === 0) {
        loadProducts(1, true);
      }
    }
  }, [mounted, products.length, loadProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
            <p className="text-gray-600">
              {products.length > 0
                ? `${products.length} products`
                : "Loading products..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={productLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={() => openProductModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : !productLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first product
            </p>
            <button
              onClick={() => openProductModal()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200"
            >
              Add Your First Product
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-12">
          <LoadingSpinner text="Loading products..." />
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={sentinelRef}>
        {productLoading && products.length > 0 && (
          <div className="text-center py-4">
            <LoadingSpinner text="Loading more products..." />
          </div>
        )}
      </div>

      {/* End Message */}
      {!productLoading && !productHasMore && products.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            You&apos;ve seen all products • {products.length} total
          </p>
        </div>
      )}
    </div>
  );
}
