import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/useClickOutside";
import Sidebar from "@/ui/Sidebar";
import Header from "@/ui/Header";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout() {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);

    const sidebarRef = useRef(null);

    //? Toggle sidebar
    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/20">
            {/* Advanced background effects */}
            <div className="fixed inset-0 -z-20">
                {/* Primary gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
                
                {/* Animated gradient orbs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-conic from-blue-400/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-conic from-emerald-400/10 via-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-violet-400/5 to-transparent rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
                
                {/* Subtle mesh pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2306b6d4%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
            </div>
            
            {/* Mobile backdrop */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>
            
            {/* Sidebar */}
            <Sidebar ref={sidebarRef} collapsed={collapsed} />
            
            {/* Main Content */}
            <motion.div 
                className={cn(
                    "transition-all duration-500 ease-out min-h-screen",
                    collapsed ? "md:ml-[100px]" : "md:ml-[280px]"
                )}
                layout
            >
                {/* Header */}
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                
                {/* Page Content */}
                <main className="relative">
                    <div className="max-w-8xl mx-auto p-6 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </main>
            </motion.div>
        </div>
    )
}
