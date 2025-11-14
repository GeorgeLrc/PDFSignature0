/* eslint-disable react/prop-types */
import { IconMenu2, IconX } from '@tabler/icons-react';
import ThemeToggleBtn from './btns/ThemeToggleBtn'
import { cn } from '@/utils/cn';
import Avatar from './Avatar';
import Modal from './modals/Modal';
import ProfileModal from './modals/ProfileModal';
import { motion } from 'framer-motion';

export default function Header({ collapsed, setCollapsed }) {

    return (
        <motion.header 
            className="glass-header h-20 flex items-center justify-between px-6 shadow-lg relative z-30 border-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className='flex items-center gap-4'>
                <motion.button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="relative w-5 h-5">
                        <IconMenu2 
                            size={20} 
                            className={cn(
                                "absolute inset-0 text-slate-600 dark:text-slate-300 transition-all duration-300 group-hover:text-primary",
                                !collapsed ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                            )} 
                        />
                        <IconX 
                            size={20} 
                            className={cn(
                                "absolute inset-0 text-slate-600 dark:text-slate-300 transition-all duration-300 group-hover:text-primary",
                                collapsed ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                            )} 
                        />
                    </div>
                </motion.button>
                
                {/* Search bar for larger screens */}
                <motion.div 
                    className="hidden lg:flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-80 pl-4 pr-10 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-600/60 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            <Modal>
                <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <ThemeToggleBtn />

                    <Modal.Open opens={'logout'}>
                        <div className="cursor-pointer">
                            <Avatar />
                        </div>
                    </Modal.Open>

                    <Modal.Window name={'logout'} padding={false}>
                        <ProfileModal />
                    </Modal.Window>
                </motion.div>
            </Modal>
        </motion.header>
    );
}