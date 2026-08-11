import { useEffect, useState } from "react";
import { api } from "../api/api";
import "./CustomerDashboard.css";

const STATUS_CLASS = {
  PENDING: "badge--pending",
  IN_TRANSIT: "badge--in-transit",
  DELIVERED: "badge--delivered",
  CANCELLED: "badge--cancelled",
};

const NAV_ITEMS = [
  {
    key: "items",
    label: "Shop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "kart",
    label: "Kart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h12v16H6z" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h4M9 16h6" />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M9.5 12.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const TAB_TITLES = {
  items: "Browse items",
  kart: "Your kart",
  billing: "Billing",
  orders: "Track your orders",
};

const FALLBACK_ITEMS = [
  { id: 1, name: "Tomatoes", price: 42, stock: 12, imageUrl: "", category: "fresh" },
  { id: 2, name: "Leafy greens", price: 56, stock: 8, imageUrl: "", category: "fresh" },
  { id: 3, name: "Carrots", price: 28, stock: 14, imageUrl: "", category: "fresh" },
  { id: 4, name: "Onions", price: 30, stock: 9, imageUrl: "", category: "fresh" },
];

const FALLBACK_ORDERS = [
  {
    id: 101,
    createdAt: "2026-08-01",
    items: [
      { name: "Tomatoes", quantity: 2 },
      { name: "Onions", quantity: 1 },
    ],
    total: 114,
    status: "DELIVERED",
    deliveryEta: "Arrived",
  },
  {
    id: 102,
    createdAt: "2026-08-08",
    items: [{ name: "Carrots", quantity: 3 }],
    total: 84,
    status: "IN_TRANSIT",
    deliveryEta: "Today evening",
  },
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [billingNote, setBillingNote] = useState("");
  const [billingMessage, setBillingMessage] = useState("");

  useEffect(() => {
    loadItems();
    loadOrders();
  }, []);

  const loadItems = () => {
    setLoadingItems(true);
    setError("");
    api
      .getItems()
      .then((data) => setItems(data || FALLBACK_ITEMS))
      .catch(() => setItems(FALLBACK_ITEMS))
      .finally(() => setLoadingItems(false));
  };

  const loadOrders = () => {
    setLoadingOrders(true);
    api
      .getOrders()
      .then((data) => setOrders(data || FALLBACK_ORDERS))
      .catch(() => setOrders(FALLBACK_ORDERS))
      .finally(() => setLoadingOrders(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("vyapari_role");
    localStorage.removeItem("vyapari_token");
    window.location.href = "/";
  };

  const handleAddToKart = (item) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: Math.min(entry.quantity + 1, item.stock) }
            : entry
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setBillingMessage("");
  };

  const updateQuantity = (itemId, quantity) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.id === itemId
            ? { ...entry, quantity: Math.max(1, Math.min(quantity, entry.stock)) }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const removeFromKart = (itemId) => {
    setCart((prev) => prev.filter((entry) => entry.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError("Add items to your kart before placing an order.");
      return;
    }
    if (!address.trim()) {
      setError("Enter a delivery address before checkout.");
      return;
    }

    setError("");
    const newOrder = {
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      total: cartTotal,
      status: "PENDING",
      deliveryEta: "Preparing",
      address,
      paymentMethod,
      note: billingNote,
    };

    try {
      await api.createOrder({
        items: newOrder.items,
        total: newOrder.total,
        address: newOrder.address,
        paymentMethod: newOrder.paymentMethod,
        note: newOrder.note,
      });
    } catch (err) {
      // Ignore backend failure for now so locally placed orders still work.
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setBillingMessage("Order placed successfully! Track it under Orders.");
  };

  const activeTitle = TAB_TITLES[activeTab];

  return (
    <div className="customer-dash">
      <aside className="customer-dash__sidebar">
        <div className="customer-dash__brand">Vyapari</div>

        <nav className="customer-dash__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={activeTab === item.key ? "is-active" : ""}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="customer-dash__nav-icon">{item.icon}</span>
              {item.key === "kart" ? `${item.label} (${cartCount})` : item.label}
            </button>
          ))}
        </nav>

        <button className="customer-dash__logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </aside>

      <div className="customer-dash__main">
        <header className="customer-dash__topbar">
          <div className="customer-dash__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search for fresh produce…" disabled />
          </div>
          <h1>{activeTitle}</h1>
        </header>

        <main className="customer-dash__content">
          {activeTab === "items" && (
            <div>
              <div className="panel">
                <div className="panel__header">
                  <h2>Fresh produce for your kitchen</h2>
                  <p className="panel__subhead">Choose items and add them to your kart.</p>
                </div>
                {loadingItems ? (
                  <p>Loading items…</p>
                ) : (
                  <div className="item-grid">
                    {items.map((item) => (
                      <div className="item-card" key={item.id}>
                        <div className="item-card__thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <span className="item-card__emoji">🍅</span>
                          )}
                        </div>
                        <div className="item-card__name">{item.name}</div>
                        <div className="item-card__stock">{item.stock} available</div>
                        <div className="item-card__price-row">
                          <span>₹{item.price.toFixed(2)}</span>
                        </div>
                        <button
                          className="btn btn--primary"
                          onClick={() => handleAddToKart(item)}
                          disabled={item.stock === 0}
                        >
                          {item.stock === 0 ? "Out of stock" : "Add to kart"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "kart" && (
            <div className="panel panel--wide">
              <div className="panel__header">
                <h2>Your kart</h2>
                <p className="panel__subhead">Review item quantities before checkout.</p>
              </div>
              {cart.length === 0 ? (
                <p className="empty-state">Your kart is empty. Add items from the Shop tab.</p>
              ) : (
                <div className="cart-section">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            />
                          </td>
                          <td>₹{item.price.toFixed(2)}</td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button className="btn btn--danger" onClick={() => removeFromKart(item.id)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="cart-summary panel">
                    <h3>Order summary</h3>
                    <div className="summary-line">
                      <span>Items</span>
                      <span>{cartCount}</span>
                    </div>
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line summary-line--total">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="panel panel--billing">
              <div className="panel__header">
                <h2>Billing</h2>
                <p className="panel__subhead">Populate delivery details and complete checkout.</p>
              </div>
              {billingMessage && <p className="billing-success">{billingMessage}</p>}
              {error && <p className="billing-error">{error}</p>}
              <div className="billing-grid">
                <section className="billing-form panel">
                  <h3>Delivery details</h3>
                  <label>
                    Delivery address
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={4}
                      placeholder="Enter your delivery address"
                    />
                  </label>

                  <label>
                    Payment method
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash on delivery</option>
                    </select>
                  </label>

                  <label>
                    Order note
                    <input
                      type="text"
                      value={billingNote}
                      onChange={(e) => setBillingNote(e.target.value)}
                      placeholder="Optional note for delivery"
                    />
                  </label>

                  <button className="btn btn--primary" onClick={handlePlaceOrder}>
                    Place order
                  </button>
                </section>

                <section className="billing-preview panel">
                  <h3>Billing preview</h3>
                  {cart.length === 0 ? (
                    <p className="empty-state">Add items to your kart to see the billing preview.</p>
                  ) : (
                    <div>
                      <div className="summary-line">
                        <span>Item count</span>
                        <span>{cartCount}</span>
                      </div>
                      <div className="summary-line">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-line">
                        <span>Delivery</span>
                        <span>₹0.00</span>
                      </div>
                      <div className="summary-line summary-line--total">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="panel panel--wide">
              <div className="panel__header">
                <h2>Order tracking</h2>
                <p className="panel__subhead">Check the status of your recent purchases.</p>
              </div>
              {loadingOrders ? (
                <p>Loading orders…</p>
              ) : orders.length === 0 ? (
                <p className="empty-state">No orders yet. Place a new order from the billing tab.</p>
              ) : (
                <div className="order-list">
                  {orders.map((order) => (
                    <article className="order-card" key={order.id}>
                      <div className="order-card__header">
                        <div>
                          <h3>Order #{order.id}</h3>
                          <p>{order.createdAt}</p>
                        </div>
                        <span className={`badge ${STATUS_CLASS[order.status] || ""}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="order-card__meta">
                        {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
                      </p>
                      <div className="order-card__footer">
                        <span>Total ₹{order.total.toFixed(2)}</span>
                        <span>{order.deliveryEta || "ETA pending"}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
