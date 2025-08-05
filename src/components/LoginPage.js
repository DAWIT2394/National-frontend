// pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:9000/api/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'butcher') navigate('/butcher');
      else if (res.data.role === 'cooker') navigate('/cooker');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Login</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-2 p-2 border"
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-2 p-2 border"
        placeholder="Password"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2"
      >
        Login
      </button>
    </div>
  );
}
