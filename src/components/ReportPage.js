import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderReportPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9000/api/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  // Group total KG by meat type
  const meatKgMap = {};
  orders.forEach(order => {
    const meatTypes = Array.isArray(order.meatType) ? order.meatType : [order.meatType];
    meatTypes.forEach(type => {
      meatKgMap[type] = (meatKgMap[type] || 0) + Number(order.kilogram || 0);
    });
  });

  // Calculate total KG
  const totalKg = orders.reduce((sum, order) => sum + Number(order.kilogram || 0), 0);

  const pieData = {
    labels: Object.keys(meatKgMap),
    datasets: [{
      label: 'Total KG',
      data: Object.values(meatKgMap),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Butchery Sales Report', 14, 10);
    
    const now = new Date();
    doc.text(`Generated on: ${now.toLocaleString()}`, 14, 18);

    autoTable(doc, {
      startY: 25,
      head: [['Customer', 'Meat Type', 'Waiter', 'KG', 'Sales Type', 'Date']],
      body: orders.map(order => [
        order.customerName || '',
        Array.isArray(order.meatType) ? order.meatType.join(', ') : order.meatType || '',
        order.waiterName || '',
        order.kilogram || '',
        order.salesType || '',
        order.createdAt ? new Date(order.createdAt).toLocaleString() : ''
      ]),
      foot: [
        ['', '', 'Total KG', totalKg, '', '']
      ]
    });

    doc.save('butchery_report.pdf');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Butchery Orders</h1>

      <button
        onClick={exportToPDF}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Export PDF
      </button>

      <div className="mb-4">
        <Link
          to="/Admin"
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded inline-block text-white text-center"
        >
          Back to Adminpage
        </Link>
      </div>

      <table className="w-full table-auto border border-collapse mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Customer</th>
            <th className="border p-2">Meat Type</th>
            <th className="border p-2">Waiter</th>
            <th className="border p-2">KG</th>
            <th className="border p-2">Sales Type</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr key={i}>
              <td className="border p-2">{order.customerName || '-'}</td>
              <td className="border p-2">
                {Array.isArray(order.meatType) ? order.meatType.join(', ') : order.meatType || '-'}
              </td>
              <td className="border p-2">{order.waiterName || '-'}</td>
              <td className="border p-2">{order.kilogram || '-'}</td>
              <td className="border p-2">{order.salesType || '-'}</td>
              <td className="border p-2">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="border p-2 text-right" colSpan="3">Total KG</td>
            <td className="border p-2">{totalKg}</td>
            <td className="border p-2" colSpan="2"></td>
          </tr>
        </tfoot>
      </table>

      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2 text-center">KG by Meat Type</h2>
        <Pie data={pieData} />
      </div>
    </div>
  );
}
