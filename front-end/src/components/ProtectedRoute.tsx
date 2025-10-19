// src/components/PrivateRoute.tsx
import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const auth = useContext(AuthContext);

  if (!auth) {
    // AuthContext not initialized yet
    return <div>Loading...</div>;
  }

  const { user, loading } = auth;

  if (loading) return <div>Loading...</div>; // show spinner or placeholder

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
