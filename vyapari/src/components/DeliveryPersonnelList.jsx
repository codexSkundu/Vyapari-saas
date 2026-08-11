import { useEffect, useState } from "react";
import { api } from "../api/api";

const EMPTY_FORM = { name: "", bikeId: "", phoneNumber: "", verificationId: "", photoData: "", orderId: "" };

export default function DeliveryPersonnelList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadUsers = () => {
    setLoading(true);
    api
      .getDeliveryUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Photo is too large — please choose one under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { orderId, ...personnelData } = form;
      const created = await api.addDeliveryUser({ ...personnelData, status: "AVAILABLE" });

      // if (orderId && created?.id) {
      //   await api.reassignOrder(Number(orderId), created.id);
      // }
    // Send orderId cleanly as a String
      if (orderId && orderId.trim() !== "" && created?.id) {
        await api.reassignOrder(orderId, created.id); 
      }

      loadUsers();
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to add delivery personnel.");
    }
  };

  const handleToggleStatus = async (user) => {
    const currentStatus = String(user.status).toUpperCase().trim();
    const nextStatus = currentStatus === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    try {
      // await api.updateDeliveryUserStatus(user.id, nextStatus);
      // await loadUsers();  // Refresh the list instantly to show the new badge
       // 2. Pass ID and explicit text as clear, separated arguments
    await api.updateDeliveryUserStatus(user.id, nextStatus);
    
    // 3. Trigger a complete, hard fetch to pull down the newly saved data
    await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.deleteDeliveryUser(userId);
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Delivery personnel</h2>
        <button className="btn btn--primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add personnel"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="panel" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Photo</label>
              <div
                className="item-photo-picker"
                style={{ width: "96px", height: "120px" }}
                onClick={() => document.getElementById("personnel-photo-input").click()}
              >
                {form.photoData ? (
                  <img src={form.photoData} alt="Preview" />
                ) : (
                  <span>Passport size photo</span>
                )}
              </div>
              <input
                id="personnel-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1, minWidth: "260px" }}>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ flex: "1 1 160px" }}>
                <label>Bike ID</label>
                <input
                  value={form.bikeId}
                  onChange={(e) => setForm({ ...form, bikeId: e.target.value })}
                  placeholder="e.g. WB-11 AB 1234"
                  required
                />
              </div>
              <div className="field" style={{ flex: "1 1 160px" }}>
                <label>Phone number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="10-digit number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label>Verification ID (Aadhaar)</label>
                <input
                  value={form.verificationId}
                  onChange={(e) => setForm({ ...form, verificationId: e.target.value })}
                  placeholder="XXXX XXXX XXXX"
                  required
                />
              </div>
              <div className="field" style={{ flex: "1 1 160px" }}>
                <label>Order ID to deliver (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="e.g. 12"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ marginTop: "0.75rem" }}>
            Save
          </button>
        </form>
      )}

      {error && <p style={{ color: "#b3402c" }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : users.length === 0 ? (
        <p>No delivery personnel on file yet — click "+ Add personnel" to add one.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Bike ID</th>
              <th>Phone</th>
              <th>Verification ID</th>
              <th>ORDER ID</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: "var(--forest)" }}>#{u.id}</td>
                <td>
                  {u.photoData || u.photoUrl ? (
                    <img
                      src={u.photoData || u.photoUrl}
                      alt={u.name}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#e9f1ea",
                      }}
                    />
                  )}
                </td>
                <td>{u.name}</td>
                <td>{u.bikeId || "—"}</td>
                <td>{u.phoneNumber || "—"}</td>
                <td>{u.verificationId ? maskId(u.verificationId) : "—"}</td>

                <td>
                  {u.orderId ? (
                    // If an order ID is already assigned, display it clearly
                    <span style={{ fontWeight: "bold", color: "#157347" }}>{u.orderId}</span>
                  ) : (
                    // If no order ID is filled, show a button to link one on demand later
                    <button 
                      style={{ padding: "4px 8px", fontSize: "12px", background: "#f8f9fa", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer" }}
                      onClick={async () => {
                        const typedOrderId = prompt(`Enter Order ID to assign to ${u.name}:`);
                        if (typedOrderId && typedOrderId.trim() !== "") {
                          try {
                            // Sends update down your network api bridge configuration layers
                            await api.reassignOrder(typedOrderId, u.id);
                            alert(`Successfully linked Order #${typedOrderId} to ${u.name}!`);

                            // Re-fetches fresh entries from MySQL to instantly update the UI text rows
                            loadUsers(); 
                          } catch (err) {
                            alert("Could not assign order parameter: " + err.message);
                          }
                        }
                      }}
                    >
                      + Link Order
                    </button>
                  )}
                </td>



                <td>
                  <button
                    className={`badge ${u.status === "AVAILABLE" ? "badge--available" : "badge--busy"}`}
                    style={{ border: "none", cursor: "pointer" }}
                    onClick={() => handleToggleStatus(u)}
                    title="Click to toggle status"
                  >
                    {u.status}
                  </button>
                </td>
                <td>
                  <button className="btn btn--danger" onClick={() => handleDelete(u.id)}>
                    Remove
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

function maskId(id) {
  const digits = id.replace(/\s/g, "");
  if (digits.length < 4) return id;
  const last4 = digits.slice(-4);
  return `XXXX XXXX ${last4}`;
}