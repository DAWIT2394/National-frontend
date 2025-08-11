import React, { Component } from 'react';
import axios from 'axios';

class AdminCreateUser extends Component {
  state = {
    fullName: '',
    email: '',
    password: '',
    role: 'butcher',
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:9000/api/auth/register', this.state);
      alert('User created!');
      this.setState({ fullName: '', email: '', password: '', role: 'butcher' });
    } catch (err) {
      alert('Error creating user');
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form">
        <h2>Create Butcher or Cooker</h2>
        <input name="fullName" placeholder="Full Name" value={this.state.fullName} onChange={this.handleChange} />
        <input name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} />
        <input name="password" type="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} />
        <select name="role" value={this.state.role} onChange={this.handleChange}>
          <option value="butcher">Butcher</option>
          <option value="cooker">Cooker</option>
        </select>
        <button type="submit">Create</button>
      </form>
    );
  }
}

export default AdminCreateUser;
