const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
};

// Products API
export const fetchProducts = async (page = 1, limit = 8) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products?page=${page}&limit=${limit}`
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Adjustments API
export const fetchAdjustments = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/adjustment-transaction?page=${page}&limit=${limit}`
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    throw error;
  }
};

// NEW: Create Adjustment API
export const createAdjustment = async (adjustmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/adjustment-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustmentData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating adjustment:", error);
    throw error;
  }
};

// If you have update and delete endpoints later
export const updateAdjustment = async (id, adjustmentData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/adjustment-transaction/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustmentData),
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating adjustment:", error);
    throw error;
  }
};

export const deleteAdjustment = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/adjustment-transaction/${id}`,
      {
        method: "DELETE",
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    throw error;
  }
};
