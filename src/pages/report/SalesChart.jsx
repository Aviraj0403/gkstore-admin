import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Axios from "../../utils/Axios";

// Custom Tooltip
const CustomTooltip = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    const { totalSales } = payload[0].payload;
    // console.log("Tooltip Payload:", payload);
    return (
      <div className="custom-tooltip bg-white shadow-md p-3 rounded-lg">
        <p className="label text-gray-700">Month: {label}</p>
        <p className="intro text-gray-500">Sales: ₹{totalSales}</p>
      </div>
    );
  }
  return null;
};

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Make the API call to fetch sales data from your backend
        const response = await Axios.get('/orders/sales-graph');  // Replace with your actual API endpoint
        if (response.data.success) {
          setSalesData(response.data.data);
        }
      } catch (err) {
        setError("Error fetching sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <ReferenceLine y={7000} label="Target" stroke="#f56565" strokeWidth={2} />
        <Line
          type="monotone"
          dataKey="totalSales"
          stroke="#4C9F70" // Green color for sales line
          strokeWidth={3}
          dot={{ r: 6, fill: "#4C9F70", stroke: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
