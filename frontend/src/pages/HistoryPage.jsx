import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../demo/AppContext";
import HistoryTable from "../demo/HistoryTable";
import Pagination from "@/ui/Pagination";

const tabs = [
  { label: "All", key: "all" },
  { label: "My Requests", key: "my" },
  { label: "Requests by Others", key: "others" },
];

export default function HistoryPage() {
  const {
    requests,
    getRequests,
    myRequests,
    getMyRequests,
    requestsByOthers,
    getRequestsByOthers,
    userData,
  } = useContext(AppContext);

  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 5;

  useEffect(() => {
    getRequests();
    getMyRequests();
    getRequestsByOthers();
  }, [getRequests, getMyRequests, getRequestsByOthers]);

  useEffect(() => {
    if (!userData || !userData._id) return;

    if (activeTab === "all") {
      const combined = [...(myRequests || []), ...(requestsByOthers || [])];
      setFilteredRequests(combined);
      return;
    }

    if (activeTab === "my") {
      setFilteredRequests(myRequests || []);
      return;
    }

    setFilteredRequests(requestsByOthers || []);
  }, [activeTab, myRequests, requestsByOthers, userData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filteredRequests]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredRequests.slice(start, end);
  }, [currentPage, filteredRequests]);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;

  const totalRecords = filteredRequests.length;
  const showingFrom = totalRecords === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedRequests.length, totalRecords);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">History</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Review every signature request you've touched, filter by ownership, and revisit completed paperwork in seconds.
          </p>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/40 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                        : "border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Showing {showingFrom === 0 ? 0 : showingFrom}-{showingTo} of {totalRecords}
            </span>
          </div>

          {paginatedRequests.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <HistoryTable requests={paginatedRequests} startIndex={startIndex} />
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRequests.length}
                pageSize={ROWS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 py-12 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              No records found for this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
