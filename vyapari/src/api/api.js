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


//new code
      
   reassignOrder: (orderId, deliveryUserId) => 
  request(`/delivery-personnel/${deliveryUserId}/reassign?orderId=${orderId}`, {
    method: "PUT",
  }),

    reassignOrderDriver: (orderId, driverName) => 
    request(`/orders/${orderId}/reassign-driver?driverName=${encodeURIComponent(driverName)}`, {
      method: "PUT",
    }),




  getDeliveryUsers: async () => {
    // 1. Fetches data from your clean /delivery-personnel java endpoint
    const data = await request("/delivery-personnel");
    
    // 2. Maps the backend fields directly to your frontend table display
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      bikeId: user.bikeId,
      phoneNumber: user.phoneNumber,
      verificationId: user.aadhaarNumber, 
      photoData: user.photoUrl,           
      status: "AVAILABLE", // Hardcoded so the frontend UI doesn't crash
      orderId: user.orderId
    }));
  },

  addDeliveryUser: async (user) => {
    // 3. Only send the basic keys your database actually has right now
    const payload = {
      name: user.name,
      bikeId: user.bikeId,
      phoneNumber: user.phoneNumber,
      aadhaarNumber: user.verificationId,
      photoUrl: user.photoData || null,
      // If the Order ID input is left empty by the seller, send a safe null
      orderId: user.orderId && user.orderId.trim() !== "" ? user.orderId : null 
    };

    const created = await request("/delivery-personnel", { 
      method: "POST", 
      body: JSON.stringify(payload) 
    });

    return {
      id: created.id,
      name: created.name,
      bikeId: created.bikeId,
      phoneNumber: created.phoneNumber,
      verificationId: created.aadhaarNumber,
      photoData: created.photoUrl,
      status: "AVAILABLE",
      orderId: created.orderId
    };
  },

  updateDeliveryUserStatus: async (userId, nextStatus) => {
    // 1. Extract the clean ID and status whether the frontend passes an ID string or the whole row object
    const finalId = typeof userId === "object" ? userId.id : userId;
    const finalStatus = typeof userId === "object" ? (userId.status === "AVAILABLE" ? "BUSY" : "AVAILABLE") : nextStatus;

    // 2. Fire the clean object structure down to match your Java Controller's Class signature perfectly
    return await request(`/delivery-personnel/${finalId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: String(finalStatus).toUpperCase().trim()  }),
    });

    // return true; // Returns a success token so loadUsers() re-fetches cleanly on the UI!
  },




  deleteDeliveryUser: (userId) =>
    request(`/delivery-personnel/${userId}`, { 
      method: "DELETE" 
    }),
};
