// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { Printer } from 'lucide-react';
// import SalesChart from '../pages/report/SalesChart';
// import axios from '../utils/Axios';

// export default function Dashboard() {
//   const [orders, setOrders] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const ordersRef = useRef();

//   // Socket URL
//   const socketURL = 'https://gkstore-backend.onrender.com/';

//   useEffect(() => {
//     const socket = io(socketURL, {
//       withCredentials: true,
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });
//     setSocket(socket);

//     fetchOrders();

//     socket.on('newOrder', (order) => {
//       console.log('📦 New order received: ', order);
//       setOrders((prevOrders) => [order, ...prevOrders]);
//     });

//     socket.on('connect', () => {
//       console.log('📡 Connected to WebSocket server');
//     });

//     socket.on('disconnect', (reason) => {
//       console.warn('📡 Disconnected from WebSocket:', reason);
//     });

//     socket.on('reconnect', (attemptNumber) => {
//       console.log('📡 Reconnected after', attemptNumber, 'attempts');
//       fetchOrders();
//     });

//     socket.on('connect_error', (error) => {
//       console.error('📡 Connection error:', error);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('/orders/reports/today');
//       if (response.status === 200) {
//         setOrders(response.data.orders || []);
//       } else {
//         console.error('Failed to fetch orders:', response.data.message);
//       }
//     } catch (err) {
//       console.error('Error fetching orders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrintOrders = () => {
//     const printContent = ordersRef.current.innerHTML;
//     const printWindow = window.open('', '', 'width=800,height=600');

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Today's Orders</title>
//           <style>
//             body { padding: 20px; font-family: Arial, sans-serif; }
//             h2 { font-size: 24px; margin-bottom: 20px; color: #ea580c; }
//             .order-card { 
//               border: 1px solid #ddd; 
//               padding: 15px; 
//               margin-bottom: 15px; 
//               border-radius: 12px;
//               page-break-inside: avoid;
//               box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//             }
//             .order-header { 
//               display: flex; 
//               justify-content: space-between; 
//               margin-bottom: 10px;
//               font-weight: bold;
//             }
//             .order-details { font-size: 14px; line-height: 1.6; }
//             .badge { 
//               padding: 4px 8px; 
//               border-radius: 4px; 
//               font-size: 12px;
//               font-weight: bold;
//             }
//             .badge-pending { background: #fed7aa; color: #c2410c; }
//             .badge-delivered { background: #dcfce7; color: #15803d; }
//             .badge-cancelled { background: #fee2e2; color: #b91c1c; }
//             @media print {
//               body { margin: 0; }
//             }
//           </style>
//         </head>
//         <body>
//           <h2>Today's Orders - ${new Date().toLocaleDateString()}</h2>
//           ${printContent}
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 250);
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 overflow-hidden relative">
//       {/* Background Circles */}
//       <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-60 h-40 sm:h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
//       <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-40 sm:w-60 h-40 sm:h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>

//       {/* Overview Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
//         <DashboardCard title="Total Revenue" value="₹92,800" color="orange" />
//         <DashboardCard title="Today's Orders" value={orders.length} color="blue" />
//         <DashboardCard title="Products Available" value="56" color="green" />
//         <DashboardCard title="Customers Served" value="980" color="purple" />
//       </div>

//       {/* Today's Orders */}
//       <section className="z-10 relative">
//         <div className="flex justify-between items-center mb-4 sm:mb-6">
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
//             Today's Orders {orders.length > 0 && `(${orders.length})`}
//           </h3>
//           {orders.length > 0 && (
//             <button
//               onClick={handlePrintOrders}
//               className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors"
//             >
//               <Printer size={18} className="mr-2" />
//               Print Orders
//             </button>
//           )}
//         </div>
//         {loading ? (
//           <div className="text-center text-gray-500 py-10 sm:py-20">
//             <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
//             <p className="mt-4">Loading orders...</p>
//           </div>
//         ) : (
//           <div ref={ordersRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//             {orders.length > 0 ? (
//               orders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="order-card bg-white p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow"
//                 >
//                   <div className="space-y-3">
//                     {/* Customer & Status */}
//                     <div className="order-header flex justify-between items-start">
//                       <h4 className="text-base sm:text-lg font-semibold text-gray-800">
//                         {order?.shippingAddress?.name || 'N/A'}
//                       </h4>
//                       <span
//                         className={`badge px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
//                           order.orderStatus === 'Delivered'
//                             ? 'badge-delivered bg-green-100 text-green-600 border border-green-200'
//                             : order.orderStatus === 'Cancelled'
//                             ? 'badge-cancelled bg-red-100 text-red-600 border border-red-200'
//                             : 'badge-pending bg-orange-100 text-orange-600 border border-orange-200'
//                         }`}
//                       >
//                         {order.orderStatus || 'Pending'}
//                       </span>
//                     </div>

