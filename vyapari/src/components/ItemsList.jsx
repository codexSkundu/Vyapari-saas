import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({ name: "", stock: "", price: "" });

  const loadItems = () => {
    setLoading(true);
    api
      .getItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.addItem({
        name: newItem.name,
        stock: Number(newItem.stock),
        price: Number(newItem.price),
      });
      setNewItem({ name: "", stock: "", price: "" });
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.deleteItem(itemId);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePriceChange = async (itemId, price) => {
    try {
      await api.updateItem(itemId, { price: Number(price) });
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Items</h2>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field">
          <label>Name</label>
          <input
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Stock</label>
          <input
            type="number"
            min="0"
            value={newItem.stock}
            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn--primary" style={{ marginBottom: "0.9rem" }}>
          Add item
        </button>
      </form>

      {error && <p style={{ color: "#b3402c" }}>{error}</p>}

      {loading ? (
        <p>Loading items…</p>
      ) : items.length === 0 ? (
        <p>No items yet — add your first one above.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={item.price}
                    style={{ width: "90px" }}
                    onBlur={(e) => {
                      if (Number(e.target.value) !== item.price) {
                        handlePriceChange(item.id, e.target.value);
                      }
                    }}
                  />
                </td>
                <td>
                  <button className="btn btn--danger" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}