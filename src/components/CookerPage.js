import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Filter, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Cooker() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://national-1.onrender.com/api/orders');
      const mappedOrders = res.data.map(order => ({
        id: order._id || order.id,
        timeDate: order.timeDate
          ? order.timeDate
          : order.createdAt
            ? new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' ')
            : '',
        meatType: order.meatType || order.meat || '',
        salesType: order.salesType || order.sales_type || '',
        waiterName: order.waiterName || order.waiter || '',
        customerName: order.customerName || order.customer || '',
        kilogram: Number(order.kilogram || order.kg || 0),
        status: order.status || 'pending',
        items: order.items || [],
        finishedAt: order.finishedAt || null
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredOrders = orders.filter(order => {
    const orderDate = order.timeDate.split(' ')[0];
    return activeFilter === 'today'
      ? orderDate === today
      : orderDate < today;
  });

  const todaysCount = orders.filter(order => order.timeDate.split(' ')[0] === today).length;
  const previousCount = orders.filter(order => order.timeDate.split(' ')[0] < today).length;

  const getTimeConsumed = (start, end) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    if (diffMs < 0) return '-';
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleFinish = async (order) => {
    try {
      const finishedAt = new Date().toISOString();
      await axios.put(`https://national-1.onrender.com/api/orders/${order.id}`, {
        status: 'finished',
        finishedAt,
      });
      await fetchOrders();
      const updatedOrder = { ...order, status: 'finished', finishedAt };
      generateReceipt(updatedOrder);
    } catch (error) {
      console.error('Error marking order as finished:', error);
    }
  };

  const generateReceipt = (order) => {
    const receiptWindow = window.open('', '', 'width=600,height=800');
    const itemsHTML = order.items.length
      ? order.items
          .map(
            (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.name || item.meatType || ''}</td>
              <td>${item.quantity || ''}</td>
              <td>${item.weight || item.kilogram || ''} kg</td>
              <td>${item.price || 0}</td>
            </tr>
          `
          )
          .join('')
      : `
          <tr>
            <td>1</td>
            <td>${order.meatType}</td>
            <td>1</td>
            <td>${order.kilogram} kg</td>
            <td>-</td>
          </tr>
        `;

    receiptWindow.document.write(`
      <html>
      <head>
        <title>Receipt - Order ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h2>Order Receipt</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Ordered At:</strong> ${order.timeDate}</p>
        <p><strong>Finished At:</strong> ${order.finishedAt ? new Date(order.finishedAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Waiter:</strong> ${order.waiterName}</p>
        <p><strong>Sales Type:</strong> ${order.salesType}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Meat Type</th>
              <th>Quantity</th>
              <th>Weight</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <p style="margin-top: 20px; text-align: right;"><strong>Total Weight:</strong> ${order.kilogram} kg</p>
        <p style="text-align: center; margin-top: 40px;">Thank you for your order!</p>
      </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // clear token
    navigate('/LoginPage'); // go to LoginPage
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="text-blue-600" size={32} />
            Order History
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Filter size={20} /> Today's Orders ({todaysCount})
            </button>
            <button
              onClick={() => setActiveFilter('previous')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeFilter === 'previous' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Clock size={20} /> Previous Sales ({previousCount})
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading orders...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">Time & Date</th>
                    <th className="px-6 py-4 text-left">Meat Types</th>
                    <th className="px-6 py-4 text-left">Sales Type</th>
                    <th className="px-6 py-4 text-left">Waiter</th>
                    <th className="px-6 py-4 text-left">Customer</th>
                    <th className="px-6 py-4 text-left">Kg</th>
                    <th className="px-6 py-4 text-left">Finished At</th>
                    <th className="px-6 py-4 text-left">Time Taken</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{order.timeDate}</td>
                      <td className="px-6 py-4">{order.meatType}</td>
                      <td className="px-6 py-4">{order.salesType}</td>
                      <td className="px-6 py-4">{order.waiterName}</td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4">{order.kilogram} kg</td>
                      <td className="px-6 py-4">{order.finishedAt ? new Date(order.finishedAt).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4">{getTimeConsumed(order.timeDate, order.finishedAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className={`px-4 py-2 rounded-lg ${
                            order.status === 'finished'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          onClick={() => handleFinish(order)}
                          disabled={order.status === 'finished'}
                        >
                          {order.status === 'finished' ? 'Finished' : 'Finish & Print'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-6 text-gray-500">
                        No orders to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cooker;
