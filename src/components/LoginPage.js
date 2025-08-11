import React, { Component } from 'react';
import axios from 'axios';
import { withNavigation } from '../utils/withNavigation'; // adjust path if needed

class LoginPage extends Component {
  state = {
    email: '',
    password: '',
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:9000/api/auth/login', this.state);
      localStorage.setItem('token', res.data.token);
      const role = res.data.role;

      if (role === 'admin') {
        this.props.navigate('/AllComponents');
      } else if (role === 'butcher') {
        this.props.navigate('/butcherpage');
      } else if (role === 'cooker') {
        this.props.navigate('/CookerPage');
      } else {
        alert('Role not recognized');
      }
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  render() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
          <form onSubmit={this.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                placeholder="Enter your email"
                onChange={this.handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={this.handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-300"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don’t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default withNavigation(LoginPage);
