import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import POSDashboard from "./POSDashboard";
import AdminDashboard from "./AdminDashboard";
import ProductList from "./components/admin/products/ProductList";

/** Redirect / to the correct home based on auth state */
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/pos"} replace />;
}

/** Thin wrappers that inject navigate + logout into the dashboards */
function AdminView() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <AdminDashboard
      user={user}
      onNavigate={(view) => {
        if (view === "pos") navigate("/pos");
        else if (view === "products") navigate("/admin/products");
        else navigate("/admin");
      }}
      onLogout={() => { logout(); navigate("/login", { replace: true }); }}
    />
  );
}

function ProductsView() {
  const navigate = useNavigate();
  return <ProductList onBack={() => navigate("/admin")} />;
}

function POSView() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <POSDashboard
      user={user}
      onNavigate={(view) => navigate(view === "admin" ? "/admin" : "/pos")}
      onLogout={() => { logout(); navigate("/login", { replace: true }); }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <ProductsView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POSView />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

