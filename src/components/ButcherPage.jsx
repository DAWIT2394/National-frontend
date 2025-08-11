import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function ButcherPage() {
  const [items, setItems] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [sharedKg, setSharedKg] = useState('');
  const [orderType, setOrderType] = useState('INDOOR');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingWaiters, setLoadingWaiters] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= twentyFourHoursAgo;
  });

  const kgByMeatType = {};
  recentOrders.forEach((order) => {
    const kg = order.kilogram;
    const meats = Array.isArray(order.meatType) ? order.meatType : [order.meatType];
    meats.forEach((meat) => {
      if (!kgByMeatType[meat]) kgByMeatType[meat] = 0;
      kgByMeatType[meat] += kg / meats.length;
    });
  });

  const pieData = Object.entries(kgByMeatType).map(([meat, kg]) => ({
    name: meat,
    value: parseFloat(kg.toFixed(2)),
  }));

  useEffect(() => {
    fetchItems();
    fetchWaiters();
    fetchOrders();
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await axios.get('http://localhost:9000/api/items/');
      setItems(res.data);
    } catch {
      setErrorMessage('Failed to load items.');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchWaiters = async () => {
    setLoadingWaiters(true);
    try {
      const res = await axios.get('http://localhost:9000/api/waiters/');
      setWaiters(res.data);
    } catch {
      setErrorMessage('Failed to load waiters.');
    } finally {
      setLoadingWaiters(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get('http://localhost:9000/api/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelect = (itemName) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  const resetForm = () => {
    setSelectedItems([]);
    setCustomerName('');
    setSharedKg('');
    setSelectedWaiter('');
    setOrderType('INDOOR');
    setEditOrderId(null);
  };

  const handleSubmit = async () => {
    if (!sharedKg || isNaN(sharedKg) || parseFloat(sharedKg) <= 0) {
      setErrorMessage('Please enter a valid KG.');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one item.');
      return;
    }
    if (orderType === 'INDOOR' && !selectedWaiter) {
      setErrorMessage('Please select a waiter.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      meatType: selectedItems,
      salesType: orderType,
      customerName,
      waiterName: orderType === 'INDOOR' ? selectedWaiter : '',
      kilogram: parseFloat(sharedKg),
    };

    try {
      if (editOrderId) {
        await axios.put(`http://localhost:9000/api/orders/${editOrderId}`, payload);
        alert('Order updated successfully!');
      } else {
        await axios.post('http://localhost:9000/api/orders/', payload);
        alert('Order submitted successfully!');
      }
      resetForm();
      fetchOrders();
    } catch {
      setErrorMessage('Failed to save order.');
    } finally {
      setSubmitting(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure you want to delete this order?')) {
  //     try {
  //       await axios.delete(`http://localhost:9000/api/orders/${id}`);
  //       fetchOrders();
  //     } catch {
  //       setErrorMessage('Failed to delete order.');
  //     }
  //   }
  // };

  const handleEdit = (order) => {
    setEditOrderId(order._id);
    setSelectedItems(order.meatType);
    setCustomerName(order.customerName);
    setSharedKg(order.kilogram.toString());
    setOrderType(order.salesType);
    setSelectedWaiter(order.waiterName || '');
  };

  const formattedTime = currentDateTime.toLocaleString();

  const totalPages = Math.ceil(recentOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = recentOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10 overflow-auto">
      <div className="w-full max-w-5xl px-4 sm:px-6 md:px-8 py-6 bg-zinc-900 rounded-xl shadow-xl">

        {/* Logo */}
        <img src="/logo.png" alt="Logo" className="h-16 mb-4 mx-auto" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-500">
            {editOrderId ? 'Edit Order' : 'Butcher/ስጋ ቤት'}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              onClick={fetchItems}
              disabled={loadingItems}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-500 disabled:opacity-50"
            >
              {loadingItems ? 'Loading...' : 'Refresh Items'}
            </button>
            <button
              onClick={fetchWaiters}
              disabled={loadingWaiters}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-500 disabled:opacity-50"
            >
              {loadingWaiters ? 'Loading...' : 'Refresh Waiters'}
            </button>
            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded border border-red-500 text-white disabled:opacity-50"
            >
              {loadingOrders ? 'Refreshing...' : 'Refresh Orders'}
            </button>
            <span className="text-red-400">{formattedTime}</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
            {errorMessage}
          </div>
        )}

        {/* Select Items */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-red-400 mb-2">Select Items</label>
          {items.length === 0 && !loadingItems ? (
            <div className="text-center text-gray-400">No items found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => {
                const isSelected = selectedItems.includes(item.name);
                return (
                  <div
                    key={item._id}
                    onClick={() => handleSelect(item.name)}
                    className={`p-3 rounded-lg text-center cursor-pointer transition border
                      ${isSelected ? 'border-red-500 bg-zinc-800' : 'border-zinc-700 hover:border-red-400'}`}
                  >
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">KG (for all selected)</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="KG"
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2"
              value={sharedKg}
              onChange={(e) => setSharedKg(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-1">Order Type</label>
            <div className="flex gap-4">
              {['INDOOR', 'OUTDOOR'].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="orderType"
                    value={type}
                    checked={orderType === type}
                    onChange={() => setOrderType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {orderType === 'INDOOR' && (
            <div>
              <label className="block text-sm font-semibold text-red-400 mb-1">Select Waiter</label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2"
              >
                <option value="">-- Select Waiter --</option>
                {waiters.map((w) => (
                  <option key={w._id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submit + Cancel */}
        <div className="flex flex-wrap gap-4 justify-end mt-6">
          {editOrderId && (
            <button
              onClick={resetForm}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
          >
            {submitting ? (editOrderId ? 'Updating...' : 'Submitting...') : editOrderId ? 'Update Order' : 'Submit Order'}
          </button>
        </div>

        {/* Submitted Orders */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-red-400 mb-4">Submitted Orders (Last 24 Hours)</h3>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-400">No orders submitted in the last 24 hours.</p>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <div key={order._id} className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <p>
                      <strong>Customer:</strong> {order.customerName || 'N/A'}
                    </p>
                    <p>
                      <strong>Type:</strong> {order.salesType}
                    </p>
                    <p>
                      <strong>Items:</strong> {Array.isArray(order.meatType) ? order.meatType.join(', ') : order.meatType}
                    </p>
                    <p>
                      <strong>KG:</strong> {order.kilogram}
                    </p>
                    {order.salesType === 'INDOOR' && (
                      <p>
                        <strong>Waiter:</strong> {order.waiterName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleString()}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleEdit(order)} className="text-sm text-yellow-400 hover:underline">
                        ✏️ Edit
                      </button>
                      {/* <button onClick={() => handleDelete(order._id)} className="text-sm text-red-400 hover:underline">🗑️ Delete</button> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-white disabled:opacity-30"
                  >
                    ⬅️ Previous
                  </button>
                  <span className="text-white text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-white disabled:opacity-30"
                  >
                    Next ➡️
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="mt-12 w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">24hr Meat KG Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value} KG`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
