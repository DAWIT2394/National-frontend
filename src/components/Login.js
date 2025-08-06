import React, { useState } from 'react';
import axios from 'axios';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:9000/api/auth/login', formData);
      setUserInfo(res.data.user);
      setMessage('Login successful');
      // Optionally, store token or user info in localStorage
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Sign In</button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
      {userInfo && (
        <div className="mt-4 text-sm text-center">
          <p>Welcome, {userInfo.name} ({userInfo.role})</p>
        </div>
      )}
    </div>
  );
}
