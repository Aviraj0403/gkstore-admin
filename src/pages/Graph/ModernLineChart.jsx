import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

// Sample data for Weekly Stats
const data = [
  { date: '2021-12-01', totalOrders: 120, totalRevenue: 3500 },
  { date: '2021-12-02', totalOrders: 200, totalRevenue: 5000 },
  { date: '2021-12-03', totalOrders: 150, totalRevenue: 4200 },
  { date: '2021-12-04', totalOrders: 250, totalRevenue: 6000 },
  { date: '2021-12-05', totalOrders: 300, totalRevenue: 8000 },
  { date: '2021-12-06', totalOrders: 180, totalRevenue: 4500 },
  { date: '2021-12-07', totalOrders: 220, totalRevenue: 5200 },
];

const COLORS = ['#4CAF50', '#FF9800']; // Custom colors for lines

const ModernLineChart = ({ statsData  }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Weekly Stats - Line Chart</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={statsData}>
          {/* Cartesian Grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          
          {/* X and Y Axes */}
          <XAxis 
            dataKey="date" 
            stroke="#8884d8" 
            axisLine={{ stroke: '#ddd' }}
            tickLine={{ stroke: '#ddd' }}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            stroke="#8884d8" 
            axisLine={{ stroke: '#ddd' }}
            tickLine={{ stroke: '#ddd' }}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          
          {/* Tooltips */}
          <Tooltip 
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "10px"
            }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value) => `₹${value.toFixed(2)}`}
          />
          
          {/* Legends */}
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          {/* Lines for totalRevenue and totalOrders */}
          <Line
            type="monotone"
            dataKey="totalRevenue"
            stroke={COLORS[0]}
            strokeWidth={3}
            dot={{ r: 5, fill: COLORS[0], stroke: 'white', strokeWidth: 2 }} // Custom dots
            activeDot={{ r: 8, stroke: COLORS[0], strokeWidth: 2, fill: '#fff' }} // Active dot styling
            animationDuration={1500}
            connectNulls={true} // Ensure the line is continuous even with missing data
          />
          <Line
            type="monotone"
            dataKey="totalOrders"
            stroke={COLORS[1]}
            strokeWidth={3}
            dot={{ r: 5, fill: COLORS[1], stroke: 'white', strokeWidth: 2 }} // Custom dots
            activeDot={{ r: 8, stroke: COLORS[1], strokeWidth: 2, fill: '#fff' }} // Active dot styling
            animationDuration={1500}
            connectNulls={true}
          />

          {/* Brush for better interaction */}
          <Brush 
            dataKey="date"
            height={30}
            stroke="#8884d8"
            fill="#8884d8"
            travelWidth={20}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModernLineChart;
