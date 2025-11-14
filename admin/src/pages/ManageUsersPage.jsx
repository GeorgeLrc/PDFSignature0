import Title from '@/ui/Title';
import Modal from '@/ui/modals/Modal'
import CreateEditUserModal from '@/features/user/CreateEditUserModal';
import UserTable from '@/features/user/UserTable'
import CreateBtn from '@/ui/btns/CreateBtn';
import { motion } from "framer-motion";
import { IconUsers, IconUserPlus } from "@tabler/icons-react";

export default function ManageUsersPage() {
    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header Section */}
            <div className="glass-card p-8 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                            <IconUsers size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage system users and permissions</p>
                        </div>
                    </div>
                    
                    <Modal>
                        <Modal.Open opens={'create-user'}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <CreateBtn text='Add User' icon={IconUserPlus} />
                            </motion.div>
                        </Modal.Open>

                        <Modal.Window name={'create-user'} width='500px'>
                            <CreateEditUserModal />
                        </Modal.Window>
                    </Modal>
                </div>
            </div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <UserTable />
            </motion.div>
        </motion.div>
    );
}
