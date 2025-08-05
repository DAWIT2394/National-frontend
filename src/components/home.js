import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js

// Main App Component
const Home = () => {
    // State for managing orders
    const [orders, setOrders] = useState(() => {
        // Initialize orders with some dummy data for demonstration
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return [
            { id: 1, meatType: 'KITEFO', salesType: 'INDOOR', waiterName: 'Aschalew', customerName: 'Alice Smith', kg: 1.5, timestamp: new Date(today.setHours(9, 15, 0)).toISOString(), status: 'pending' },
            { id: 2, meatType: 'TIRE', salesType: 'OUT CUSTOMER', waiterName: 'Biruk', customerName: 'John Doe', kg: 2.0, timestamp: new Date(today.setHours(9, 20, 0)).toISOString(), status: 'pending' },
            { id: 3, meatType: 'NORMAL MEAT', salesType: 'INDOOR', waiterName: 'Feten', customerName: 'Bob Johnson', kg: 0.5, timestamp: new Date(yesterday.setHours(9, 25, 0)).toISOString(), status: 'pending' }
        ];
    });

    // Form input states
    const [selectedMeatType, setSelectedMeatType] = useState('KITEFO');
    const [selectedSalesType, setSelectedSalesType] = useState('INDOOR');
    const [customerName, setCustomerName] = useState('');
    const [waiterName, setWaiterName] = useState('');
    const [kilogram, setKilogram] = useState('1.0');

    // History filter states
    const [selectedHistoryFilter, setSelectedHistoryFilter] = useState('today');
    const [historyDate, setHistoryDate] = useState('');

    // Chart refs
    const meatTypeChartRef = useRef(null);
    const salesTypeChartRef = useRef(null);
    const meatTypeChartInstance = useRef(null);
    const salesTypeChartInstance = useRef(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrderForReceipt, setCurrentOrderForReceipt] = useState(null);
    const receiptCanvasRef = useRef(null);

    // Message box state
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('info');

    // Translations (simplified to English only)
    const translations = {
        en: {
            mainTitle: 'Buchery NV Sales Dashboard',
            mainSubtitle: 'Add new orders and analyze sales performance in real-time.',
            addOrderTitle: 'Add New Order',
            meatTypeLabel: 'Meat Type',
            salesTypeLabel: 'Sales Type',
            waiterNameLabel: 'Waiter Name',
            customerNameLabel: 'Customer Name',
            customerNamePlaceholder: 'Enter customer name',
            kilogramLabel: 'Kilogram',
            addOrderBtn: 'Add Order & Update Dashboard',
            keyMetricsTitle: 'Key Metrics',
            totalOrdersLabel: 'Total Orders',
            totalKilogramsLabel: 'Total Kilograms Sold',
            meatTypeChartTitle: 'Sales by Meat Type (kg)',
            salesTypeChartTitle: 'Sales by Customer Type (kg)',
            orderHistoryTitle: 'Order History',
            orderHistorySubtitle: 'This table shows the most recent orders placed through the system. Click on any row to view and print the detailed receipt for that specific transaction.',
            tableHeaderDateTime: 'Date & Time',
            tableHeaderMeatType: 'Meat Type',
            tableHeaderSalesType: 'Sales Type',
            tableHeaderWaiterName: 'Waiter Name',
            tableHeaderCustomerName: 'Customer Name',
            tableHeaderKilogram: 'Kilogram',
            tableHeaderActions: 'Actions',
            printOrderBtn: 'Print', // This button is removed from table, but kept in translations for consistency
            finishOrderBtn: 'Finish',
            finishedOrderBtn: 'Finished',
            noOrdersYet: 'No orders yet. Add one using the form!',
            receiptModalTitle: 'Order Receipt Preview',
            receiptTitle: 'Buchery NV Order Receipt',
            receiptCustomerTitle: 'Customer Receipt',
            receiptKitchenTitle: 'Kitchen Order',
            receiptMeatType: 'Meat Type',
            receiptSalesType: 'Sales Type',
            receiptWaiterName: 'Waiter Name',
            receiptCustomerName: 'Customer Name',
            receiptKilogram: 'Kilogram',
            receiptDate: 'Date',
            receiptTime: 'Time',
            receiptThankYou: 'Thank you for your order!',
            closeBtn: 'Close',
            printBtn: 'Print All Copies',
            invalidKg: 'Please enter a valid kilogram value.',
            selectWaiter: 'Please select a waiter.',
            enterCustomerName: 'Please enter customer name.',
            waiterAschalew: 'Aschalew',
            waiterBiruk: 'Biruk',
            waiterFeten: 'Feten',
            waiterBeza: 'Beza',
            waiterAyu: 'Ayu',
            waiterAddise: 'Addise',
            waiterHaile: 'Haile',
            waiterRediet: 'Rediet',
            meatTypeKitefo: 'KITEFO',
            meatTypeTire: 'TIRE',
            meatTypeNormal: 'NORMAL MEAT',
            meatTypeSeneber: 'SENEBER',
            meatTypeShekelaTibes: 'SHEKELA TIBES',
            meatTypeGasliet: 'GAZLIET',
            filterToday: "Today's Orders",
            filterPrevious: "Previous Sales",
            historyDateLabel: "Select Date:"
        }
    };

    const t = translations.en; // Use English translations

    // Function to display messages
    const showMessage = useCallback((msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage(null);
        }, 3000); // Message disappears after 3 seconds
    }, []);

    // Effect for initializing and updating charts
    useEffect(() => {
        // Destroy existing chart instances if they exist
        if (meatTypeChartInstance.current) {
            meatTypeChartInstance.current.destroy();
        }
        if (salesTypeChartInstance.current) {
            salesTypeChartInstance.current.destroy();
        }

        // Data for Meat Type Chart
        const meatTypeData = {};
        orders.forEach(order => {
            meatTypeData[order.meatType] = (meatTypeData[order.meatType] || 0) + order.kg;
        });
        const meatTypeCtx = meatTypeChartRef.current.getContext('2d');
        meatTypeChartInstance.current = new Chart(meatTypeCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(meatTypeData),
                datasets: [{
                    data: Object.values(meatTypeData),
                    backgroundColor: ['#0ea5e9', '#14b8a6', '#f97316', '#84cc16', '#60a5fa', '#facc15'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12, family: 'Inter' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) { label += context.parsed + ' kg'; }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        // Data for Sales Type Chart
        const salesTypeData = {};
        orders.forEach(order => {
            salesTypeData[order.salesType] = (salesTypeData[order.salesType] || 0) + order.kg;
        });
        const salesTypeCtx = salesTypeChartRef.current.getContext('2d');
        salesTypeChartInstance.current = new Chart(salesTypeCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(salesTypeData),
                datasets: [{
                    label: 'Kilograms',
                    data: Object.values(salesTypeData),
                    backgroundColor: ['#0ea5e9', '#f97316'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) { label += context.parsed.y + ' kg'; }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Kilograms Sold', font: { size: 14, family: 'Inter' } },
                        ticks: { font: { family: 'Inter' } }
                    },
                    x: {
                        ticks: { font: { family: 'Inter' } }
                    }
                }
            }
        });

        // Cleanup function for charts
        return () => {
            if (meatTypeChartInstance.current) {
                meatTypeChartInstance.current.destroy();
            }
            if (salesTypeChartInstance.current) {
                salesTypeChartInstance.current.destroy();
            }
        };
    }, [orders]); // Re-run effect when orders change

    // Calculate key metrics
    const totalOrders = orders.length;
    const totalKilograms = orders.reduce((sum, order) => sum + order.kg, 0).toFixed(1);

    // Filter orders based on selected history filter and date
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        orderDate.setHours(0, 0, 0, 0); // Normalize to start of day

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedHistoryFilter === 'today') {
            return orderDate.getTime() === today.getTime();
        } else if (selectedHistoryFilter === 'previous') {
            if (historyDate) {
                const selectedDate = new Date(historyDate);
                selectedDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === selectedDate.getTime();
            } else {
                return orderDate.getTime() < today.getTime();
            }
        }
        return false; // Should not happen
    });

    // Handle adding a new order
    const handleAddOrder = (e) => {
        e.preventDefault();

        const kgValue = parseFloat(kilogram);
        if (isNaN(kgValue) || kgValue <= 0) {
            showMessage(t.invalidKg, 'error');
            return;
        }
        if (!waiterName) {
            showMessage(t.selectWaiter, 'error');
            return;
        }
        if (!customerName.trim()) {
            showMessage(t.enterCustomerName, 'error');
            return;
        }

        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            meatType: selectedMeatType,
            salesType: selectedSalesType,
            waiterName: waiterName,
            customerName: customerName.trim(),
            kg: kgValue,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        setOrders(prevOrders => [newOrder, ...prevOrders]); // Add new order to the beginning
        showMessage('Order added successfully!', 'success');

        // Reset form fields
        setKilogram('1.0');
        setWaiterName('');
        setCustomerName('');
        setSelectedMeatType('KITEFO');
        setSelectedSalesType('INDOOR');

        // Show receipt modal for the new order
        setCurrentOrderForReceipt(newOrder);
        setIsModalOpen(true);
    };

    // Handle marking an order as finished
    const handleFinishOrder = (id) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === id ? { ...order, status: 'finished' } : order
            )
        );
        showMessage('Order marked as finished!', 'success');
    };

    // Draw receipt on canvas
    const drawReceipt = useCallback((order) => {
        if (!receiptCanvasRef.current || !order) return;

        const canvas = receiptCanvasRef.current;
        const ctx = canvas.getContext('2d');

        const mmToPx = 3.779528; // 1mm = 3.779528px at 96 DPI
        const receiptWidthMm = 80;
        const receiptWidthPx = receiptWidthMm * mmToPx;
        canvas.width = receiptWidthPx;

        let currentY = 0;
        const padding = 10 * mmToPx;
        const lineHeight = 18;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';

        const drawSingleCopy = (title, startY) => {
            let y = startY;

            ctx.font = `bold 18px 'Inter'`;
            ctx.textAlign = 'center';
            ctx.fillText(t.receiptTitle, canvas.width / 2, y);
            y += 20;
            ctx.font = `bold 16px 'Inter'`;
            ctx.fillText(title, canvas.width / 2, y);
            y += 25;

            ctx.font = `14px 'Inter'`;
            ctx.textAlign = 'left';
            const textX = padding;

            const details = [
                `${t.receiptMeatType}: ${order.meatType}`,
                `${t.receiptSalesType}: ${order.salesType}`,
                `${t.receiptWaiterName}: ${order.waiterName}`,
                `${t.receiptCustomerName}: ${order.customerName || '-'}`,
                `${t.receiptKilogram}: ${order.kg.toFixed(1)} kg`,
                `${t.receiptDate}: ${new Date(order.timestamp).toLocaleDateString()}`,
                `${t.receiptTime}: ${new Date(order.timestamp).toLocaleTimeString()}`
            ];

            details.forEach(detail => {
                ctx.fillText(detail, textX, y);
                y += lineHeight;
            });

            y += 20;
            ctx.textAlign = 'center';
            ctx.font = `italic 14px 'Inter'`;
            ctx.fillText(t.receiptThankYou, canvas.width / 2, y);
            y += 20;

            return y;
        };

        currentY = drawSingleCopy(t.receiptCustomerTitle, padding);

        currentY += 30; // Extra space
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(canvas.width - padding, currentY);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
        currentY += 30; // Space after separator

        currentY = drawSingleCopy(t.receiptKitchenTitle, currentY);

        canvas.height = currentY + padding; // Adjust canvas height to fit all content
        canvas.style.width = '100%';
        canvas.style.height = `${canvas.height / mmToPx}mm`; // Set height in mm for print consistency
    }, [t]);

    // Effect to redraw receipt when modal opens or currentOrderForReceipt changes
    useEffect(() => {
        if (isModalOpen && currentOrderForReceipt) {
            drawReceipt(currentOrderForReceipt);
        }
    }, [isModalOpen, currentOrderForReceipt, drawReceipt]);

    // Waiter options based on sales type
    const getWaiterOptions = useCallback(() => {
        let options = [{ value: "", text: t.selectWaiter }];
        if (selectedSalesType === 'INDOOR') {
            options.push(
                { value: "Aschalew", text: t.waiterAschalew },
                { value: "Biruk", text: t.waiterBiruk },
                { value: "Feten", text: t.waiterFeten },
                { value: "Beza", text: t.waiterBeza },
                { value: "Ayu", text: t.waiterAyu },
                { value: "Addise", text: t.waiterAddise }
            );
        } else if (selectedSalesType === 'OUT CUSTOMER') {
            options.push(
                { value: "Haile", text: t.waiterHaile },
                { value: "Rediet", text: t.waiterRediet }
            );
        }
        return options;
    }, [selectedSalesType, t]);

    // Inline styles for various components
    const containerStyle = {
        margin: '0 auto',
        padding: '1rem', // Default padding for mobile
    };

    const headerStyle = {
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const mainTitleStyle = {
        fontSize: '2.25rem', // text-4xl
        fontWeight: '700', // font-bold
        color: '#1a202c', // gray-900
    };

    const mainSubtitleStyle = {
        fontSize: '1.125rem', // text-lg
        color: '#4a5568', // gray-600
        marginTop: '0.25rem', // mt-1
    };

    const sectionStyle = {
        backgroundColor: 'white',
        padding: '1.5rem', // p-6
        borderRadius: '0.75rem', // rounded-xl
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    };

    const h2Style = {
        fontSize: '1.5rem', // text-2xl
        fontWeight: '700', // font-bold
        marginBottom: '1rem', // mb-4
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem', // space-y-4
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem', // text-sm
        fontWeight: '600', // font-semibold
        color: '#4a5568', // gray-700
        marginBottom: '0.25rem', // mb-1
    };

    const buttonGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '0.5rem', // gap-2
    };

    const inputSelectStyle = {
        width: '100%', // w-full
        padding: '0.75rem', // p-3
        border: '1px solid #d1d5db', // border border-gray-300
        borderRadius: '0.5rem', // rounded-lg
        outline: 'none', // focus:outline-none
        // focus:ring-2 focus:ring-sky-500 are hard to do inline. Will rely on global style.
    };

    const primaryButtonStyle = {
        width: '100%', // w-full
        backgroundColor: '#0284c7', // bg-sky-600
        color: 'white',
        fontWeight: '700', // font-bold
        padding: '0.75rem 1rem', // py-3 px-4
        borderRadius: '0.5rem', // rounded-lg
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
        transition: 'background-color 0.3s ease', // transition duration-300
        cursor: 'pointer'
    };

    const secondaryButtonStyle = {
        padding: '0.5rem 1rem', // px-4 py-2
        borderRadius: '0.5rem', // rounded-lg
        fontWeight: '600', // font-semibold
        transition: 'background-color 0.3s ease', // transition duration-300
        cursor: 'pointer'
    };

    const statCardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem', // p-6
        borderRadius: '0.75rem', // rounded-xl
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
        textAlign: 'center',
    };

    const statLabelStyle = {
        fontSize: '1.125rem', // text-lg
        fontWeight: '600', // font-semibold
        color: '#4a5568', // gray-600
    };

    const statValueStyle = {
        fontSize: '2.25rem', // text-4xl
        fontWeight: '700', // font-bold
        color: '#0284c7', // sky-600
        marginTop: '0.5rem', // mt-2
    };

    const tableContainerStyle = {
        overflowX: 'auto',
    };

    const tableHeaderStyle = {
        padding: '0.75rem', // p-3
        fontWeight: '600', // font-semibold
    };

    const tableRowStyle = {
        borderBottom: '1px solid #e2e8f0', // border-b border-gray-100
        transition: 'background-color 0.2s ease', // transition-colors duration-200
    };

    const tableCellStyle = {
        padding: '0.75rem', // p-3
    };

    const finishButtonBaseStyle = {
        fontSize: '0.875rem', // text-sm
        fontWeight: '600', // font-semibold
        padding: '0.25rem 0.75rem', // py-1 px-3
        borderRadius: '0.375rem', // rounded-md
        transition: 'background-color 0.3s ease', // transition duration-300
        cursor: 'pointer',
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.75)', // bg-gray-900 bg-opacity-75
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem', // p-4
        zIndex: 50,
        opacity: isModalOpen ? 1 : 0,
        visibility: isModalOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        borderRadius: '0.5rem', // rounded-lg
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
        padding: '1.5rem', // p-6
        width: '100%',
        maxWidth: '24rem', // max-w-sm
        position: 'relative',
    };

    const modalCanvasAreaStyle = {
        overflow: 'auto',
        maxHeight: '70vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e2e8f0', // border border-gray-200
        borderRadius: '0.375rem', // rounded-md
        padding: '0.5rem', // p-2
        backgroundColor: '#f9fafb', // bg-gray-50
    };

    const modalButtonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem', // space-x-4
        marginTop: '1.5rem', // mt-6
    };

    const closePrintButtonStyle = {
        padding: '0.5rem 1rem', // py-2 px-4
        borderRadius: '0.5rem', // rounded-lg
        fontWeight: '600', // font-semibold
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
        transition: 'background-color 0.3s ease', // transition
        cursor: 'pointer'
    };

    const messageBoxStyle = {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : '#3b82f6', // bg-green-500, bg-red-500, bg-blue-500
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        opacity: message ? 1 : 0,
        visibility: message ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
    };

    return (
        <>
            {/* Global Styles for responsiveness and pseudo-classes */}
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f8fafc; /* gray-50 */
                    color: #374151; /* gray-800 */
                }
                .chart-container {
                    position: relative;
                    width: 100%;
                    height: 320px;
                    max-height: 320px;
                }
                @media (min-width: 768px) {
                    .chart-container {
                        height: 350px;
                        max-height: 350px;
                    }
                    .grid-lg-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                    .col-lg-span-1 {
                        grid-column: span 1 / span 1;
                    }
                    .col-lg-span-2 {
                        grid-column: span 2 / span 2;
                    }
                }
                @media (min-width: 640px) { /* sm breakpoint */
                    .container-sm-padding {
                        padding: 1.5rem; /* sm:p-6 */
                    }
                    .grid-sm-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (min-width: 1024px) { /* lg breakpoint */
                    .container-lg-padding {
                        padding: 2rem; /* lg:p-8 */
                    }
                }

                /* Hover styles for buttons */
                .hover-bg-sky-700:hover { background-color: #0369a1; } /* Darker sky-600 */
                .hover-bg-gray-300:hover { background-color: #d1d5db; } /* Darker gray-200 */
                .hover-bg-green-600:hover { background-color: #047857; } /* Darker green-500 */
                .hover-bg-blue-600:hover { background-color: #2563eb; } /* Darker blue-500 */
                .hover-bg-gray-400:hover { background-color: #9ca3af; } /* Darker gray-300 */
                
                /* Focus styles for inputs */
                input:focus, select:focus {
                    border-color: #0ea5e9; /* sky-500 */
                    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.5); /* ring-2 ring-sky-500 */
                }

                /* Table row hover */
                .table-row-hover:hover {
                    background-color: #f9fafb; /* gray-50 */
                }

                /* Print styles */
                @media print {
                    body > *:not(#receiptModal) { display: none !important; }
                    #receiptModal {
                        position: absolute !important; top: 0 !important; left: 0 !important;
                        width: 100% !important; height: auto !important; background: none !important;
                        opacity: 1 !important; visibility: visible !important; display: flex !important;
                        align-items: flex-start !important; justify-content: center !important;
                        padding: 0 !important; margin: 0 !important; overflow: visible !important;
                    }
                    #receiptModal > div {
                        width: 80mm !important; max-width: 80mm !important; min-width: 80mm !important;
                        box-shadow: none !important; padding: 0 !important; margin: 0 !important;
                        border-radius: 0 !important; overflow: visible !important; background-color: transparent !important;
                    }
                    #receiptModal h2, #receiptModal .modal-buttons { display: none !important; }
                    #receiptCanvas {
                        width: 80mm !important; height: auto !important; display: block !important;
                        border: none !important; margin: 0 auto !important;
                    }
                }
                `}
            </style>

            <div style={containerStyle} className="container-sm-padding container-lg-padding">
                <header style={headerStyle}>
                    <div>
                        <h1 style={mainTitleStyle}>{t.mainTitle}</h1>
                        <p style={mainSubtitleStyle}>{t.mainSubtitle}</p>
                    </div>
                </header>

                <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="grid-lg-cols-3">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="col-lg-span-1">
                        <section style={sectionStyle}>
                            <h2 style={h2Style}>{t.addOrderTitle}</h2>
                            <form onSubmit={handleAddOrder} style={formStyle}>
                                <div>
                                    <label style={labelStyle}>{t.meatTypeLabel}</label>
                                    <div style={buttonGridStyle}>
                                        {['KITEFO', 'TIRE', 'NORMAL MEAT', 'SENEBER', 'SHEKELA TIBES', 'GAZLIET'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedMeatType(type)}
                                                style={{
                                                    ...secondaryButtonStyle,
                                                    backgroundColor: selectedMeatType === type ? '#0284c7' : '#e5e7eb',
                                                    color: selectedMeatType === type ? 'white' : '#374151',
                                                }}
                                                className={selectedMeatType === type ? 'hover-bg-sky-700' : 'hover-bg-gray-300'}
                                            >
                                                {t[`meatType${type.replace(/\s/g, '')}`] || type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>{t.salesTypeLabel}</label>
                                    <div style={buttonGridStyle}>
                                        {['INDOOR', 'OUT CUSTOMER'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedSalesType(type)}
                                                style={{
                                                    ...secondaryButtonStyle,
                                                    backgroundColor: selectedSalesType === type ? '#0284c7' : '#e5e7eb',
                                                    color: selectedSalesType === type ? 'white' : '#374151',
                                                }}
                                                className={selectedSalesType === type ? 'hover-bg-sky-700' : 'hover-bg-gray-300'}
                                            >
                                                {t[`salesType${type.replace(/\s/g, '')}`] || type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="customerName" style={labelStyle}>{t.customerNameLabel}</label>
                                    <input
                                        type="text"
                                        id="customerName"
                                        placeholder={t.customerNamePlaceholder}
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        style={inputSelectStyle}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="waiterName" style={labelStyle}>{t.waiterNameLabel}</label>
                                    <select
                                        id="waiterName"
                                        value={waiterName}
                                        onChange={(e) => setWaiterName(e.target.value)}
                                        style={inputSelectStyle}
                                    >
                                        {getWaiterOptions().map(option => (
                                            <option key={option.value} value={option.value}>{option.text}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="kilogram" style={labelStyle}>{t.kilogramLabel}</label>
                                    <input
                                        type="number"
                                        id="kilogram"
                                        min="0.1"
                                        step="0.1"
                                        value={kilogram}
                                        onChange={(e) => setKilogram(e.target.value)}
                                        style={inputSelectStyle}
                                    />
                                </div>
                                <button type="submit" style={primaryButtonStyle} className="hover-bg-sky-700">
                                    {t.addOrderBtn}
                                </button>
                            </form>
                        </section>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="col-lg-span-2">
                        <section style={sectionStyle}>
                            <h2 style={h2Style}>{t.keyMetricsTitle}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="grid-sm-cols-2">
                                <div style={statCardStyle}>
                                    <h3 style={statLabelStyle}>{t.totalOrdersLabel}</h3>
                                    <p style={statValueStyle}>{totalOrders}</p>
                                </div>
                                <div style={statCardStyle}>
                                    <h3 style={statLabelStyle}>{t.totalKilogramsLabel}</h3>
                                    <p style={statValueStyle}>{totalKilograms}</p>
                                </div>
                            </div>
                        </section>
                        <section style={sectionStyle}>
                            <h2 style={h2Style}>{t.orderHistoryTitle}</h2>
                            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>{t.orderHistorySubtitle}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }} className="flex-sm-row space-sm-x-4">
                                <button
                                    onClick={() => setSelectedHistoryFilter('today')}
                                    style={{
                                        ...secondaryButtonStyle,
                                        backgroundColor: selectedHistoryFilter === 'today' ? '#0284c7' : '#e5e7eb',
                                        color: selectedHistoryFilter === 'today' ? 'white' : '#374151',
                                    }}
                                    className={selectedHistoryFilter === 'today' ? 'hover-bg-sky-700' : 'hover-bg-gray-300'}
                                >
                                    {t.filterToday}
                                </button>
                                <button
                                    onClick={() => setSelectedHistoryFilter('previous')}
                                    style={{
                                        ...secondaryButtonStyle,
                                        backgroundColor: selectedHistoryFilter === 'previous' ? '#0284c7' : '#e5e7eb',
                                        color: selectedHistoryFilter === 'previous' ? 'white' : '#374151',
                                    }}
                                    className={selectedHistoryFilter === 'previous' ? 'hover-bg-sky-700' : 'hover-bg-gray-300'}
                                >
                                    {t.filterPrevious}
                                </button>
                            </div>
                            {selectedHistoryFilter === 'previous' && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="historyDate" style={labelStyle}>{t.historyDateLabel}</label>
                                    <input
                                        type="date"
                                        id="historyDate"
                                        value={historyDate}
                                        onChange={(e) => setHistoryDate(e.target.value)}
                                        style={inputSelectStyle}
                                    />
                                </div>
                            )}
                            <div style={tableContainerStyle}>
                                <table style={{ width: '100%', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={tableHeaderStyle}>{t.tableHeaderDateTime}</th>
                                            <th style={tableHeaderStyle}>{t.tableHeaderMeatType}</th>
                                            <th style={tableHeaderStyle}>{t.tableHeaderSalesType}</th>
                                            <th style={tableHeaderStyle}>{t.tableHeaderWaiterName}</th>
                                            <th style={tableHeaderStyle}>{t.tableHeaderCustomerName}</th>
                                            <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>{t.tableHeaderKilogram}</th>
                                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>{t.tableHeaderActions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ ...tableCellStyle, textAlign: 'center', color: '#6b7280' }}>{t.noOrdersYet}</td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <tr key={order.id} style={tableRowStyle} className="table-row-hover">
                                                    <td style={tableCellStyle}>{new Date(order.timestamp).toLocaleString()}</td>
                                                    <td style={tableCellStyle}>{order.meatType}</td>
                                                    <td style={tableCellStyle}>{order.salesType}</td>
                                                    <td style={tableCellStyle}>{order.waiterName}</td>
                                                    <td style={tableCellStyle}>{order.customerName || '-'}</td>
                                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{order.kg.toFixed(1)}</td>
                                                    <td style={{ ...tableCellStyle, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleFinishOrder(order.id)}
                                                            style={{
                                                                ...finishButtonBaseStyle,
                                                                backgroundColor: order.status === 'finished' ? '#9ca3af' : '#22c55e',
                                                                cursor: order.status === 'finished' ? 'not-allowed' : 'pointer',
                                                                color: 'white',
                                                            }}
                                                            className={order.status === 'finished' ? '' : 'hover-bg-green-600'}
                                                            disabled={order.status === 'finished'}
                                                        >
                                                            {order.status === 'finished' ? t.finishedOrderBtn : t.finishOrderBtn}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="grid-md-cols-2">
                            <div style={sectionStyle}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>{t.meatTypeChartTitle}</h3>
                                <div className="chart-container" style={{ margin: '0 auto', maxWidth: '20rem' }}>
                                    <canvas ref={meatTypeChartRef}></canvas>
                                </div>
                            </div>
                            <div style={sectionStyle}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>{t.salesTypeChartTitle}</h3>
                                <div className="chart-container" style={{ margin: '0 auto', maxWidth: '20rem' }}>
                                    <canvas ref={salesTypeChartRef}></canvas>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Receipt Modal */}
                {isModalOpen && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h2 style={{ ...h2Style, textAlign: 'center' }}>{t.receiptModalTitle}</h2>
                            <div style={modalCanvasAreaStyle}>
                                <canvas ref={receiptCanvasRef} style={{ width: '100%', height: 'auto', display: 'block' }}></canvas>
                            </div>
                            <div style={modalButtonContainerStyle} className="modal-buttons">
                                <button onClick={() => setIsModalOpen(false)} style={{ ...closePrintButtonStyle, backgroundColor: '#d1d5db', color: '#374151' }} className="hover-bg-gray-400">
                                    {t.closeBtn}
                                </button>
                                <button onClick={() => window.print()} style={{ ...closePrintButtonStyle, backgroundColor: '#3b82f6', color: 'white' }} className="hover-bg-blue-600">
                                    {t.printBtn}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Message Box */}
                {message && (
                    <div style={messageBoxStyle}>
                        {message}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