//                     {/* Order Details */}
//                     <div className="order-details text-sm text-gray-600">
//                       <p>
//                         <span className="font-medium">Order ID:</span>{' '}
//                         {order?._id ? order._id.slice(0, 10) + '...' : 'N/A'}
//                       </p>
//                       <p>
//                         <span className="font-medium">Time:</span>{' '}
//                         {order?.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}
//                       </p>
//                     </div>

//                     {/* Payment Method & Status */}
//                     <div className="text-sm text-gray-600">
//                       <p>
//                         <span className="font-medium">Payment:</span> {order?.paymentMethod || 'N/A'}
//                       </p>
//                       <p>
//                         <span className="font-medium">Status:</span>{' '}
//                         <span
//                           className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
//                             order.paymentStatus === 'Paid'
//                               ? 'bg-green-100 text-green-600 border border-green-200'
//                               : 'bg-red-100 text-red-600 border border-red-200'
//                           }`}
//                         >
//                           {order.paymentStatus || 'N/A'}
//                         </span>
//                       </p>
//                     </div>

//                     {/* Items */}
//                     <div>
//                       <h5 className="text-sm font-semibold text-gray-700 mb-1">Dishes:</h5>
//                       <ul className="list-disc list-inside max-h-20 sm:max-h-24 overflow-auto text-xs sm:text-sm text-gray-600">
//                         {order?.items?.length > 0 ? (
//                           order.items.map((item, i) => (
//                             <li key={i}>
//                               {item?.selectedVariant?.name || item?.food?.name || 'Unknown'} - {item?.quantity || 0} × ₹
//                               {item?.selectedVariant?.price || item?.food?.price || 0}
//                             </li>
//                           ))
//                         ) : (
//                           <li>N/A</li>
//                         )}
//                       </ul>
//                     </div>

//                     {/* Total */}
//                     <p className="text-base sm:text-lg font-bold text-gray-900 border-t pt-2">
//                       Total: ₹{order?.totalAmount?.toFixed(2) || '0.00'}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-span-full text-center py-12 text-gray-600">
//                 <p className="text-lg font-medium">No orders yet today.</p>
//                 <p className="text-sm text-gray-500 mt-2">New orders will appear here automatically.</p>
//               </div>
//             )}
//           </div>
//         )}
//       </section>

//       {/* Sales Chart */}
//       <section className="z-10 relative mt-8 sm:mt-12">
//         <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Sales Trends</h3>
//         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
//           <SalesChart />
//         </div>
//       </section>
//     </div>
//   );
// }
// const DashboardCard = ({ title, value, color }) => {
//   // Gradient color schemes for the card background
//   const colorMap = {
//     green: 'bg-gradient-to-br from-green-300 to-green-600 text-white',
//     blue: 'bg-gradient-to-br from-blue-300 to-blue-600 text-white',
//     orange: 'bg-gradient-to-br from-orange-300 to-orange-600 text-white',
//     purple: 'bg-gradient-to-br from-purple-300 to-purple-600 text-white',
//   };

//   // Accent circle background colors
//   const circleColorMap = {
//     green: 'bg-green-100',
//     blue: 'bg-blue-100',
//     orange: 'bg-orange-100',
//     purple: 'bg-purple-100',
//   };

//   return (
//     <div className="relative bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow transform hover:scale-105 overflow-hidden">
//       {/* Full background gradient color */}
//       <div
//         className={`absolute inset-0 rounded-lg ${colorMap[color]} opacity-50`}
//       ></div>

