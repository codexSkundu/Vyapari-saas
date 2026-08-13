// All requests go through the Vite dev proxy (see vite.config.js),
// so paths are relative and CORS never applies in the browser.
const BASE_URL = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // =========================================================
  // AUTH — backend3 (port 8081, DB `login`, BCrypt passwords)
  // =========================================================
  login: (email, password, role) =>
    request(role === "seller" ? "/users/seller/login" : "/users/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (email, password, role) =>
    request(role === "seller" ? "/users/register/seller" : "/users/register/customer", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ============================================================
  // CUSTOMER PROFILE — com.ecom customer backend (port 8080)
  // Creates the row in ecom_db.customers whose id is used by the
  // cart / order / payment APIs. The real password lives ONLY in
  // the auth backend (BCrypt); a placeholder is stored here
  // because the column is NOT NULL.
  // ============================================================
  createCustomerProfile: (name, email) =>
    request("/customers", {
      method: "POST",
      body: JSON.stringify({ name, email, password: "MANAGED_BY_AUTH_SERVICE" }),
    }),

  getCustomerProfile: (customerId) => request(`/customers/${customerId}`),

  // ================================
  // ITEMS — customer backend
  // ================================
  getItems: () => request("/items"),

  addItem: (item) =>
    request("/items", { method: "POST", body: JSON.stringify(item) }),

  deleteItem: (itemId) =>
    request(`/items/${itemId}`, { method: "DELETE" }),

  updateItem: (itemId, changes) =>
    request(`/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(changes),
    }),

  // ================================
  // CART — customer backend
  // ================================
  getCart: (customerId) => request(`/cart/${customerId}`),

  addToCart: (customerId, itemId, quantity) =>
    request(`/cart/${customerId}/add/${itemId}?quantity=${quantity}`, {
      method: "POST",
    }),

  updateCartQuantity: (cartId, quantity) =>
    request(`/cart/${cartId}?quantity=${quantity}`, { method: "PUT" }),

  removeFromCart: (cartId) =>
    request(`/cart/${cartId}`, { method: "DELETE" }),

  // ================================
  // ORDERS — customer backend
  // ================================
  getCustomerOrders: (customerId) => request(`/orders/customer/${customerId}`),

  getOrderItems: (orderId) => request(`/orders/${orderId}/items`),

  // Order is built server-side from the customer's cart — no body.
  placeOrder: (customerId) =>
    request(`/orders/customer/${customerId}`, { method: "POST" }),

  cancelOrder: (orderId) =>
    request(`/orders/${orderId}/cancel`, { method: "PUT" }),

  // ================================
  // PAYMENTS — customer backend (COD only)
  // ================================
  createCodPayment: (orderId) =>
    request(`/payments/cod/${orderId}`, { method: "POST" }),

  getPayment: (orderId) => request(`/payments/order/${orderId}`),

  // ================================
  // ADDRESSES — customer backend
  // ================================
  addAddress: (address) =>
    request("/addresses", { method: "POST", body: JSON.stringify(address) }),

  getAddresses: (customerId) => request(`/addresses/customer/${customerId}`),

  // =====================================================================
  // LEGACY / SELLER SIDE — kept untouched so the seller dashboard still
  // compiles. These target the old vyapari-backend (proxied to :8082)
  // and are NOT part of the customer integration.
  // =====================================================================
  getOrders: () => request("/orders"),

  createOrder: (order) =>
    request("/orders", { method: "POST", body: JSON.stringify(order) }),

  reassignOrder: (orderId, deliveryUserId) =>
    request(`/delivery-personnel/${deliveryUserId}/reassign?orderId=${orderId}`, {
      method: "PUT",
    }),

  reassignOrderDriver: (orderId, driverName) =>
    request(`/orders/${orderId}/reassign-driver?driverName=${encodeURIComponent(driverName)}`, {
      method: "PUT",
    }),

  getDeliveryUsers: async () => {
    const data = await request("/delivery-personnel");
    return (data || []).map((user) => ({
      id: user.id,
      name: user.name,
      bikeId: user.bikeId,
      phoneNumber: user.phoneNumber,
      verificationId: user.aadhaarNumber,
      photoData: user.photoUrl,
      status: "AVAILABLE",
      orderId: user.orderId,
    }));
  },

  addDeliveryUser: async (user) => {
    const payload = {
      name: user.name,
      bikeId: user.bikeId,
      phoneNumber: user.phoneNumber,
      aadhaarNumber: user.verificationId,
      photoUrl: user.photoData || null,
      orderId: user.orderId && user.orderId.trim() !== "" ? user.orderId : null,
    };

    const created = await request("/delivery-personnel", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      id: created.id,
      name: created.name,
      bikeId: created.bikeId,
      phoneNumber: created.phoneNumber,
      verificationId: created.aadhaarNumber,
      photoData: created.photoUrl,
      status: "AVAILABLE",
      orderId: created.orderId,
    };
  },

  updateDeliveryUserStatus: async (userId, nextStatus) => {
    const finalId = typeof userId === "object" ? userId.id : userId;
    const finalStatus =
      typeof userId === "object"
        ? userId.status === "AVAILABLE"
          ? "BUSY"
          : "AVAILABLE"
        : nextStatus;

    return await request(`/delivery-personnel/${finalId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: String(finalStatus).toUpperCase().trim() }),
    });
  },

  deleteDeliveryUser: (userId) =>
    request(`/delivery-personnel/${userId}`, { method: "DELETE" }),
};
