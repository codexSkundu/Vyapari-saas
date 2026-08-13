import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { CATEGORIES } from "../data/categories";
import "./CustomerDashboard.css";

const STATUS_CLASS = {
  PLACED: "badge--pending",
  PENDING: "badge--pending",
  IN_TRANSIT: "badge--in-transit",
  DELIVERED: "badge--delivered",
  CANCELLED: "badge--cancelled",
};

const STATUS_ETA = {
  PLACED: "Being prepared",
  PENDING: "Preparing",
  IN_TRANSIT: "On the way",
  DELIVERED: "Arrived",
  CANCELLED: "Cancelled",
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

// The customer backend's Item entity has no `category` field and stores
// `imageUrl` as short slugs (e.g. "tomatoes"), so item images are resolved
// on the frontend by matching the item name/slug against category keywords.
// This automatically covers extra database products such as Mango, Parwal,
// Potato, etc., without any database change.
const CATEGORY_KEYWORDS = [
  { key: "fruits", words: ["mango", "apple", "banana", "grape", "orange", "papaya", "guava", "litchi", "pineapple", "fruit"] },
  { key: "vegetables", words: ["potato", "onion", "tomato", "carrot", "parwal", "leafy", "green", "spinach", "cabbage", "cauliflower", "brinjal", "okra", "gourd", "chilli", "chili", "cucumber", "pea", "beans", "veg"] },
  { key: "dairy", words: ["milk", "paneer", "curd", "butter", "cheese", "ghee", "egg", "dairy", "yogurt"] },
  { key: "meat", words: ["chicken", "mutton", "meat", "pork", "beef", "lamb"] },
  { key: "fish", words: ["fish", "prawn", "shrimp", "crab", "hilsa", "rohu", "seafood"] },
  { key: "bakery", words: ["bread", "cake", "bun", "bakery", "biscuit", "cookie"] },
  { key: "beverages", words: ["juice", "tea", "coffee", "drink", "cola", "soda", "water"] },
  { key: "spices", words: ["spice", "masala", "turmeric", "cumin", "pepper", "cardamom", "clove", "coriander"] },
  { key: "grains", words: ["rice", "wheat", "atta", "dal", "lentil", "flour", "grain", "pulse", "oat"] },
  { key: "snacks", words: ["snack", "chips", "namkeen", "chocolate", "candy", "sweet"] },
];

const categoryImage = (key) =>
  CATEGORIES.find((category) => category.key === key)?.image || CATEGORIES[0].image;

const getItemImage = (item) => {
  const url = item?.imageUrl || "";
  // Only treat imageUrl as a real image source if it looks like one.
  if (/^(https?:\/\/|\/|data:)/i.test(url)) return url;

  const haystack = `${item?.name || ""} ${url} ${item?.category || ""}`.toLowerCase();
  for (const group of CATEGORY_KEYWORDS) {
    if (group.words.some((word) => haystack.includes(word))) {
      return categoryImage(group.key);
    }
  }
  return categoryImage("vegetables");
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem("vyapari_customer_id");

  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [shopMessage, setShopMessage] = useState("");
  // Cart entries mirror the backend: { id: cartId, item: {...}, quantity }
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [billingNote, setBillingNote] = useState("");
  const [billingMessage, setBillingMessage] = useState("");

  useEffect(() => {
    if (!customerId) {
      navigate("/");
      return;
    }
    loadItems();
    loadCart();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const loadItems = () => {
    setLoadingItems(true);
    setShopMessage("");
    api
      .getItems()
      .then((data) => setItems(data || []))
      .catch(() =>
        setShopMessage("Could not load items. Is the customer backend running on port 8080?")
      )
      .finally(() => setLoadingItems(false));
  };

  const loadCart = () =>
    api
      .getCart(customerId)
      .then((data) => setCart(data || []))
      .catch(() => setCart([]));

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.getCustomerOrders(customerId);

      // The backend returns order items via a separate endpoint per order.
      const withItems = await Promise.all(
        (data || []).map(async (order) => {
          let lines = [];
          try {
            lines = await api.getOrderItems(order.id);
          } catch {
            lines = [];
          }
          return {
            id: order.id,
            createdAt: order.orderDate
              ? new Date(order.orderDate).toLocaleString()
              : "",
            items: (lines || []).map((line) => ({
              name: line.item?.name || "Item",
              quantity: line.quantity,
            })),
            total: Number(order.totalAmount) || 0,
            status: order.status || "PLACED",
          };
        })
      );

      withItems.sort((a, b) => b.id - a.id);
      setOrders(withItems);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    // Keep vyapari_customer_map so this browser can log the user back in.
    localStorage.removeItem("vyapari_role");
    localStorage.removeItem("vyapari_token");
    localStorage.removeItem("vyapari_customer_id");
    localStorage.removeItem("vyapari_email");
    window.location.href = "/";
  };

  const handleAddToKart = async (item) => {
    setBillingMessage("");
    setShopMessage("");
    try {
      await api.addToCart(customerId, item.id, 1);
      await loadCart();
      setShopMessage(`${item.name} added to your kart.`);
    } catch (err) {
      setShopMessage(err.message || "Could not add the item to your kart.");
    }
  };

  const updateQuantity = async (entry, quantity) => {
    const stock = entry.item?.stock ?? 99;
    const next = Math.max(1, Math.min(Number(quantity) || 1, stock));
    try {
      await api.updateCartQuantity(entry.id, next);
    } catch {
      // fall through to reload so UI matches server state
    }
    await loadCart();
  };

  const removeFromKart = async (entry) => {
    try {
      await api.removeFromCart(entry.id);
    } catch {
      // fall through to reload
    }
    await loadCart();
  };

  const cartTotal = cart.reduce(
    (sum, entry) => sum + (entry.item?.price || 0) * entry.quantity,
    0
  );
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

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
    setBillingMessage("");

    try {
      // Save the delivery address using the existing address API
      // (free-text goes into the street field; failure is non-fatal).
      await api
        .addAddress({
          customerId: Number(customerId),
          street: address.trim(),
          addressType: "HOME",
        })
        .catch(() => {});

      // The backend builds the order from the server-side cart (no body)
      // and empties the cart afterwards.
      const order = await api.placeOrder(customerId);

      // Record the Cash-on-Delivery payment for the new order.
      try {
        await api.createCodPayment(order.id);
      } catch {
        // Payment row may already exist; the order itself succeeded.
      }

      setBillingMessage(
        `Order #${order.id} placed successfully (Cash on delivery)! Track it under Orders.`
      );
      await loadCart();
      await loadOrders();
      await loadItems();
    } catch (err) {
      setError(err.message || "Could not place the order. Please try again.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.cancelOrder(orderId);
    } catch {
      // fall through to reload
    }
    await loadOrders();
  };

  const activeTitle = TAB_TITLES[activeTab];

  if (!customerId) return null;

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
                {shopMessage && <p className="panel__subhead">{shopMessage}</p>}
                {loadingItems ? (
                  <p>Loading items…</p>
                ) : items.length === 0 ? (
                  <p className="empty-state">No items available right now.</p>
                ) : (
                  <div className="item-grid">
                    {items.map((item) => (
                      <div className="item-card" key={item.id}>
                        <div className="item-card__thumb">
                          <img src={getItemImage(item)} alt={item.name} />
                        </div>
                        <div className="item-card__name">{item.name}</div>
                        <div className="item-card__stock">{item.stock} available</div>
                        <div className="item-card__price-row">
                          <span>₹{Number(item.price).toFixed(2)}</span>
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
                      {cart.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.item?.name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={entry.item?.stock}
                              value={entry.quantity}
                              onChange={(e) => updateQuantity(entry, Number(e.target.value))}
                            />
                          </td>
                          <td>₹{Number(entry.item?.price || 0).toFixed(2)}</td>
                          <td>₹{((entry.item?.price || 0) * entry.quantity).toFixed(2)}</td>
                          <td>
                            <button className="btn btn--danger" onClick={() => removeFromKart(entry)}>
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
                        {order.items.length > 0
                          ? order.items
                              .map((item) => `${item.name} ×${item.quantity}`)
                              .join(", ")
                          : "Items unavailable"}
                      </p>
                      <div className="order-card__footer">
                        <span>Total ₹{order.total.toFixed(2)}</span>
                        <span>{STATUS_ETA[order.status] || "ETA pending"}</span>
                      </div>
                      {order.status === "PLACED" && (
                        <div style={{ marginTop: "0.85rem" }}>
                          <button
                            className="btn btn--danger"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel order
                          </button>
                        </div>
                      )}
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
