import React from "react";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { motion } from "framer-motion";

/* eslint-disable react/prop-types */
export default function Stat({ label, value, icon, gradient, bgGradient, isPercentage = false, trend, trendDirection = "up" }) {
    return (
        <motion.div 
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-6 shadow-lg border border-white/20 dark:border-slate-700/30 backdrop-blur-sm`}
            whileHover={{ 
                scale: 1.02, 
                y: -4,
                transition: { duration: 0.2 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative">
                {/* Header with icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        {icon && React.createElement(icon, { 
                            className: "h-7 w-7 text-white",
                            strokeWidth: 2
                        })}
                    </div>
                    
                    {/* Trend indicator */}
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            trendDirection === 'up' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {trendDirection === 'up' ? (
                                <IconTrendingUp size={12} />
                            ) : (
                                <IconTrendingDown size={12} />
                            )}
                            {trend}
                        </div>
                    )}
                </div>
                
                {/* Label */}
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    {label}
                </p>
                
                {/* Value */}
                <motion.p 
                    className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {isPercentage ? `${value}%` : value?.toLocaleString() || '0'}
                </motion.p>
                
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div 
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: isPercentage ? `${Math.min(value, 100)}%` : "75%" }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
