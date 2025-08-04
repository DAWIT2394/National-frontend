// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6000/api', // Adjust this to match your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
