import React from "react";

const STATUS_TEXT = {
  Success: "text-emerald-600 dark:text-emerald-300",
  Pending: "text-amber-500 dark:text-amber-300",
  Failed: "text-rose-500 dark:text-rose-300",
  Other: "text-slate-500 dark:text-slate-400",
};

export default function ReportTable({ records, normalizeStatus, startIndex = 0 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <thead>
          <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Approvers</th>
            <th className="py-3 px-4">Request Date</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {records && records.length > 0 ? (
            records.map((record, index) => {
              const rowNumber = startIndex + index + 1;
              const normalizedStatus = normalizeStatus(record.status);
              const colorClass = STATUS_TEXT[normalizedStatus] || STATUS_TEXT.Other;

              return (
                <tr
                  key={record._id || rowNumber}
                  className="transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-800/60"
                >
                  <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">
                    {String(rowNumber).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-100">
                    {record.title || "Untitled"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {record.recipients?.length ? (
                        record.recipients.map((recipient, recipientIndex) => {
                          const user = recipient?.userId;
                          const name = user
                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown user"
                            : "Unknown user";

                          return (
                            <span
                              key={`${record._id || index}-recipient-${recipientIndex}`}
                              className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300"
                            >
                              {name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">No recipients</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`py-3 px-4 font-semibold ${colorClass}`}>
                    {normalizedStatus}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-6 px-4 text-center text-slate-400 dark:text-slate-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
