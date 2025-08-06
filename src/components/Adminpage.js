import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function AdminPage() {
  // State
  const [items, setItems] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [orders, setOrders] = useState([]);
  const [itemName, setItemName] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loadingOrders, ] = useState(false);

  // Pagination (optional)
  const recordsPerPage = 6;
  const [currentPageItems, setCurrentPageItems] = useState(1);
  const [currentPageWaiters, setCurrentPageWaiters] = useState(1);
const [currentPage, setCurrentPage] = useState(1);
const ORDERS_PER_PAGE = 5;


  // Fetch data
  useEffect(() => {
    fetchItems();
    fetchWaiters();
    fetchOrders();
  }, [refresh]);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:9000/api/items');
      setItems(res.data);
    } catch (e) {
      console.error('Fetch items failed', e);
    }
  };

  const fetchWaiters = async () => {
    try {
      const res = await axios.get('http://localhost:9000/api/waiters');
      setWaiters(res.data);
    } catch (e) {
      console.error('Fetch waiters failed', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:9000/api/orders');
      setOrders(res.data);
    } catch (e) {
      console.error('Fetch orders failed', e);
    }
  };

  // Add Item or Waiter
  const handleAdd = async (type) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (type === 'item') {
        if (!itemName.trim()) {
          setErrorMessage('Item name cannot be empty');
          setSubmitting(false);
          return;
        }
        await axios.post('http://localhost:9000/api/items', { name: itemName });
        setItemName('');
      } else {
        if (!waiterName.trim()) {
          setErrorMessage('Waiter name cannot be empty');
          setSubmitting(false);
          return;
        }
        await axios.post('http://localhost:9000/api/waiters', { name: waiterName });
        setWaiterName('');
      }
      setRefresh((prev) => !prev);
      setCurrentPageItems(1);
      setCurrentPageWaiters(1);
    } catch (e) {
      console.error('Add failed', e);
      setErrorMessage('Failed to add. See console.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Item or Waiter
  const handleEdit = async (type, id, currentName) => {
    const newName = prompt(`Edit ${type === 'item' ? 'Item' : 'Waiter'} Name`, currentName);
    if (!newName || !newName.trim()) return;
    try {
      const url =
        type === 'item'
          ? `http://localhost:9000/api/items/${id}`
          : `http://localhost:9000/api/waiters/${id}`;
      await axios.put(url, { name: newName.trim() });
      setRefresh((prev) => !prev);
    } catch (e) {
      console.error('Edit failed', e);
      setErrorMessage('Failed to edit. See console.');
    }
  };

  // Delete Item or Waiter
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const url =
        type === 'item'
          ? `http://localhost:9000/api/items/${id}`
          : `http://localhost:9000/api/waiters/${id}`;
      await axios.delete(url);
      setRefresh((prev) => !prev);
    } catch (e) {
      console.error('Delete failed', e);
      setErrorMessage('Failed to delete. See console.');
    }
  };

  // Pagination slices
  const indexOfLastItems = currentPageItems * recordsPerPage;
  const indexOfFirstItems = indexOfLastItems - recordsPerPage;
  const currentItems = items.slice(indexOfFirstItems, indexOfLastItems);
  const totalPagesItems = Math.ceil(items.length / recordsPerPage);

  const indexOfLastWaiters = currentPageWaiters * recordsPerPage;
  const indexOfFirstWaiters = indexOfLastWaiters - recordsPerPage;
  const currentWaiters = waiters.slice(indexOfFirstWaiters, indexOfLastWaiters);
  const totalPagesWaiters = Math.ceil(waiters.length / recordsPerPage);

  // Calculate pie data from orders (24h filter)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentOrders = orders.filter((order) => new Date(order.createdAt).getTime() >= oneDayAgo);

  // Sum kilogram by meatType (support array or string)
  const kgByMeatType = {};
  recentOrders.forEach((order) => {
    const kg = parseFloat(order.kilogram) || 0;
    const meats = Array.isArray(order.meatType) ? order.meatType : [order.meatType];
    meats.forEach((meat) => {
      kgByMeatType[meat] = (kgByMeatType[meat] || 0) + kg / meats.length;
    });
  });

  const pieData = Object.entries(kgByMeatType).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <button
          onClick={() => setRefresh((prev) => !prev)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Refresh
        </button>
        <Link
  to="/Reportpage"
  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded inline-block text-white text-center"
>
  Report
</Link>

      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">{errorMessage}</div>
      )}

      {/* Add Item */}
      <div className="mb-8 bg-zinc-900 p-4 rounded">
        <h2 className="text-xl mb-2 font-semibold text-red-400">Add Item</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name"
            className="flex-grow rounded px-3 py-2 bg-zinc-800 border border-zinc-700 text-white"
          />
          <button
            onClick={() => handleAdd('item')}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-8 bg-zinc-800 p-4 rounded">
        <h2 className="text-xl mb-4 font-semibold text-red-400">Items List</h2>
        {currentItems.length === 0 && <p>No items found.</p>}
        {currentItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row justify-between items-center bg-zinc-700 p-3 rounded mb-2"
          >
            <span>{item.name}</span>
            <div className="flex gap-3 mt-2 sm:mt-0">
              <button
                onClick={() => handleEdit('item', item._id, item.name)}
                className="text-yellow-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete('item', item._id)}
                className="text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {/* Pagination for items */}
        {totalPagesItems > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              disabled={currentPageItems === 1}
              onClick={() => setCurrentPageItems((p) => Math.max(p - 1, 1))}
              className="bg-zinc-600 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="self-center">
              Page {currentPageItems} of {totalPagesItems}
            </span>
            <button
              disabled={currentPageItems === totalPagesItems}
              onClick={() => setCurrentPageItems((p) => Math.min(p + 1, totalPagesItems))}
              className="bg-zinc-600 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Waiter */}
      <div className="mb-8 bg-zinc-900 p-4 rounded">
        <h2 className="text-xl mb-2 font-semibold text-red-400">Add Waiter</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={waiterName}
            onChange={(e) => setWaiterName(e.target.value)}
            placeholder="Waiter name"
            className="flex-grow rounded px-3 py-2 bg-zinc-800 border border-zinc-700 text-white"
          />
          <button
            onClick={() => handleAdd('waiter')}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Add Waiter
          </button>
        </div>
      </div>

      {/* Waiters List */}
      <div className="mb-8 bg-zinc-800 p-4 rounded">
        <h2 className="text-xl mb-4 font-semibold text-red-400">Waiters List</h2>
        {currentWaiters.length === 0 && <p>No waiters found.</p>}
        {currentWaiters.map((waiter) => (
          <div
            key={waiter._id}
            className="flex flex-col sm:flex-row justify-between items-center bg-zinc-700 p-3 rounded mb-2"
          >
            <span>{waiter.name}</span>
            <div className="flex gap-3 mt-2 sm:mt-0">
              <button
                onClick={() => handleEdit('waiter', waiter._id, waiter.name)}
                className="text-yellow-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete('waiter', waiter._id)}
                className="text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {/* Pagination for waiters */}
        {totalPagesWaiters > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              disabled={currentPageWaiters === 1}
              onClick={() => setCurrentPageWaiters((p) => Math.max(p - 1, 1))}
              className="bg-zinc-600 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="self-center">
              Page {currentPageWaiters} of {totalPagesWaiters}
            </span>
            <button
              disabled={currentPageWaiters === totalPagesWaiters}
              onClick={() => setCurrentPageWaiters((p) => Math.min(p + 1, totalPagesWaiters))}
              className="bg-zinc-600 hover:bg-zinc-700 px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
<div className="mt-10">
  <h3 className="text-xl font-bold text-red-400 mb-4">Submitted Orders (All)</h3>

  {loadingOrders ? (
    <p>Loading orders...</p>
  ) : (
    (() => {
      const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
      const paginatedOrders = orders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
      );

      const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
      const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

      return orders.length === 0 ? (
        <p className="text-gray-400">No orders submitted.</p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg"
              >
                <p><strong>Customer:</strong> {order.customerName || 'N/A'}</p>
                <p><strong>Type:</strong> {order.salesType}</p>
                <p><strong>Items:</strong> {Array.isArray(order.meatType) ? order.meatType.join(', ') : order.meatType}</p>
                <p><strong>KG:</strong> {order.kilogram}</p>
                {order.salesType === 'INDOOR' && (
                  <p><strong>Waiter:</strong> {order.waiterName}</p>
                )}
                <p className="text-xs text-gray-400">Date: {new Date(order.createdAt).toLocaleString()}</p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(order)}
                    className="text-sm text-yellow-400 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="text-white disabled:opacity-30"
              >
                ⬅️ Previous
              </button>
              <span className="text-white text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="text-white disabled:opacity-30"
              >
                Next ➡️
              </button>
            </div>
          )}
        </>
      );
    })()
  )}
</div>

      {/* Pie Chart */}
      <div className="bg-zinc-900 p-6 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-400">24h Meat KG Distribution</h2>
        {pieData.length === 0 ? (
          <p>No recent orders to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
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
        )}
      </div>
    </div>
  );
}
