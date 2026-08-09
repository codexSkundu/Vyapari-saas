import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingAuth from "./pages/LandingAuth";
import SellerDashboard from "./pages/SellerDashboard";
// import CustomerDashboard from "./pages/CustomerDashboard"; // build this next

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingAuth />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
        {/* <Route path="/dashboard/customer" element={<CustomerDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}