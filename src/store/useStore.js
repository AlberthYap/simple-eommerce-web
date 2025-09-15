import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // ============================================
        // PRODUCTS STATE
        // ============================================
        products: [],
        productPage: 1,
        productHasMore: true,
        productLoading: false,
        selectedProduct: null,

        // ============================================
        // ADJUSTMENTS STATE
        // ============================================
        adjustments: [],
        adjustmentPage: 1,
        adjustmentTotal: 0,
        adjustmentHasMore: true,
        adjustmentLoading: false,
        selectedAdjustment: null,

        // ============================================
        // UI STATE
        // ============================================
        isProductModalOpen: false,
        isProductDetailOpen: false,
        isAdjustmentModalOpen: false,
        adjustmentModalMode: "create", // 'create', 'edit', 'view'

        // ============================================
        // PRODUCTS ACTIONS
        // ============================================
        setProducts: (products) => {
          const validProducts = Array.isArray(products) ? products : [];
          console.log("Setting products:", validProducts.length);
          set({ products: validProducts });
        },

        addProducts: (newProducts) => {
          const current = get().products;
          const toAdd = Array.isArray(newProducts) ? newProducts : [];
          const updated = [...current, ...toAdd];
          console.log(
            "Adding products:",
            toAdd.length,
            "(total:",
            updated.length,
            ")"
          );
          set({ products: updated });
        },

        addProduct: (product) => {
          console.log("Adding single product:", product);
          set((state) => ({
            products: [product, ...state.products],
          }));
        },

        updateProduct: (id, updatedProduct) => {
          console.log("Updating product:", id);
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...updatedProduct } : p
            ),
          }));
        },

        deleteProduct: (id) => {
          console.log("Deleting product:", id);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
        },

        setProductLoading: (loading) => {
          console.log("Setting product loading:", loading);
          set({ productLoading: loading });
        },

        setProductPage: (page) => set({ productPage: page }),
        setProductHasMore: (hasMore) => set({ productHasMore: hasMore }),

        // Load all products for dropdowns/selects
        loadAllProducts: async () => {
          const { productLoading, setProductLoading, setProducts } = get();

          if (productLoading) return get().products;

          console.log("🔄 Loading all products from API...");
          setProductLoading(true);

          try {
            // Dynamic import to avoid circular dependency
            const { fetchProducts } = await import("@/utils/api");

            let allProducts = [];
            let page = 1;
            let hasMore = true;
            const maxPages = 10; // Safety limit

            while (hasMore && page <= maxPages) {
              console.log(`📄 Loading products page ${page}...`);
              const response = await fetchProducts(page, 50); // Load 50 per page

              if (response && response.success && response.data) {
                allProducts = [...allProducts, ...response.data];
                hasMore = response.pagination?.hasNextPage || false;
                page += 1;

                // Small delay to prevent overwhelming the API
                if (hasMore) {
                  await new Promise((resolve) => setTimeout(resolve, 100));
                }
              } else {
                hasMore = false;
              }
            }

            setProducts(allProducts);
            console.log(
              "Successfully loaded all products:",
              allProducts.length
            );
            return allProducts;
          } catch (error) {
            console.error("Error loading all products:", error);
            setProducts([]);
            return [];
          } finally {
            setProductLoading(false);
          }
        },

        // Reset products state
        resetProducts: () => {
          console.log("🔄 Resetting products state");
          set({
            products: [],
            productPage: 1,
            productHasMore: true,
            productLoading: false,
          });
        },

        // ============================================
        // ADJUSTMENTS ACTIONS
        // ============================================
        setAdjustments: (adjustments) => {
          const validAdjustments = Array.isArray(adjustments)
            ? adjustments
            : [];
          console.log("Setting adjustments:", validAdjustments.length);
          set({ adjustments: validAdjustments });
        },

        addAdjustments: (newAdjustments) => {
          const current = get().adjustments;
          const toAdd = Array.isArray(newAdjustments) ? newAdjustments : [];
          const updated = [...current, ...toAdd];
          console.log(
            "Adding adjustments:",
            toAdd.length,
            "(total:",
            updated.length,
            ")"
          );
          set({ adjustments: updated });
        },

        addAdjustment: (adjustment) => {
          console.log("Adding single adjustment:", adjustment);
          set((state) => ({
            adjustments: [adjustment, ...state.adjustments],
            adjustmentTotal: state.adjustmentTotal + 1,
          }));
        },

        updateAdjustment: (id, updatedAdjustment) => {
          console.log("Updating adjustment:", id);
          set((state) => ({
            adjustments: state.adjustments.map((a) =>
              a.id === id ? { ...a, ...updatedAdjustment } : a
            ),
          }));
        },

        deleteAdjustment: (id) => {
          console.log("Deleting adjustment:", id);
          set((state) => ({
            adjustments: state.adjustments.filter((a) => a.id !== id),
            adjustmentTotal: Math.max(0, state.adjustmentTotal - 1),
          }));
        },

        setAdjustmentLoading: (loading) => {
          console.log("Setting adjustment loading:", loading);
          set({ adjustmentLoading: loading });
        },

        setAdjustmentPage: (page) => set({ adjustmentPage: page }),
        setAdjustmentTotal: (total) => set({ adjustmentTotal: total }),
        setAdjustmentHasMore: (hasMore) => set({ adjustmentHasMore: hasMore }),

        // Reset adjustments state
        resetAdjustments: () => {
          console.log("🔄 Resetting adjustments state");
          set({
            adjustments: [],
            adjustmentPage: 1,
            adjustmentTotal: 0,
            adjustmentHasMore: true,
            adjustmentLoading: false,
          });
        },

        // ============================================
        // PRODUCT MODAL ACTIONS
        // ============================================
        openProductModal: (product = null) => {
          console.log(
            "Opening product modal:",
            product ? `Edit #${product.id}` : "Create new"
          );
          set({
            isProductModalOpen: true,
            selectedProduct: product,
            // Close other modals
            isProductDetailOpen: false,
            isAdjustmentModalOpen: false,
            adjustmentModalMode: "create",
          });
        },

        closeProductModal: () => {
          console.log("Closing product modal");
          set({
            isProductModalOpen: false,
            selectedProduct: null,
          });
        },

        // ============================================
        // PRODUCT DETAIL MODAL ACTIONS
        // ============================================
        openProductDetail: (product) => {
          console.log("Opening product detail:", product.id);
          set({
            isProductDetailOpen: true,
            selectedProduct: product,
            // Close other modals
            isProductModalOpen: false,
            isAdjustmentModalOpen: false,
            adjustmentModalMode: "create",
          });
        },

        closeProductDetail: () => {
          console.log("Closing product detail");
          set({
            isProductDetailOpen: false,
            selectedProduct: null,
          });
        },

        // ============================================
        // ADJUSTMENT MODAL ACTIONS
        // ============================================
        openAdjustmentModal: (adjustment = null, mode = "create") => {
          console.log(
            "Opening adjustment modal:",
            mode,
            adjustment ? `#${adjustment.id}` : "new"
          );
          set({
            isAdjustmentModalOpen: true,
            selectedAdjustment: adjustment,
            adjustmentModalMode: mode,
            isProductModalOpen: false,
            isProductDetailOpen: false,
          });
        },

        closeAdjustmentModal: () => {
          console.log("Closing adjustment modal");
          set({
            isAdjustmentModalOpen: false,
            selectedAdjustment: null,
            adjustmentModalMode: "create",
          });
        },

        // Set adjustment modal mode separately if needed
        setAdjustmentModalMode: (mode) => {
          console.log("Setting adjustment modal mode:", mode);
          set({ adjustmentModalMode: mode });
        },

        // ============================================
        // UTILITY ACTIONS
        // ============================================

        // Get product by ID
        getProductById: (id) => {
          const products = get().products;
          return products.find((p) => p.id === id) || null;
        },

        // Get adjustment by ID
        getAdjustmentById: (id) => {
          const adjustments = get().adjustments;
          return adjustments.find((a) => a.id === id) || null;
        },

        // Search products
        searchProducts: (query) => {
          const products = get().products;
          if (!query) return products;

          const lowerQuery = query.toLowerCase();
          return products.filter(
            (product) =>
              product.title?.toLowerCase().includes(lowerQuery) ||
              product.sku?.toLowerCase().includes(lowerQuery) ||
              product.description?.toLowerCase().includes(lowerQuery)
          );
        },

        // Get products with low stock
        getLowStockProducts: (threshold = 10) => {
          const products = get().products;
          return products.filter((product) => product.stock <= threshold);
        },

        // Get total inventory value
        getTotalInventoryValue: () => {
          const products = get().products;
          return products.reduce((total, product) => {
            return total + product.price * product.stock;
          }, 0);
        },

        // Get adjustment statistics
        getAdjustmentStats: () => {
          const adjustments = get().adjustments;

          const stats = {
            total: adjustments.length,
            stockIn: 0,
            stockOut: 0,
            totalValue: 0,
            thisMonth: 0,
          };

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          adjustments.forEach((adjustment) => {
            if (adjustment.qty > 0) {
              stats.stockIn += adjustment.qty;
            } else {
              stats.stockOut += Math.abs(adjustment.qty);
            }

            stats.totalValue += Math.abs(adjustment.amount || 0);

            // Check if adjustment is from this month
            if (adjustment.created_at) {
              const adjustmentDate = new Date(adjustment.created_at);
              if (
                adjustmentDate.getMonth() === currentMonth &&
                adjustmentDate.getFullYear() === currentYear
              ) {
                stats.thisMonth += 1;
              }
            }
          });

          return stats;
        },

        // Close all modals
        closeAllModals: () => {
          console.log("Closing all modals");
          set({
            isProductModalOpen: false,
            isProductDetailOpen: false,
            isAdjustmentModalOpen: false,
            selectedProduct: null,
            selectedAdjustment: null,
            adjustmentModalMode: "create",
          });
        },

        // Clear all data (for logout/reset)
        clearAllData: () => {
          console.log("Clearing all data");
          set({
            // Reset products
            products: [],
            productPage: 1,
            productHasMore: true,
            productLoading: false,
            selectedProduct: null,

            // Reset adjustments
            adjustments: [],
            adjustmentPage: 1,
            adjustmentTotal: 0,
            adjustmentHasMore: true,
            adjustmentLoading: false,
            selectedAdjustment: null,

            // Reset UI
            isProductModalOpen: false,
            isProductDetailOpen: false,
            isAdjustmentModalOpen: false,
            adjustmentModalMode: "create",
          });
        },

        // Debug: Log current state
        logCurrentState: () => {
          const state = get();
          console.log("📊 Current Store State:", {
            products: {
              count: state.products?.length || 0,
              page: state.productPage,
              hasMore: state.productHasMore,
              loading: state.productLoading,
            },
            adjustments: {
              count: state.adjustments?.length || 0,
              total: state.adjustmentTotal,
              page: state.adjustmentPage,
              hasMore: state.adjustmentHasMore,
              loading: state.adjustmentLoading,
            },
            modals: {
              productModal: state.isProductModalOpen,
              productDetail: state.isProductDetailOpen,
              adjustmentModal: state.isAdjustmentModalOpen,
              adjustmentMode: state.adjustmentModalMode, // Added this
              selectedProduct: state.selectedProduct?.id || null,
              selectedAdjustment: state.selectedAdjustment?.id || null,
            },
          });
          return state;
        },

        // Refresh data from API
        refreshAllData: async () => {
          console.log("🔄 Refreshing all data from API");
          const { resetProducts, resetAdjustments, loadAllProducts } = get();

          // Reset states
          resetProducts();
          resetAdjustments();

          // Reload products
          try {
            await loadAllProducts();
          } catch (error) {
            console.error("Error refreshing products:", error);
          }
        },

        // Get current modal state
        getCurrentModalState: () => {
          const state = get();
          return {
            isProductModalOpen: state.isProductModalOpen,
            isProductDetailOpen: state.isProductDetailOpen,
            isAdjustmentModalOpen: state.isAdjustmentModalOpen,
            adjustmentModalMode: state.adjustmentModalMode,
            selectedProduct: state.selectedProduct,
            selectedAdjustment: state.selectedAdjustment,
          };
        },
      }),
      {
        name: "inventory-storage",
        // Only persist essential data - not UI states or loading states
        partialize: (state) => ({
          products: state.products,
          adjustments: state.adjustments,
          // Don't persist: loading states, modal states, selected items
        }),
        // Merge strategy for hydration
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...persistedState,
          // Always reset UI states on hydration to prevent stuck modals
          productLoading: false,
          adjustmentLoading: false,
          isProductModalOpen: false,
          isProductDetailOpen: false,
          isAdjustmentModalOpen: false,
          adjustmentModalMode: "create",
          selectedProduct: null,
          selectedAdjustment: null,
        }),
        // Version for migration if needed
        version: 1,
      }
    ),
    {
      name: "inventory-store",
    }
  )
);

export default useStore;
