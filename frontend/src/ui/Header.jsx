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
                                collapsed ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
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