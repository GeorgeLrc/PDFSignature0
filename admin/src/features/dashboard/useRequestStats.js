import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns"
import api from '@/utils/api'

const fetchAllRequests = async () => {
    // admin can reuse the public user route that returns all requests
    const { data } = await api.get('/api/auth/requests')
    if (!data || !data.success) return []
    return data.requests || []
}

const STATUS_COLORS = {
    pending: "#3B82F6",
    approved: "#22C55E",
    rejected: "#DC2626",
    other: "#94A3B8",
}

const formatUserName = (user) => {
    if (!user) return "Unknown"
    if (typeof user === 'string') return user
    const first = user.first_name || ""
    const last = user.last_name || ""
    const full = `${first} ${last}`.trim()
    if (full) return full
    return user.email || "Unknown"
}

const normalizeStatus = (status) => {
    const normalized = (status || "pending").toLowerCase()
    if (normalized === "pending" || normalized === "approved" || normalized === "rejected") return normalized
    return "other"
}

const useRequestStats = (lastDays = 7) => {
    const daysWindow = Number.isFinite(lastDays) && lastDays > 0 ? Math.floor(lastDays) : 7

    const { data: requests = [], isPending } = useQuery({
        queryKey: ['request-stats', lastDays],
        queryFn: fetchAllRequests,
        // keep fresh for a short while
        staleTime: 1000 * 60,
    })

    const analytics = useMemo(() => {
        const windowEnd = endOfDay(new Date())
        const windowStart = startOfDay(subDays(windowEnd, daysWindow - 1))

        const filtered = (requests || []).filter((request) => {
            try {
                const createdAt = new Date(request.createdAt)
                if (Number.isNaN(createdAt.getTime())) return false
                return createdAt >= windowStart && createdAt <= windowEnd
            } catch (error) {
                return false
            }
        })

        const totalRequests = filtered.length
        const approvedCount = filtered.filter((request) => normalizeStatus(request.status) === 'approved').length
        const fulfillmentRate = totalRequests === 0 ? 0 : Math.round((approvedCount / totalRequests) * 100)

        const statusCounts = filtered.reduce((acc, request) => {
            const key = normalizeStatus(request.status)
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, { pending: 0, approved: 0, rejected: 0, other: 0 })

        const statusBreakdown = Object.entries(statusCounts)
            .filter(([, value]) => value > 0)
            .map(([status, value]) => ({
                label: status === 'other' ? 'Other' : status.charAt(0).toUpperCase() + status.slice(1),
                value,
                color: STATUS_COLORS[status] || STATUS_COLORS.other,
            }))

        const allDays = eachDayOfInterval({ start: windowStart, end: windowEnd })
        const countsByDay = filtered.reduce((acc, request) => {
            const createdAt = new Date(request.createdAt)
            const key = format(createdAt, 'yyyy-MM-dd')
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, {})

        const dailyTrend = allDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            return {
                date: day.toISOString(),
                label: format(day, 'MMM dd'),
                value: countsByDay[key] || 0,
            }
        })

        const recentRequests = [...filtered]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map((request) => {
                const recipients = (request.recipients || []).map((recipient) => {
                    const user = recipient.userId || {}
                    return {
                        id: user._id || recipient.userId,
                        name: formatUserName(user),
                        signed: Boolean(recipient.signed),
                    }
                })

                return {
                    id: request._id,
                    title: request.title || 'Untitled Request',
                    status: normalizeStatus(request.status),
                    createdAt: request.createdAt,
                    sender: formatUserName(request.senderId || {}),
                    recipients,
                }
            })

        return {
            totalRequests,
            fulfillmentRate,
            statusBreakdown,
            dailyTrend,
            recentRequests,
            dateRange: {
                start: windowStart.toISOString(),
                end: windowEnd.toISOString(),
            },
        }
    }, [requests, daysWindow])

    return { ...analytics, isPending }
}

export default useRequestStats
