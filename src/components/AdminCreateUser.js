import React, { Component } from "react";
import axios from "axios";

class AdminCreateUser extends Component {
  state = {
    fullName: "",
    email: "",
    password: "",
    role: "butcher",
    loading: false,
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    try {
      await axios.post("https://national-1.onrender.com/api/auth/register", this.state);
      alert("✅ User created successfully!");
      this.setState({
        fullName: "",
        email: "",
        password: "",
        role: "butcher",
      });
    } catch (err) {
      alert("❌ Error creating user");
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Create Butcher or Cooker
          </h2>
          <form onSubmit={this.handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="fullName"
                placeholder="John Doe"
                value={this.state.fullName}
                onChange={this.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="example@mail.com"
                value={this.state.email}
                onChange={this.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={this.state.password}
                onChange={this.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={this.state.role}
                onChange={this.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="butcher">Butcher</option>
                <option value="cooker">Cooker</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={this.state.loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
            >
              {this.state.loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default AdminCreateUser;
