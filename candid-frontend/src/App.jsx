import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import HostEvent from "./pages/HostEventPage";
import AuthCallback from "./pages/AuthCallback";

function DashboardWrapper() {
  const { eventId } = useParams();
  return <Dashboard eventId={eventId} />;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing /> />
      <Route path="/auth/callback" element={<AuthCallback /> />
      <Route path="/host" element={<Protected><HostEvent /></Protected> />
      <Route path="/event/:eventId" element={<Protected><DashboardWrapper /></Protected> />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
