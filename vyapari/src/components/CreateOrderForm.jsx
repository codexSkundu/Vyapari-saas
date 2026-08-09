import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function CreateOrderForm() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState({}); // { itemId: quantity }
  const [dropAddress, setDropAddress] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getItems().then(setItems).catch((err) => setError(err.message));
  }, []);

  const toggleItem = (itemId) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (itemId in next) {
        delete next[itemId];
      } else {
        next[itemId] = 1;
      }
      return next;
    });
  };

  const setQuantity = (itemId, qty) => {
    setSelected((prev) => ({ ...prev, [itemId]: Number(qty) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    const orderItems = Object.entries(selected).map(([itemId, quantity]) => ({
      itemId: Number(itemId),
      quantity,
    }));

    if (orderItems.length === 0) {
      setError("Select at least one item.");
      return;
    }
    if (!dropAddress.trim()) {
      setError("Drop address is required.");
      return;
    }

    try {
      await api.createOrder({ items: orderItems, dropAddress });
      setStatus("Order created.");
      setSelected({});
      setDropAddress("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Create order</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Items</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <input
                  type="checkbox"
                  checked={item.id in selected}
                  onChange={() => toggleItem(item.id)}
                  id={`item-${item.id}`}
                />
                <label htmlFor={`item-${item.id}`} style={{ minWidth: "160px" }}>
                  {item.name} <span style={{ color: "#8a8a8a" }}>({item.stock} in stock)</span>
                </label>
                {item.id in selected && (
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={selected[item.id]}
                    onChange={(e) => setQuantity(item.id, e.target.value)}
                    style={{ width: "70px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Drop address</label>
          <textarea
            rows={3}
            value={dropAddress}
            onChange={(e) => setDropAddress(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "#b3402c" }}>{error}</p>}
        {status && <p style={{ color: "#1f6b3d" }}>{status}</p>}

        <button type="submit" className="btn btn--primary">
          Create order
        </button>
      </form>
    </div>
  );
}