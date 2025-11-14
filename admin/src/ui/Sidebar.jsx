/* eslint-disable react/prop-types */
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn'
import logoImage from '@/assets/logo.png'
import { navbarLinks } from '@/utils/constants';

const Sidebar = forwardRef(({ collapsed }, ref) => {
    return (
        <aside
            ref={ref}
            className={cn(
                'fixed z-[100] dark:bg-slate-900/95 dark:border-slate-700/60 bg-white/95 backdrop-blur-xl border-slate-200/60 border-r flex h-full w-[300px] flex-col overflow-x-hidden shadow-2xl [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)] ',
                collapsed ? 'md:w-[100px] md:items-center ' : 'md:w-[280px]',
                collapsed ? 'max-md:-left-full' : 'max-md:left-0'
            )}>
            
            {/* Header */}
            <div className='flex items-center justify-center p-6 h-[70px] border-b border-slate-200/60 dark:border-slate-700/60'>
                <NavLink to="/dashboard" className={cn(
                    "group flex items-center transition-all duration-200 hover:scale-105 gap-3",
                    collapsed && "justify-center"
                )}>
                    <div className="relative flex-shrink-0">
                        <img src={logoImage} alt="logo" className='w-10 h-10 object-contain rounded-lg' />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <p className='text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap leading-tight'>
                                Digital Signature
                            </p>
                            <p className='text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight'>
                                System
                            </p>
                        </div>
                    )}
                </NavLink>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-y-2 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
                {navbarLinks.map((navbarLink, index) => (
                    <nav key={index} className={cn(
                        "sidebar-group",
                        collapsed && 'md:items-center'
                    )}>
                        {navbarLink.links.map((link, linkIndex) => (
                            <NavLink 
                                key={linkIndex} 
                                to={link.path} 
                                className={cn(
                                    "sidebar-item group", 
                                    collapsed && "md:w-12 md:h-12 md:justify-center md:mx-auto"
                                )}
                            >
                                <div className="flex-shrink-0">
                                    <link.icon 
                                        size={20} 
                                        className="transition-all duration-200 group-hover:scale-110" 
                                        strokeWidth={2} 
                                    />
                                </div>
                                {!collapsed && (
                                    <span className='font-medium transition-all duration-200'>
                                        {link.label}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                ))}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className={cn(
                    "text-xs text-center text-slate-500 dark:text-slate-400 font-medium",
                    collapsed && "md:hidden"
                )}>
                    Admin Panel v2.0
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;