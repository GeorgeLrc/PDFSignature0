import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function StatusChart({ data = [], isLoading }) {
    const hasData = data?.some((item) => item.value > 0)

    return (
        <div className="glass-card p-6 space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Status Summary</h2>
            <div className="h-64">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading status data...
                    </div>
                ) : hasData ? (
                    <ResponsiveContainer width={'100%'} height={'100%'}>
                        <PieChart>
                            <Pie
                                data={data}
                                nameKey={'label'}
                                dataKey={'value'}
                                innerRadius={65}
                                outerRadius={110}
                                cx={'40%'}
                                cy={'50%'}
                                paddingAngle={3}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.label} fill={entry.color} stroke={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="middle" align="right" width={'30%'} layout="vertical" iconSize={15} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        No requests found for this period.
                    </div>
                )}
            </div>
        </div>
    )
}
