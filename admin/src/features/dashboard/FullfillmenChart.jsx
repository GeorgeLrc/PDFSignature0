import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import useTheme from '@/hooks/useTheme';

const formatRangeLabel = (dateRange) => {
    if (!dateRange?.start || !dateRange?.end) return 'Fulfillment Trend'
    try {
        const start = format(new Date(dateRange.start), 'MMM dd yyyy')
        const end = format(new Date(dateRange.end), 'MMM dd yyyy')
        return `Fulfillment from ${start} to ${end}`
    } catch (error) {
        return 'Fulfillment Trend'
    }
}

export default function FullfillmenChart({ dailyTrend = [], dateRange, isLoading }) {
    const { isDark } = useTheme()

    const colors = isDark
        ? {
            series: { stroke: "#4f46e5", fill: "#4f46e5" },
            text: "#e5e7eb",
            background: "#18212f",
        }
        : {
            series: { stroke: "#4f46e5", fill: "#c7d2fe" },
            text: "#374151",
            background: "#fff",
        }

    const hasPoints = dailyTrend?.length > 0
    const allZero = hasPoints && dailyTrend.every((point) => point.value === 0)

    return (
        <div className="w-full glass-card p-6">
            <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {formatRangeLabel(dateRange)}
            </h2>
            <div className="h-80">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading fulfillment data...
                    </div>
                ) : !hasPoints ? (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        No request activity in this period.
                    </div>
                ) : (
                    <ResponsiveContainer height={'100%'} width={'100%'}>
                        <AreaChart data={dailyTrend}>
                            <XAxis dataKey={'label'} tick={{ fill: colors.text }} tickLine={{ stroke: colors.text }} />
                            <YAxis tick={{ fill: colors.text }} tickLine={{ stroke: colors.text }} allowDecimals={false} />
                            <CartesianGrid strokeDasharray={'4'} />
                            <Tooltip contentStyle={{ backgroundColor: colors.background }} />
                            <Area
                                dataKey={'value'}
                                type={'monotone'}
                                strokeWidth={2}
                                stroke={colors.series.stroke}
                                fill={colors.series.fill}
                                name="Requests"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
            {!isLoading && hasPoints && allZero && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    No new requests completed during this period.
                </p>
            )}
        </div>
    )
}
