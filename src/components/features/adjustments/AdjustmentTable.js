"use client";

import { useEffect, useState, useCallback } from "react";
import useStore from "@/store/useStore";
import { fetchAdjustments, deleteAdjustment } from "@/utils/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function AdjustmentTable() {
  const {
    adjustments,
    adjustmentPage,
    adjustmentTotal,
    adjustmentLoading,
    openAdjustmentModal,
    setAdjustments,
    setAdjustmentLoading,
    setAdjustmentPage,
    setAdjustmentTotal,
    deleteAdjustment: removeAdjustmentFromStore,
    resetAdjustments,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const itemsPerPage = 10;

  // Load adjustments function
  const loadAdjustments = useCallback(
    async (page = 1) => {
      if (adjustmentLoading) return;

      setAdjustmentLoading(true);
      try {
        const response = await fetchAdjustments(page, itemsPerPage);

        if (response && response.success && response.data) {
          setAdjustments(response.data);
          setAdjustmentTotal(response.pagination?.total || 0);
          setAdjustmentPage(page);
        }
      } catch (error) {
        console.error("Error loading adjustments:", error);
        setAdjustments([]);
        setAdjustmentTotal(0);
      } finally {
        setAdjustmentLoading(false);
      }
    },
    [
      adjustmentLoading,
      setAdjustments,
      setAdjustmentLoading,
      setAdjustmentPage,
      setAdjustmentTotal,
    ]
  );

  // Handle delete
  const handleDelete = async (adjustment) => {
    const confirmMessage = `Are you sure you want to delete adjustment #${adjustment.id} for ${adjustment.title}?`;
    if (!confirm(confirmMessage)) return;

    // Add to deleting set
    setDeletingIds((prev) => new Set([...prev, adjustment.id]));

    try {
      console.log("🗑️ Deleting adjustment via API:", adjustment.id);

      // Call delete API
      await deleteAdjustment(adjustment.id);
      console.log("Adjustment deleted successfully from API");

      // Remove from store after successful API call
      removeAdjustmentFromStore(adjustment.id);

      // Show success message
    } catch (error) {
      console.error("Error deleting adjustment:", error);
      alert(`Failed to delete adjustment: ${error.message}`);
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(adjustment.id);
        return newSet;
      });
    }
  };

  // Handle view
  const handleView = (adjustment) => {
    openAdjustmentModal(adjustment, "view");
  };

  // Handle edit
  const handleEdit = (adjustment) => {
    openAdjustmentModal(adjustment, "edit");
  };

  // Handle create
  const handleCreate = () => {
    openAdjustmentModal(null, "create");
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage !== adjustmentPage && newPage > 0 && newPage <= totalPages) {
      loadAdjustments(newPage);
    }
  };

  // Refresh function
  const refresh = () => {
    resetAdjustments();
    setMounted(false);
  };

  // Initial load
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      loadAdjustments(1);
    }
  }, [mounted, loadAdjustments]);

  const totalPages = Math.ceil(adjustmentTotal / itemsPerPage);
  const startItem = (adjustmentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(adjustmentPage * itemsPerPage, adjustmentTotal);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getAdjustmentType = (qty, amount) => {
    if (qty > 0 || amount > 0) {
      return {
        type: "Stock In",
        color: "bg-green-100 text-green-800",
        icon: "+",
      };
    } else {
      return { type: "Stock Out", color: "bg-red-100 text-red-800", icon: "-" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Adjustment Transactions
            </h1>
            <p className="text-gray-600">
              {adjustmentTotal > 0
                ? `${adjustmentTotal} transactions total`
                : "Manage your inventory adjustments"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={refresh}
              disabled={adjustmentLoading}
              size="sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>

            <Button onClick={handleCreate}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Adjustment
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {adjustmentLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-12">
          <LoadingSpinner text="Loading adjustment transactions..." />
        </div>
      ) : adjustments && adjustments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adjustments.map((adjustment) => {
                  const typeInfo = getAdjustmentType(
                    adjustment.qty,
                    adjustment.amount
                  );
                  const isDeleting = deletingIds.has(adjustment.id);

                  return (
                    <tr
                      key={adjustment.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isDeleting ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          #{adjustment.id}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {adjustment.image ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                                src={adjustment.image}
                                alt={adjustment.title}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-gray-400"
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
                            )}
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {adjustment.title || "Unknown Product"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {adjustment.sku || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}
                        >
                          <span className="mr-1">{typeInfo.icon}</span>
                          {typeInfo.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {Math.abs(adjustment.qty)?.toLocaleString() || "0"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${adjustment.amount?.toFixed(2) || "0.00"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(adjustment.created_at)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(adjustment)}
                            disabled={isDeleting}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(adjustment)}
                            disabled={isDeleting}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(adjustment)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isDeleting ? (
                              <>
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{startItem}</span> to{" "}
                  <span className="font-medium">{endItem}</span> of{" "}
                  <span className="font-medium">{adjustmentTotal}</span> results
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(adjustmentPage - 1)}
                    disabled={adjustmentPage <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (adjustmentPage <= 3) {
                        page = i + 1;
                      } else if (adjustmentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = adjustmentPage - 2 + i;
                      }

                      if (page < 1 || page > totalPages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            page === adjustmentPage
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(adjustmentPage + 1)}
                    disabled={adjustmentPage >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No adjustment transactions
            </h3>
            <p className="text-gray-600 mb-8">
              Track your inventory changes by creating adjustment transactions.
            </p>
            <Button onClick={handleCreate} size="lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Your First Adjustment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
