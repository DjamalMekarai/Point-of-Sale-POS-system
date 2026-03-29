import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLayout from "./components/admin/layout/AdminLayout";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ProductList from "./components/admin/products/ProductList";
import TablesPage from "./pages/admin/TablesPage";
import StaffPage from "./pages/admin/StaffPage";
import InventoryPage from "./pages/admin/InventoryPage";
import ReportsPage from "./pages/admin/ReportsPage";
import CustomersPage from "./pages/admin/CustomersPage";
import DiscountsPage from "./pages/admin/DiscountsPage";
import KitchenPage from "./pages/admin/KitchenPage";
import SettingsPage from "./pages/admin/SettingsPage";

// POS View
import POSDashboard from "./POSDashboard";

/** Redirect / to the correct home based on auth state */
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/pos"} replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductList />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="discounts" element={<DiscountsPage />} />
            <Route path="kitchen" element={<KitchenPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* POS Route */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POSDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
