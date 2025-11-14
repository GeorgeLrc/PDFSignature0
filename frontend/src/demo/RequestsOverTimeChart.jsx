import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RequestsOverTimeChart({ records }) {
  // Group requests by month
  const monthCounts = {};
  records.forEach((r) => {
    const date = new Date(r.createdAt);
    const month = date.toLocaleString("default", { month: "short", year: "numeric" });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
    const [aMonth, aYear] = a.split(" ");
    const [bMonth, bYear] = b.split(" ");
    return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
  });

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Requests",
        data: sortedMonths.map((m) => monthCounts[m]),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-center font-semibold mb-4">Requests per Month</h2>
      <Bar data={data} />
    </div>
  );
}
