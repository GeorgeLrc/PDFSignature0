import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusChart({ records, normalizeStatus }) {
  const successCount = records.filter(
    (r) => normalizeStatus(r.status) === "Success"
  ).length;
  const pendingCount = records.filter(
    (r) => normalizeStatus(r.status) === "Pending"
  ).length;

  const data = {
    labels: [
      `Success (${successCount})`,
      `Pending (${pendingCount})`
    ],
    datasets: [
      {
        data: [successCount, pendingCount],
        backgroundColor: ["#22c55e", "#eab308"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-center font-semibold mb-4">Request Status Distribution</h2>
      <Pie data={data} />
    </div>
  );
}
