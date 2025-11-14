import React from "react";

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-200",
  approved:
    "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400/30 dark:text-emerald-200",
  rejected:
    "bg-rose-100 text-rose-700 border border-rose-200 shadow-sm dark:bg-rose-500/15 dark:border-rose-400/30 dark:text-rose-200",
  default:
    "bg-slate-100 text-slate-600 border border-slate-200 shadow-sm dark:bg-slate-700/40 dark:border-slate-600/40 dark:text-slate-200",
};

export default function HistoryTable({ requests, startIndex = 0 }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <thead>
          <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <th scope="col" className="py-3 px-4">#</th>
            <th scope="col" className="py-3 px-4">Title</th>
            <th scope="col" className="py-3 px-4">Approvers</th>
            <th scope="col" className="py-3 px-4">Date</th>
            <th scope="col" className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {requests && requests.length > 0 ? (
            requests.map((request, index) => {
              const rowNumber = startIndex + index + 1;
              const statusKey = (request.status || "default").toLowerCase();
              const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.default;

              return (
                <tr
                  key={request._id ?? rowNumber}
                  className="text-center transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-800/60"
                >
                  <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">
                    {String(rowNumber).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4 text-left font-medium">
                    <span className="text-slate-700 dark:text-slate-100">{request.title || "Untitled"}</span>
                  </td>
                  <td className="py-3 px-4 text-left">
                    {request.recipients && request.recipients.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {request.recipients.map((recipient, idx) => {
                          const user = recipient?.userId;
                          const displayName = user
                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown user"
                            : "Unknown user";

                          return (
                            <span
                              key={`${request._id ?? index}-approver-${idx}`}
                              className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300"
                            >
                              {displayName}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">No recipients</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
                      {request.status
                        ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                        : "Unknown"}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-6 px-4 text-center text-slate-400 dark:text-slate-500">
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
