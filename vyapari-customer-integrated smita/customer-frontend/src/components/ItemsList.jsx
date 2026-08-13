import { useEffect, useState } from "react";
import { api } from "../api/api";
import { CATEGORIES } from "../data/categories";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [newItem, setNewItem] = useState({ name: "", stock: "", price: "", imageData: "" });
  const [showForm, setShowForm] = useState(false);

  const loadItems = () => {
    setLoading(true);
    api
      .getItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image is too large — please choose one under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewItem((prev) => ({ ...prev, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.addItem({
        name: newItem.name,
        stock: Number(newItem.stock),
        price: Number(newItem.price),
        imageUrl: newItem.imageData,
        category: activeCategory,
      });
      setNewItem({ name: "", stock: "", price: "", imageData: "" });
      setShowForm(false);
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

  const categoryItems = items.filter((item) => item.category === activeCategory);
  const activeCategoryLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label;

  return (
    <div>
      <div className="category-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`category-chip ${activeCategory === cat.key ? "is-active" : ""}`}
            onClick={() => {
              setActiveCategory(cat.key);
              setShowForm(false);
            }}
          >
            <span className="category-chip__icon">
              <img src={cat.image} alt={cat.label} />
            </span>
            <span className="category-chip__label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? "1rem" : 0 }}>
          <h2 style={{ margin: 0 }}>Add to {activeCategoryLabel}</h2>
          <button className="btn btn--primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add item"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd}>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Photo</label>
                <div
                  className="item-photo-picker"
                  onClick={() => document.getElementById("item-photo-input").click()}
                >
                  {newItem.imageData ? (
                    <img src={newItem.imageData} alt="Preview" />
                  ) : (
                    <span>Click to choose photo</span>
                  )}
                </div>
                <input
                  id="item-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1, minWidth: "260px" }}>
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
              </div>
            </div>

            <button type="submit" className="btn btn--primary" style={{ marginTop: "1rem" }}>
              Save item to {activeCategoryLabel}
            </button>
          </form>
        )}

        {error && <p style={{ color: "#b3402c" }}>{error}</p>}
      </div>

      <div className="panel">
        <h2>Your {activeCategoryLabel} stock</h2>

        {loading ? (
          <p>Loading items…</p>
        ) : categoryItems.length === 0 ? (
          <p>No items in {activeCategoryLabel} yet — add one above.</p>
        ) : (
          <div className="item-grid">
            {categoryItems.map((item) => (
              <div className="item-card" key={item.id}>
                <div className="item-card__thumb">
                  {item.imageData || item.imageUrl ? (
                    <img src={item.imageData || item.imageUrl} alt={item.name} />
                  ) : (
                    <span>🥬</span>
                  )}
                </div>
                <div className="item-card__name">{item.name}</div>
                <div className="item-card__stock">{item.stock} in stock</div>
                <div className="item-card__price-row">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={item.price}
                    onBlur={(e) => {
                      if (Number(e.target.value) !== item.price) {
                        handlePriceChange(item.id, e.target.value);
                      }
                    }}
                  />
                </div>
                <button className="item-card__delete" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}