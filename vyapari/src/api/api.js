const BASE_URL = "http://localhost:8080/api";

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
  login: (email, password, role) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  signup: (email, password, role) =>
    request("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

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

  getOrders: () => request("/orders"),

  createOrder: (order) =>
    request("/orders", { method: "POST", body: JSON.stringify(order) }),

  reassignOrder: (orderId, deliveryUserId) =>
    request(`/orders/${orderId}/reassign`, {
      method: "PUT",
      body: JSON.stringify({ assignedToUserId: deliveryUserId }),
    }),

  getDeliveryUsers: () => request("/delivery-users"),

  addDeliveryUser: (user) =>
    request("/delivery-users", { method: "POST", body: JSON.stringify(user) }),

  updateDeliveryUserStatus: (userId, status) =>
    request(`/delivery-users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  deleteDeliveryUser: (userId) =>
    request(`/delivery-users/${userId}`, { method: "DELETE" }),
};