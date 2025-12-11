import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from "recharts";

// Weekly Stats Pie Chart
const WeeklyStatsPieChart = ({ statsData }) => {
  const COLORS = ["#4CAF50", "#FF9800", "#F44336", "#9C27B0", "#2196F3", "#FF4081", "#4CAF50"]; // Updated color palette for modern aesthetics

  // Prepare data for the pie chart from the statsData
  const formattedData = statsData.map(stat => ({
    name: `${new Date(stat._id).toLocaleDateString()}`,  // Format date as per user locale
    value: stat.totalRevenue, // Use totalRevenue for the pie chart slices
  }));

  // Custom tooltip to show data more clearly
  const CustomTooltip = ({ payload }) => {
    if (payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-sm text-gray-600">Revenue: ₹{value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // Animate pie slice on hover with better transitions
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const startX = cx + outerRadius * cos;
    const startY = cy + outerRadius * sin;
    const endX = cx + outerRadius * Math.cos(-endAngle * RADIAN);
    const endY = cy + outerRadius * Math.sin(-endAngle * RADIAN);
    const large = endAngle - startAngle > 180 ? 1 : 0;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // Slightly enlarge the active slice
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text
          x={startX}
          y={startY}
          dy={8}
          dx={8}
          fontSize={16}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {payload.name}
        </text>
      </g>
    );
  };

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
            activeShape={renderActiveShape} // Custom active shape for hover effect
            animationBegin={0}
            animationDuration={1000}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyStatsPieChart;
