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

  // const handleReassign = async (orderId, deliveryUserId) => {
  //   try {
  //     await api.reassignOrder(orderId, Number(deliveryUserId));
  //     load();
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

    const handleReassign = async (orderId, deliveryUserId) => {
    if (!deliveryUserId) return;
    
    // 1. Get the actual string name of the driver from the state array
    const targetDriver = deliveryUsers.find(user => String(user.id) === String(deliveryUserId));
    if (!targetDriver) return;

    try {
      setError("");
      
      // 2. Fire the network request to save to your MySQL database
      await api.reassignOrderDriver(orderId, targetDriver.name);
      
      // 3. Update the UI state directly in memory to avoid backend mapping mismatches
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, assigned_to_name: targetDriver.name, assignedToName: targetDriver.name, status: "IN_TRANSIT" } 
            : order
        )
      );

    } catch (err) {
      setError("Could not update dropdown assignment: " + err.message);
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
                  {/* {order.items_summary
                    ?.map((i) => `${i.name} ×${i.quantity}`)
                    .join(", ")
                    } */}
                    {order.itemsSummary || "No items"}
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASS[order.status] || ""}`}>
                    {order.status}
                  </span>
                </td>
               


          {/* <td>{order.assigned_to_name || "Unassigned"}</td> */}

                    {/* Replace line 73 with this line to catch both naming variants safely */}
          <td>{order.assigned_to_name || order.assignedToName || "Unassigned"}</td>


          <td>{order.dropAddress}</td>
          <td>
            <select 
              defaultValue=""
              onChange={(e) => handleReassign(order.id, e.target.value)}
            >
              <option value="" disabled>
                Reassign...
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