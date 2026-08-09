import { useEffect, useState } from "react";
import { api } from "../api/api";

const STATUS_CLASS = {
  PENDING: "badge--pending",
  IN_TRANSIT: "badge--in-transit",
  DELIVERED: "badge--delivered",
  CANCELLED: "badge--cancelled",
};

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.getOrders(), api.getDeliveryUsers()])
      .then(([ordersData, usersData]) => {
        setOrders(ordersData);
        setDeliveryUsers(usersData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReassign = async (orderId, deliveryUserId) => {
    try {
      await api.reassignOrder(orderId, Number(deliveryUserId));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Orders</h2>
      {error && <p style={{ color: "#b3402c" }}>{error}</p>}
      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Items</th>
              <th>Status</th>
              <th>Assigned to</th>
              <th>Drop address</th>
              <th>Reassign</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  {order.items
                    ?.map((i) => `${i.name} ×${i.quantity}`)
                    .join(", ")}
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASS[order.status] || ""}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.assignedToName || "Unassigned"}</td>
                <td>{order.dropAddress}</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) handleReassign(order.id, e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Reassign…
                    </option>
                    {deliveryUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.status})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}