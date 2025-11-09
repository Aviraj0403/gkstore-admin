// SalesChart.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Sample data for the chart (Sales Data)
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 4500 },
  { name: "Mar", sales: 5500 },
  { name: "Apr", sales: 4700 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 7000 },
  { name: "Jul", sales: 6500 },
  { name: "Aug", sales: 7200 },
  { name: "Sep", sales: 6800 },
  { name: "Oct", sales: 5900 },
  { name: "Nov", sales: 7500 },
  { name: "Dec", sales: 8000 },
];

const SalesChart = () => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#3490dc" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