//       {/* Accent Circle */}
//       <div
//         className={`absolute -top-8 -right-8 w-24 h-24 ${circleColorMap[color]} rounded-full mix-blend-multiply filter blur-2xl opacity-30`}
//       ></div>

//       {/* Card Title */}
//       <h3 className="text-sm sm:text-lg font-semibold text-gray-700 relative z-10">
//         {title}
//       </h3>

//       {/* Value Display */}
//       <p className={`text-3xl sm:text-4xl font-bold mt-4 relative z-10`}>
//         {value}
//       </p>

//       {/* Optional: Small icon for extra flair */}
//       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//           className="w-16 h-16"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M12 6v6h6M6 12H4m6 6h6"
//           />
//         </svg>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Printer } from 'lucide-react';
import SalesChart from '../pages/report/SalesChart';
import WeeklyStatsPieChart from '../pages/Graph/WeeklyStatsPieChart';
import { getTodayOrders, getTotalRevenue, getTotalOrders, getWeeklyStats, getMonthlyStats, getTotalUsers ,getTotalProducts} from '../services/dashboartdApi'; // Import the necessary API functions

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const ordersRef = useRef();

  const socketURL = 'https://gkstore-backend.onrender.com/';

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socket);

    fetchData();

    socket.on('newOrder', (order) => {
      console.log('📦 New order received: ', order);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    socket.on('connect', () => {
      console.log('📡 Connected to WebSocket server');
    });

    socket.on('disconnect', (reason) => {
      console.warn('📡 Disconnected from WebSocket:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('📡 Reconnected after', attemptNumber, 'attempts');
      fetchData();
    });

    socket.on('connect_error', (error) => {
      console.error('📡 Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch data from all APIs
  const fetchData = async () => {
    try {
      setLoading(true);

      const todayOrdersResponse = await getTodayOrders();
      const totalRevenueResponse = await getTotalRevenue();
      const totalOrdersResponse = await getTotalOrders();
      const weeklyStatsResponse = await getWeeklyStats();
      const monthlyStatsResponse = await getMonthlyStats();
      const totalUsersResponse = await getTotalUsers();
      const totalProductsResponse = await getTotalProducts();
      setOrders(todayOrdersResponse.orders || []);
      setTotalRevenue(totalRevenueResponse || 0);
      setTotalOrders(totalOrdersResponse || 0);
      setWeeklyStats(weeklyStatsResponse || []);
      setMonthlyStats(monthlyStatsResponse || []);
      setTotalUsers(totalUsersResponse || 0);
      setTotalProducts(totalProductsResponse || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrders = () => {
    const printContent = ordersRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Today's Orders</title>
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            h2 { font-size: 24px; margin-bottom: 20px; color: #ea580c; }
            .order-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              margin-bottom: 15px; 
              border-radius: 12px;
              page-break-inside: avoid;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .order-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
              font-weight: bold;
            }
            .order-details { font-size: 14px; line-height: 1.6; }
            .badge { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px;
              font-weight: bold;
            }
            .badge-pending { background: #fed7aa; color: #c2410c; }
            .badge-delivered { background: #dcfce7; color: #15803d; }
            .badge-cancelled { background: #fee2e2; color: #b91c1c; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Today's Orders - ${new Date().toLocaleDateString()}</h2>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 overflow-hidden relative">
      {/* Background Circles */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-60 h-40 sm:h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-40 sm:w-60 h-40 sm:h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
        <DashboardCard title="Total Revenue" value={`₹${totalRevenue}`} color="orange" />
        <DashboardCard title="Today's Orders" value={orders.length} color="blue" />
        <DashboardCard title="Products Available" value={totalProducts} color="green" />
        <DashboardCard title="Customers Served" value={totalUsers} color="purple" />
      </div>

      {/* Today's Orders */}
      <section className="z-10 relative mt-8 sm:mt-12">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            Today's Orders {orders.length > 0 && `(${orders.length})`}
          </h3>
          {orders.length > 0 && (
            <button
              onClick={handlePrintOrders}
              className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors"
            >
              <Printer size={18} className="mr-2" />
              Print Orders
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-10 sm:py-20">
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4">Loading orders...</p>
          </div>
        ) : (
          <div ref={ordersRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="order-card bg-white p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Customer & Status */}
                    <div className="order-header flex justify-between items-start">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                        {order?.shippingAddress?.name || 'N/A'}
                      </h4>
                      <span
                        className={`badge px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          order.orderStatus === 'Delivered'
                            ? 'badge-delivered bg-green-100 text-green-600 border border-green-200'
                            : order.orderStatus === 'Cancelled'
                            ? 'badge-cancelled bg-red-100 text-red-600 border border-red-200'
                            : 'badge-pending bg-orange-100 text-orange-600 border border-orange-200'
                        }`}
                      >
                        {order.orderStatus || 'Pending'}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="order-details text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Order ID:</span>{' '}
                        {order?._id ? order._id.slice(0, 10) + '...' : 'N/A'}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {order?.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    {/* Payment Method & Status */}
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Payment:</span> {order?.paymentMethod || 'N/A'}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-green-100 text-green-600 border border-green-200'
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}
                        >
                          {order.paymentStatus || 'N/A'}
                        </span>
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-1">Dishes:</h5>
                      <ul className="list-disc list-inside max-h-20 sm:max-h-24 overflow-auto text-xs sm:text-sm text-gray-600">
                        {order?.items?.length > 0 ? (
                          order.items.map((item, i) => (
                            <li key={i}>
                              {item?.selectedVariant?.name || item?.food?.name || 'Unknown'} - {item?.quantity || 0} × ₹
                              {item?.selectedVariant?.price || item?.food?.price || 0}
                            </li>
                          ))
                        ) : (
                          <li>N/A</li>
                        )}
                      </ul>
                    </div>

                    {/* Total */}
                    <p className="text-base sm:text-lg font-bold text-gray-900 border-t pt-2">
                      Total: ₹{order?.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-600">
                <p className="text-lg font-medium">No orders yet today.</p>
                <p className="text-sm text-gray-500 mt-2">New orders will appear here automatically.</p>
              </div>
            )}
          </div>
        )}
      </section>

{/* <section className="z-10 relative mt-8 sm:mt-12">
  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Weekly Stats</h3>
  <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-xl border border-gray-200">
    <table className="w-full text-sm text-left table-auto">
      <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <tr className="border-b">
          <th className="py-3 px-4 text-left">Date</th>
          <th className="py-3 px-4 text-center">Orders</th>
          <th className="py-3 px-4 text-center">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {weeklyStats.map((stat, index) => (
          <tr
            key={stat._id}
            className={`hover:bg-gray-50 transition duration-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
          >
            <td className="py-4 px-4">{stat._id}</td>
            <td className="py-4 px-4 text-center">{stat.totalOrders}</td>
            <td className="py-4 px-4 text-center text-green-600 font-semibold">
              ₹{stat.totalRevenue.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section> */}
 <section className="z-10 relative mt-8 sm:mt-12">
        <WeeklyStatsPieChart statsData={weeklyStats} />
      </section>
      {/* Sales Chart */}
      <section className="z-10 relative mt-8 sm:mt-12">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Sales Trends</h3>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
          <SalesChart />
        </div>
      </section>
    </div>
  );
}

const DashboardCard = ({ title, value, color }) => {
  const colorMap = {
    green: 'bg-gradient-to-br from-green-300 to-green-600 text-white',
    blue: 'bg-gradient-to-br from-blue-300 to-blue-600 text-white',
    orange: 'bg-gradient-to-br from-orange-300 to-orange-600 text-white',
    purple: 'bg-gradient-to-br from-purple-300 to-purple-600 text-white',
  };

  const circleColorMap = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className="relative bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow transform hover:scale-105 overflow-hidden">
      <div className={`absolute inset-0 rounded-lg ${colorMap[color]} opacity-50`}></div>
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${circleColorMap[color]} rounded-full mix-blend-multiply filter blur-2xl opacity-30`}></div>
      <h3 className="text-sm sm:text-lg font-semibold text-gray-700 relative z-10">{title}</h3>
      <p className="text-3xl sm:text-4xl font-bold mt-4 relative z-10">{value}</p>
    </div>
  );
};
