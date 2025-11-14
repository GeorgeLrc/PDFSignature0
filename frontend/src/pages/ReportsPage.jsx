import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../demo/AppContext";
import ReportTable from "../demo/ReportTable";
import StatusChart from "../demo/StatusChart";
import RequestsOverTimeChart from "../demo/RequestsOverTimeChart";
import Pagination from "@/ui/Pagination";

export default function ReportsPage() {
  const { myRequests, getMyRequests } = useContext(AppContext);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = ["All Status", "Success", "Pending"];
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const ROWS_PER_PAGE = 5;

  useEffect(() => {
    getMyRequests(); // fetch only current user's requests
  }, []);

  useEffect(() => {
    if (myRequests) {
      setFilteredRequests(myRequests);
    }
  }, [myRequests]);

  // normalize status
  const normalizeStatus = (status) => {
    if (status === "approved") return "Success";
    if (status === "pending") return "Pending";
    return "Other";
  };

  // Filtering
  const filteredRecords =
    selectedStatus === "All Status"
      ? filteredRequests
      : filteredRequests.filter(
          (r) => normalizeStatus(r.status) === selectedStatus
        );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, filteredRequests]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredRecords.slice(start, end);
  }, [currentPage, filteredRecords]);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;

  // Counts (only current user’s requests)
  const successCount = filteredRequests.filter(
    (r) => normalizeStatus(r.status) === "Success"
  ).length;
  const pendingCount = filteredRequests.filter(
    (r) => normalizeStatus(r.status) === "Pending"
  ).length;
  const allCount = filteredRequests.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        <div className="border-b border-white/10 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-6 py-8 text-white sm:px-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Monitor how your documents move through the signing journey, compare success versus pending states, and keep your backlog under control.
          </p>
        </div>

        <div className="space-y-10 px-6 py-8 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm transition dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All</p>
              <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">{allCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-center shadow-sm transition dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Success</p>
              <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-200">{successCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50 px-5 py-4 text-center shadow-sm transition dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</p>
              <p className="text-3xl font-semibold text-amber-700 dark:text-amber-200">{pendingCount}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <StatusChart records={filteredRequests} normalizeStatus={normalizeStatus} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <RequestsOverTimeChart records={filteredRequests} />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Records</h2>
              <select
                className="min-w-[180px] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <ReportTable
              records={paginatedRecords}
              normalizeStatus={normalizeStatus}
              startIndex={startIndex}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredRecords.length}
              pageSize={ROWS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
