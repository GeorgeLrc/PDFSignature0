/* eslint-disable react/prop-types */
import { IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function CreateBtn({ text, icon: IconComponent = IconPlus, ...props }) {
    return (
        <motion.button 
            className='btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            <IconComponent size={18} stroke={2.5} /> 
            {text}
        </motion.button>
    );
}