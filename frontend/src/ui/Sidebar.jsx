/* eslint-disable react/prop-types */
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn'
import logoImage from '@/assets/logo.png'
import { navbarLinks } from '@/utils/constants';
import { motion } from 'framer-motion';

const Sidebar = forwardRef(({ collapsed }, ref) => {
    return (
        <motion.aside
            ref={ref}
            className={cn(
                'fixed z-50 glass-sidebar flex h-full flex-col shadow-2xl transition-all duration-500 ease-out',
                collapsed ? 'w-20 md:items-center' : 'w-80',
                collapsed ? 'max-md:-left-full' : 'max-md:left-0'
            )}
            initial={{ x: collapsed ? -320 : 0 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Enhanced Logo Section */}
            <motion.div 
                className='flex items-center justify-center p-6 h-20 border-b border-slate-200/30 dark:border-slate-700/30'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <NavLink to="/dashboard" className="group flex items-center gap-3 transition-all duration-300">
                    <div className={cn(
                        "logo-container relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm group-hover:shadow-xl group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-105",
                        collapsed ? "w-12 h-12" : "w-14 h-14"
                    )}>
                        <img 
                            src={logoImage} 
                            alt="Digital Signature Logo" 
                            className="w-full h-full object-contain logo-glow group-hover:scale-110 transition-all duration-300"
                        />
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
                    </div>
                    
                    {!collapsed && (
                        <motion.div 
                            className='text-left'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <h1 className='text-lg font-bold gradient-text'>Digital Signature</h1>
                            <p className='text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide'>Premium System</p>
                        </motion.div>
                    )}
                </NavLink>
            </motion.div>
            
            {/* Navigation */}
            <div className={cn(
                "flex w-full flex-col gap-4 overflow-y-auto custom-scrollbar p-4",
                collapsed && 'md:items-center'
            )}>
                {
                    navbarLinks.map((navbarLink, groupIndex) => (
                        <motion.nav 
                            key={groupIndex} 
                            className="sidebar-group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 + (groupIndex * 0.1) }}
                        >
                            {
                                navbarLink.links.map((link, linkIndex) => (
                                    <NavLink 
                                        key={linkIndex} 
                                        to={link.path} 
                                        className={cn(
                                            "sidebar-item",
                                            collapsed && "md:w-12 md:h-12 md:justify-center md:px-0"
                                        )}
                                    >
                                        <link.icon size={20} className="flex-shrink-0" />
                                        {
                                            !collapsed && (
                                                <motion.p 
                                                    className='whitespace-nowrap font-medium'
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                >
                                                    {link.label}
                                                </motion.p>
                                            )
                                        }
                                        
                                        {/* Active indicator */}
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </NavLink>
                                ))
                            }
                        </motion.nav>
                    ))
                }
            </div>
            
            {/* Footer */}
            {!collapsed && (
                <motion.div 
                    className="mt-auto p-4 border-t border-slate-200/30 dark:border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            © 2025 Digital Signature
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Premium Edition
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.aside>
    );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;