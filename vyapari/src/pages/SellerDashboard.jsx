import { useState } from "react";
import ItemsList from "../components/ItemsList";
import CreateOrderForm from "../components/CreateOrderForm";
import OrdersTable from "../components/OrdersTable";
import DeliveryPersonnelList from "../components/DeliveryPersonnelList";
import "./SellerDashboard.css";

const TABS = [
  { key: "items", label: "Items" },
  { key: "create-order", label: "Create order" },
  { key: "orders", label: "Orders" },
  { key: "delivery", label: "Delivery personnel" },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="seller-dash">
      <header className="seller-dash__header">
        <h1>Seller dashboard</h1>
        <nav className="seller-dash__nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "is-active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="seller-dash__content">
        {activeTab === "items" && <ItemsList />}
        {activeTab === "create-order" && <CreateOrderForm />}
        {activeTab === "orders" && <OrdersTable />}
        {activeTab === "delivery" && <DeliveryPersonnelList />}
      </main>
    </div>
  );
}