import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

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
  const [expandedRows, setExpandedRows] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const toggleRow = (requestId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const handleOpenFile = (filePath) => {
    if (!backendUrl || !filePath) {
      alert('File unavailable');
      return;
    }
    window.open(`${backendUrl}/files/${filePath}`, '_blank');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <thead>
          <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <th scope="col" className="py-3 px-4 text-center w-12">#</th>
            <th scope="col" className="py-3 px-4 text-left">Title</th>
            <th scope="col" className="py-3 px-4 text-left">Approvers</th>
            <th scope="col" className="py-3 px-4 text-center">Date</th>
            <th scope="col" className="py-3 px-4 text-center">Status</th>
            <th scope="col" className="py-3 px-4 text-center w-12">Signed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {requests && requests.length > 0 ? (
            requests.map((request, index) => {
              const rowNumber = startIndex + index + 1;
              const statusKey = (request.status || "default").toLowerCase();
              const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.default;
              const isExpanded = expandedRows[request._id];
              const hasPdfVersions = request.pdfVersions && request.pdfVersions.length > 0;

              return (
                <React.Fragment key={request._id ?? rowNumber}>
                  <tr className="transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-800/60">
                    <td className="py-3 px-4 text-center font-semibold text-slate-500 dark:text-slate-400">
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
                            const isSigned = recipient.signed;

                            return (
                              <span
                                key={`${request._id ?? index}-approver-${idx}`}
                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                                  isSigned
                                    ? "border-green-500/25 bg-green-500/10 text-green-600 dark:border-green-400/20 dark:bg-green-500/10 dark:text-green-300"
                                    : "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300"
                                }`}
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
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
                        {request.status
                          ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasPdfVersions ? (
                        <button
                          onClick={() => toggleRow(request._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title={isExpanded ? "Hide signed PDFs" : "Show signed PDFs"}
                          type="button"
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-slate-600 dark:text-slate-300" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-600 dark:text-slate-300" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded row showing signed PDFs */}
                  {isExpanded && hasPdfVersions && (
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td colSpan="6" className="py-4 px-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <FileText size={16} />
                            Signed PDF Versions
                          </h4>
                          <div className="space-y-2 ml-4">
                            {request.pdfVersions.map((pdf, idx) => {
                              const signerName = pdf.signedBy?.userId
                                ? `${pdf.signedBy.userId.first_name || ""} ${pdf.signedBy.userId.last_name || ""}`.trim()
                                : "Unknown signer";
                              const signedDate = pdf.signedAt ? new Date(pdf.signedAt).toLocaleString() : "—";

                              return (
                                <div
                                  key={`${request._id}-pdf-${idx}`}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-sm transition"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                      Version {pdf.version}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Signed by {signerName} on {signedDate}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleOpenFile(pdf.filePath)}
                                    className="ml-3 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition"
                                    type="button"
                                    title="Download PDF"
                                  >
                                    View
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-6 px-4 text-center text-slate-400 dark:text-slate-500">
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
