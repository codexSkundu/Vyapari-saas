import { useState } from "react";
import ItemsList from "../components/ItemsList";
import OrdersTable from "../components/OrdersTable";
import DeliveryPersonnelList from "../components/DeliveryPersonnelList";
import "./SellerDashboard.css";

const NAV_ITEMS = [
  {
    key: "items",
    label: "Items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Order list",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "delivery",
    label: "Delivery personnel",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TAB_TITLES = {
  items: "Items",
  orders: "Order list",
  delivery: "Delivery personnel",
};

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("items");

  const handleLogout = () => {
    localStorage.removeItem("vyapari_role");
    localStorage.removeItem("vyapari_token");
    window.location.href = "/";
  };

  return (
    <div className="seller-dash">
      <aside className="seller-dash__sidebar">
        <div className="seller-dash__brand">Vyapari</div>

        <nav className="seller-dash__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={activeTab === item.key ? "is-active" : ""}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="seller-dash__nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="seller-dash__logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </aside>

      <div className="seller-dash__main">
        <header className="seller-dash__topbar">
          <div className="seller-dash__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search your items, orders…" disabled />
          </div>
          <h1>{TAB_TITLES[activeTab]}</h1>
        </header>

        <main className="seller-dash__content">
          {activeTab === "items" && <ItemsList />}
          {activeTab === "orders" && <OrdersTable />}
          {activeTab === "delivery" && <DeliveryPersonnelList />}
        </main>
      </div>
    </div>
  );
}