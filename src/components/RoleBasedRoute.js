// components/RoleBasedRoute.js
import { Navigate } from 'react-router-dom';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
