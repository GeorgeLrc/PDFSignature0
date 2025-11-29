import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import Pagination from "@/ui/Pagination";

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-400/10 dark:border-emerald-400/20 dark:text-emerald-300",
  rejected:
    "bg-rose-100 text-rose-700 border border-rose-200 shadow-sm dark:bg-rose-400/10 dark:border-rose-400/20 dark:text-rose-300",
  default:
    "bg-slate-100 text-slate-600 border border-slate-200 shadow-sm dark:bg-slate-700/40 dark:border-slate-600/40 dark:text-slate-200",
};

export default function RequestsPage() {

  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [requestsByOthers, setRequestsByOthers] = useState([]);
  const [myRequestsPage, setMyRequestsPage] = useState(1);
  const [othersPage, setOthersPage] = useState(1);
  const { accessToken } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const ROWS_PER_PAGE = 5;

  const handleOpenFile = (filePath) => {
    if (!backendUrl) {
      toast.error('Backend URL not configured.');
      return;
    }
    window.open(`${backendUrl}/files/${filePath}`, '_self');
  };

  const handleCancel = async (requestId) => {
    const ok = window.confirm('Cancel/delete this request? This cannot be undone.');
    if (!ok) return;
    try {
      const { data } = await api.post('/api/auth/delete-request', { requestId }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (data && data.success) {
        toast.success(data.message || 'Request cancelled');
      } else {
        toast.error(data.message || 'Failed to cancel');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Network error');
    }
    // refresh lists
    getMyRequest(accessToken);
    getRequestByOthers(accessToken);
  }

  const checkFinishedSignedCount = (recipients) => {
    if (!Array.isArray(recipients)) return [];
    return recipients.filter((recipient) => recipient.signed === true);
  };

  const getSignedPercent = (completed, total) => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getPercentColor = (percent) => {
    if (percent <= 33) return 'text-red-600 dark:text-red-400';
    if (percent <= 66) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressBarColor = (percent) => {
    if (percent <= 33) return 'bg-red-500';
    if (percent <= 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMyRequest = async (token) => {
    try {
        let { data } = await api.get("/api/auth/my-requests", {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            });

        if(data.success === true) {
            console.log(data);
            setMyRequests(data.requests);
        }
        
            
    } catch (error) {
        console.log(error);
        toast.error(error);
    }
  }

  const getRequestByOthers = async (token) => {
    try {
        let { data } = await api.get("/api/auth/requests-by-others", {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            });

        if(data.success === true) {
            console.log(data);
            setRequestsByOthers(data.requests);
        }
        
            
    } catch (error) {
        console.log(error);
        toast.error(error);
    }
  }

  useEffect(() => {
    getMyRequest(accessToken);
    getRequestByOthers(accessToken);
  }, [accessToken]);

  useEffect(() => {
    setMyRequestsPage(1);
  }, [myRequests]);

  useEffect(() => {
    setOthersPage(1);
  }, [requestsByOthers]);

  const paginatedMyRequests = useMemo(() => {
    const start = (myRequestsPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return {
      rows: myRequests.slice(start, end),
      startIndex: start,
    };
  }, [myRequests, myRequestsPage]);

  const paginatedRequestsByOthers = useMemo(() => {
    const start = (othersPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return {
      rows: requestsByOthers.slice(start, end),
      startIndex: start,
    };
  }, [othersPage, requestsByOthers]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        <header className="flex flex-col gap-2 rounded-t-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white">
          <h2 className="text-xl font-semibold sm:text-2xl">My Requests</h2>
          <p className="text-sm text-white/80">
            Track every document you've sent for signatures and monitor progress at a glance.
          </p>
        </header>
        <div className="overflow-x-auto px-4 pb-6 pt-4 sm:px-6">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600 dark:divide-slate-700 dark:text-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-3 pr-4">#</th>
                <th scope="col" className="py-3 pr-4">Title</th>
                <th scope="col" className="py-3 pr-4">Approvers</th>
                <th scope="col" className="py-3 pr-4">Step</th>
                <th scope="col" className="py-3 pr-4">Date</th>
                <th scope="col" className="py-3 pr-4">Status</th>
                <th scope="col" className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedMyRequests.rows && paginatedMyRequests.rows.length > 0 ? (
                paginatedMyRequests.rows.map((request, index) => {
                  const rowNumber = paginatedMyRequests.startIndex + index + 1;
                  const statusKey = (request.status || "default").toLowerCase();
                  const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.default;
                  const completed = request.recipients
                    ? checkFinishedSignedCount(request.recipients).length
                    : 0;
                  const total = request.recipients?.length ?? 0;

                  return (
                    <tr
                      key={request._id ?? rowNumber}
                      className="group transition-colors hover:bg-blue-50 hover:text-slate-700 dark:hover:bg-slate-800/70"
                    >
                      <td className="py-4 pr-4 font-semibold text-slate-500 dark:text-slate-400">
                        {String(rowNumber).padStart(2, "0")}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-700 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                            {request.title || "Untitled"}
                          </span>
                          {request.description ? (
                            <span className="max-w-xs truncate text-xs text-slate-400 dark:text-slate-500">
                              {request.description}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          {request.recipients && request.recipients.length ? (
                            request.recipients.map((recipient, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300"
                              >
                                {(recipient.userId?.first_name || "").trim()} {recipient.userId?.last_name || ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No approvers</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4 font-semibold">
                        <div className="flex items-center gap-3">
                          <span>{completed}/{total}</span>
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                            <div 
                              className={`h-full ${getProgressBarColor(getSignedPercent(completed, total))} transition-all duration-300`}
                              style={{ width: `${getSignedPercent(completed, total)}%` }}
                            />
                          </div>
                          <span className={`font-semibold ${getPercentColor(getSignedPercent(completed, total))}`}>
                            {getSignedPercent(completed, total)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-500 dark:text-slate-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
                          {request.status
                            ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {request.pdfVersions && request.pdfVersions.length > 0 ? (
                            <button
                              onClick={() =>
                                handleOpenFile(
                                  request.pdfVersions[request.pdfVersions.length - 1].filePath
                                )
                              }
                              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98] hover:shadow-md"
                              type="button"
                            >
                              View
                            </button>
                          ) : null}
                          {request.status !== "approved" ? (
                            <button
                              onClick={() => handleCancel(request._id)}
                              className="inline-flex items-center justify-center rounded-full border border-rose-400/50 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-500/20 active:scale-[0.98] dark:border-rose-400/30 dark:text-rose-300"
                              type="button"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                    You haven't created any requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={myRequestsPage}
            totalItems={myRequests.length}
            pageSize={ROWS_PER_PAGE}
            onPageChange={setMyRequestsPage}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        <header className="flex flex-col gap-2 rounded-t-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
          <h2 className="text-xl font-semibold sm:text-2xl">Requests Sent To Me</h2>
          <p className="text-sm text-white/70">
            Review documents awaiting your signature and jump straight into signing.
          </p>
        </header>
        <div className="overflow-x-auto px-4 pb-6 pt-4 sm:px-6">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600 dark:divide-slate-700 dark:text-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-3 pr-4">#</th>
                <th scope="col" className="py-3 pr-4">Title</th>
                <th scope="col" className="py-3 pr-4">Sender</th>
                <th scope="col" className="py-3 pr-4">Date</th>
                <th scope="col" className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedRequestsByOthers.rows && paginatedRequestsByOthers.rows.length > 0 ? (
                paginatedRequestsByOthers.rows.map((request, index) => {
                  const rowNumber = paginatedRequestsByOthers.startIndex + index + 1;
                  return (
                    <tr
                      key={request._id ?? rowNumber}
                      className="group transition-colors hover:bg-slate-100/80 hover:text-slate-700 dark:hover:bg-slate-800/70"
                    >
                      <td className="py-4 pr-4 font-semibold text-slate-500 dark:text-slate-400">
                        {String(rowNumber).padStart(2, "0")}
                      </td>
                    <td className="py-4 pr-4 font-semibold text-slate-700 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                      {request.title || "Untitled"}
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400">
                      {request.senderId
                        ? `${request.senderId.first_name || ""} ${request.senderId.last_name || ""}`.trim() || "––"
                        : "Unknown Sender"}
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/sign-pdf/${request._id}`)}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                        type="button"
                      >
                        Sign
                      </button>
                    </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                    No pending requests from others.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={othersPage}
            totalItems={requestsByOthers.length}
            pageSize={ROWS_PER_PAGE}
            onPageChange={setOthersPage}
          />
        </div>
      </section>
    </div>
  );
}
