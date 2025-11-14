import { IconMoon, IconSun } from "@tabler/icons-react"
import useTheme from "@/hooks/useTheme"
import { motion } from "framer-motion"

export default function ThemeToggleBtn() {
    const { theme, changeTheme, isDark } = useTheme()
    
    return (
        <motion.button
            onClick={() => changeTheme(theme === "light" ? "dark" : "light")}
            className="relative p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl group overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative w-5 h-5">
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ 
                        rotate: isDark ? 180 : 0,
                        opacity: isDark ? 0 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <IconSun size={20} className="text-amber-500 group-hover:text-amber-600" />
                </motion.div>
                
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ 
                        rotate: isDark ? 0 : -180,
                        opacity: isDark ? 1 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <IconMoon size={20} className="text-slate-600 dark:text-slate-300 group-hover:text-primary" />
                </motion.div>
            </div>
            
            {/* Animated background gradient */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                animate={{ 
                    scale: isDark ? 0 : 1,
                    opacity: isDark ? 0 : (0.1)
                }}
                transition={{ duration: 0.3 }}
            />
            
            <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                animate={{ 
                    scale: isDark ? 1 : 0,
                    opacity: isDark ? (0.1) : 0
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    )
}
