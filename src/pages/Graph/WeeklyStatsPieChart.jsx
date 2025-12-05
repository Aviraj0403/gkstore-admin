import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Weekly Stats Pie Chart
const WeeklyStatsPieChart = ({ statsData }) => {
  const COLORS = ["#4c9f70", "#fbbf24", "#ef4444", "#9333ea", "#3b82f6", "#f43f5e", "#10b981"]; // Custom Colors for each pie slice

  // Prepare data for the pie chart from the statsData
  const formattedData = statsData.map(stat => ({
    name: `${new Date(stat._id).toLocaleDateString()}`,  // Format date as per user locale
    value: stat.totalRevenue, // Use totalRevenue for the pie chart slices
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Weekly Stats - Pie Chart</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="name"
            outerRadius={120} // Bigger outer radius for a better 3D effect
            fill="#8884d8"
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`} // Custom label format
            paddingAngle={5} // Space between slices
            startAngle={90} // Start angle for a better layout
            endAngle={-270} // Makes the pie rotate to form a full circle
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyStatsPieChart;
