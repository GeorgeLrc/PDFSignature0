import { IconUsers, IconFileText, IconFlag, IconCheck, IconTrendingUp, IconActivity } from "@tabler/icons-react";
import Title from "../../ui/Title";
import DashboardFilter from "./DashboardFilter";
import FullfillmenChart from "./FullfillmenChart";
import Stat from "./Stat";
import StatusChart from "./StatusChart";
import TodayActivity from "./TodayActivity";
import { useSearchParams } from "react-router-dom";
import useUserLists from '../user/useUserLists'
import useAllTemplates from '../template/useAllTemplates'
import useRequestStats from './useRequestStats'
import { motion } from "framer-motion";

export default function DashboardLayout() {
    const { userLists } = useUserLists()
    const { templates } = useAllTemplates()
    const [searchParams] = useSearchParams()

    const filterValue = Number(searchParams.get('last')) || 7

    // compute dynamic stats from real request data
    const {
        totalRequests,
        fulfillmentRate,
        statusBreakdown,
        dailyTrend,
        recentRequests,
        dateRange,
        isPending: isStatsLoading,
    } = useRequestStats(filterValue)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.div 
                className="glass-card p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10"
                variants={itemVariants}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold gradient-text">Analytics Dashboard</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">Monitor your digital signature system performance</p>
                    </div>
                    <DashboardFilter />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={itemVariants}
            >
                <Stat 
                    label={'Total Users'} 
                    value={userLists?.length || 0} 
                    icon={IconUsers} 
                    gradient={'from-blue-500 to-cyan-500'}
                    bgGradient={'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'}
                    trend="+12%"
                    trendDirection="up"
                />
                <Stat 
                    label={'Templates'} 
                    value={templates?.length || 0} 
                    icon={IconFileText} 
                    gradient={'from-emerald-500 to-teal-500'}
                    bgGradient={'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'}
                    trend="+8%"
                    trendDirection="up"
                />
                <Stat 
                    label={'Total Requests'} 
                    value={isStatsLoading ? 0 : totalRequests || 0} 
                    icon={IconFlag} 
                    gradient={'from-amber-500 to-orange-500'}
                    bgGradient={'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'}
                    trend="+24%"
                    trendDirection="up"
                />
                <Stat 
                    label={'Success Rate'} 
                    value={isStatsLoading ? 0 : fulfillmentRate || 0} 
                    icon={IconCheck} 
                    gradient={'from-violet-500 to-purple-500'}
                    bgGradient={'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20'}
                    isPercentage={true}
                    trend="+5%"
                    trendDirection="up"
                />
            </motion.div>

            {/* Activity and Analytics Row */}
            <motion.div 
                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
                variants={itemVariants}
            >
                <div className="xl:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white">
                            <IconActivity size={20} />
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">Recent Activity</h2>
                    </div>
                    <TodayActivity recentRequests={recentRequests} isLoading={isStatsLoading} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-secondary to-accent text-white">
                            <IconTrendingUp size={20} />
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">Status Overview</h2>
                    </div>
                    <StatusChart data={statusBreakdown} isLoading={isStatsLoading} />
                </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-accent to-primary text-white">
                        <IconTrendingUp size={20} />
                    </div>
                    <h2 className="text-2xl font-bold gradient-text">Performance Analytics</h2>
                </div>
                <FullfillmenChart
                    dailyTrend={dailyTrend}
                    dateRange={dateRange}
                    isLoading={isStatsLoading}
                />
            </motion.div>
        </motion.div>
    )
}
