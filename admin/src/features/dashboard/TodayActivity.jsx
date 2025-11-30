import { formatDistanceToNow } from "date-fns";

const STATUS_BADGES = {
    pending: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200/70 dark:border-blue-400/30",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-400/30",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/70 dark:border-rose-400/30",
    other: "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300 border border-slate-200/70 dark:border-slate-600/40",
}

const getStatusLabel = (status) => {
    if (!status) return "Pending"
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function TodayActivity({ recentRequests = [], isLoading }) {
    const hasData = recentRequests?.length > 0

    return (
        <div className="glass-card p-6 space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">History Activities</h2>
            <div className="h-64 overflow-y-auto custom-scrollbar space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading activity...
                    </div>
                ) : hasData ? (
                    recentRequests.map((request) => {
                        const statusClass = STATUS_BADGES[request.status] || STATUS_BADGES.other
                        const primaryRecipient = request.recipients?.[0]?.name || "No recipient"
                        const extraRecipients = Math.max((request.recipients?.length || 0) - 1, 0)
                        const createdAt = request.createdAt ? new Date(request.createdAt) : null
                        const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "Unknown"

                        return (
                            <div
                                key={request.id}
                                className="flex flex-wrap items-center gap-3 rounded-xl bg-white/50 p-4 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                            >
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                                    {getStatusLabel(request.status)}
                                </span>
                                <div className="flex-1 min-w-[200px]">
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {request.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {request.sender} → {primaryRecipient}
                                        {extraRecipients > 0 ? ` +${extraRecipients}` : ""}
                                    </p>
                                </div>
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {timeAgo}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex items-center justify-center py-16 text-sm font-medium text-slate-500 dark:text-slate-400">
                        No recent activity in this period.
                    </div>
                )}
            </div>
        </div>
    )
}
