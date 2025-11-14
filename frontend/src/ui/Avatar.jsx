import defaultImage from '@/assets/default.jpg';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function Avatar() {
    const user = useSelector(store => store.user.user)
    
    return (
        <motion.div 
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative">
                <img 
                    src={user?.image || defaultImage} 
                    alt="User Avatar" 
                    className='w-12 h-12 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 cursor-pointer shadow-lg group-hover:shadow-xl transition-all duration-300 object-cover' 
                />
                
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full shadow-lg">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
            </div>
        </motion.div>
    )
}
