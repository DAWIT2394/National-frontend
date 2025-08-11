import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ CORRECT


class ProtectedRoute extends Component {
  render() {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" />;

    try {
      const decoded = jwtDecode(token);
      if (this.props.roles && !this.props.roles.includes(decoded.role)) {
        return <Navigate to="/" />;
      }
      return this.props.children;
    } catch (err) {
      return <Navigate to="/" />;
    }
  }
}

export default ProtectedRoute;
