import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function DeliveryPersonnelList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDeliveryUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel">
      <h2>Delivery personnel</h2>
      {error && <p style={{ color: "#b3402c" }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : users.length === 0 ? (
        <p>No delivery personnel on file yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>
                  <span
                    className={`badge ${
                      u.status === "AVAILABLE" ? "badge--available" : "badge--busy"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}