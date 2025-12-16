import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { isBooting, isAuthed } = useAuth();

  if (isBooting) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}
