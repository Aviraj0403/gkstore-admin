import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import Axios from '../../utils/Axios';               // <-- same instance used everywhere
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import PaymentDetails from './PaymentDetails';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

/* --------------------------------------------------------------
   Helper – fetch the paginated list
   -------------------------------------------------------------- */
const fetchPayments = async (params) => {
  try {
    const res = await Axios.get('/razorpay/orders-with-payments', { params });
    return res.data;               // { success, data[], totalOrders, page, limit, totalPages }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to load payments');
    return { success: false, data: [], totalOrders: 0 };
  }
};

const PaymentList = () => {
  /* ---------------------- STATE ---------------------- */
  const [payments, setPayments] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const mounted = useRef(false);

  /* ---------------------- FETCH ---------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      limit: rowsPerPage,
      search: search || undefined,
      orderStatus: filterOrderStatus || undefined,
      paymentStatus: filterPaymentStatus || undefined,
    };

    // month / year filter
    if (filterMonth && filterYear) {
      const month = filterMonth.padStart(2, '0');
      params.startDate = `${filterYear}-${month}-01`;
      const lastDay = new Date(filterYear, Number(filterMonth), 0);
      params.endDate = lastDay.toISOString().split('T')[0];
    }

    const res = await fetchPayments(params);
    if (res.success) {
      setPayments(res.data);
      setTotalRows(res.totalOrders);
      setTotalPages(res.totalPages);
    } else {
      setPayments([]);
      setTotalRows(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [
    page,
    rowsPerPage,
    search,
    filterOrderStatus,
    filterPaymentStatus,
    filterMonth,
    filterYear,
  ]);

  // first mount
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      load();
    }
  }, [load]);

  /* ---------------------- FILTER HANDLERS ---------------------- */
  const applyFilters = () => {
    if ((filterMonth && !filterYear) || (!filterMonth && filterYear)) {
      toast.error('Select both month & year or none');
      return;
    }
    setPage(1);
    load();
  };

  const clearFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    setFilterOrderStatus('');
    setFilterPaymentStatus('');
    setSearch('');
    setPage(1);
    load();
  };

  /* ---------------------- ACTIONS ---------------------- */
  // ---- view single record (use the same list endpoint with orderId) ----
  const viewDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const res = await Axios.get('/razorpay/orders-with-payments', {
        params: { orderId },
      });
      // console.log(res.data);
      if (res.data.success && res.data.data?.length > 0) {
        setSelected(res.data.data[0]);
      } else {
        toast.error('Order not found');
        setSelected(null);
      }
    } catch (e) {
      toast.error('Failed to load details');
      setSelected(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ---- update order status ----
  //   const updateOrderStatus = async (orderId, newStatus) => {
  //     try {
  //       await Axios.put(`/razorpay/orders-with-payments/${orderId}/status`, {
  //         orderStatus: newStatus,
  //       });
  //       toast.success('Status updated');
  //       load();                     // refresh list
  //       if (selected?.orderId === orderId) viewDetails(orderId);
  //     } catch (e) {
  //       toast.error('Update failed');
  //     }
  //   };

  /* ---------------------- UI HELPERS ---------------------- */
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);
  const isFiltered =
    filterMonth ||
    filterYear ||
    filterOrderStatus ||
    filterPaymentStatus ||
    search;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* ---------- Header & Search ---------- */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h4 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Payment List
        </h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search by Razorpay ID / Order ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full sm:w-auto"
            disabled={loading}
          />
          <button
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            Apply
          </button>
          {isFiltered && (
            <button
              onClick={clearFilters}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Order Status */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            value={filterOrderStatus}
            onChange={(e) => setFilterOrderStatus(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div> */}

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------- Loading / Empty ---------- */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading payments…</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          No payments match the filters.
          {isFiltered && (
            <button onClick={clearFilters} className="mt-2 text-orange-600 underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------- Desktop Table ---------- */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
                <tr>
                  {[
                    'Razorpay Order ID',
                    'Order ID',
                    'Customer',
                    'Amount',
                    // 'Order Status',
                    'Payment Status',
                    'Date',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p, i) => (
                  <tr
                    key={p.orderId}
                    className={`hover:bg-orange-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                  >
                    {/* Razorpay Order ID */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.payment?.razorpayOrderId?.slice(0, 12) || '-'}
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.orderId?.slice(-8) || '-'}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.shippingAddress?.name || p.user?.name || 'Guest'}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₹{Number(p.totalAmount || 0).toFixed(2)}
                    </td>

                    {/* Order Status – editable */}
                    {/* <td className="px-4 py-3 text-sm">
                      <select
                        value={p.orderStatus || 'Pending'}
                        onChange={(e) => updateOrderStatus(p.orderId, e.target.value)}
                        className="border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
                        disabled={loading}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td> */}

                    {/* Payment Status – read-only badge */}
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${p.payment?.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : p.payment?.paymentStatus === 'Failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                      >
                        {p.payment?.paymentStatus || '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(p.placedAt).toLocaleDateString()}
                    </td>

                    {/* View */}
                    <td className="px-4 py-3 text-sm flex justify-center">
                      <button
                        onClick={() => viewDetails(p.orderId)}
                        className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                        aria-label="View details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- Mobile Cards ---------- */}
          <div className="block md:hidden space-y-4">6
            {payments.map((p) => (
              <div
                key={p.orderId}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900">
                    {p.payment?.razorpayOrderId?.slice(0, 12) || 'CASH-PAY'}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${p.orderStatus === 'Delivered'
                        ? 'bg-green-100 text-green-600'
                        : p.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                  >
                    {p.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <p>
                      <span className="font-medium">Order:</span>{' '}
                      {p.orderId?.slice(-8)}
                    </p>
                    <p>
                      <span className="font-medium">Customer:</span>{' '}
                      <span className="font-bold">
                        {p.shippingAddress?.name || p.user?.name || 'Guest'}
                      </span>
                    </p>

                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Amount:</span> ₹
                      {Number(p.totalAmount).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Payment:</span>{' '}
                      <span
                        className={`${p.payment?.paymentStatus === 'Paid'
                            ? 'text-green-600'
                            : p.payment?.paymentStatus === 'Failed'
                              ? 'text-red-600'
                              : 'text-orange-600'
                          } font-medium`}
                      >
                        {p.payment?.paymentStatus || 'COD'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Update Order Status
                  </label>
                  <select
                    value={p.orderStatus || 'Pending'}
                    onChange={(e) => updateOrderStatus(p.orderId, e.target.value)}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-orange-400"
                    disabled={loading}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="mt-3 pt-3 border-t flex justify-center">
                  <button
                    onClick={() => viewDetails(p.orderId)}
                    className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Pagination ---------- */}
          {totalRows > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Rows:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                    load();
                  }}
                  disabled={loading}
                  className="border rounded px-2 py-1 focus:ring-2 focus:ring-orange-400"
                >
                  {[10, 20, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1));
                    load();
                  }}
                  disabled={page === 1 || loading}
                  className="p-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage((p) => Math.min(p + 1, totalPages));
                    load();
                  }}
                  disabled={page === totalPages || loading}
                  className="p-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------- Details Modal ---------- */}
      {(loadingDetails || selected) && (
        <PaymentDetails
          payment={selected}
          onClose={() => setSelected(null)}
          loading={loadingDetails}
        />
      )}
    </div>
  );
};

export default PaymentList;