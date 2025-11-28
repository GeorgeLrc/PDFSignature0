/* eslint-disable react/prop-types */
import { useState } from 'react'
import Table from "@/ui/Table";
import moment from "moment";
import Modal from '@/ui/modals/Modal'
import Menus from "@/ui/Menus";
import { IconPencil, IconTrash, IconUser, IconMail, IconCalendar, IconEye, IconEyeOff } from "@tabler/icons-react";
import CreateEditUserModal from './CreateEditUserModal'
import ConfirmDelete from "@/ui/modals/ConfirmDelete";
import useDeleteUser from './useDeleteUser'
import ConfirmAction from '@/ui/modals/ConfirmAction'
import useToggleStatus from '@/features/user/useToggleStatus'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

export default function UserRow({ user, animationDelay = 0 }) {
    const { deleteUser, isDeleting } = useDeleteUser()
    const { toggleStatus, isToggling } = useToggleStatus()
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const maskedPassword = user.password ? '*'.repeat(Math.min(user.password.length, 12)) : 'N/A'
    const passwordDisplay = isPasswordVisible ? user.password : maskedPassword

    return (
        <Table.Row
            as={motion.tr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.3 }}
            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200"
        >
            {/* Name with avatar */}
            <Table.Cell>
                <div className="flex items-center gap-4 h-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                        {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || 'N'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                            <IconUser size={14} />
                            <span>ID: {user._id?.slice(-6) || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </Table.Cell>
            
            {/* Email */}
            <Table.Cell>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 h-full">
                    <IconMail size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium">{user.email}</span>
                </div>
            </Table.Cell>
            
            {/* Password */}
            <Table.Cell>
                <div className="flex items-center gap-2 h-full">
                    <span className="inline-flex items-center font-mono text-sm bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-none">
                        <span className="truncate">{passwordDisplay}</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                        aria-pressed={isPasswordVisible}
                        title={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                        {isPasswordVisible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                </div>
            </Table.Cell>
            
            {/* Created Date */}
            <Table.Cell>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 h-full">
                    <IconCalendar size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="font-medium">{moment(user?.date).format("MMM Do YY") || 'N/A'}</span>
                </div>
            </Table.Cell>
            
            {/* Status */}
            <Table.Cell>
                <Modal>
                    <div className="flex items-center justify-between h-full">
                        {/* Status toggle (opens confirmation modal) */}
                        <Modal.Open opens={'confirm-toggle'}>
                            <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <div className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        disabled={isToggling}
                                        checked={user?.isRestricted}
                                        className="sr-only peer"
                                        readOnly
                                        onClick={(e) => e.preventDefault()}
                                    />
                                    <div className="h-7 w-12 bg-green-500 dark:bg-green-600 peer-focus:outline-none rounded-full transition-all duration-300 peer-checked:bg-red-500 shadow-lg">
                                        <div className={cn("absolute w-5 h-5 bg-white rounded-full top-1 shadow-lg transition-transform duration-300 border border-slate-200", user?.isRestricted ? 'translate-x-6' : 'translate-x-1')}></div>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-sm font-semibold transition-colors",
                                    user?.isRestricted ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                )}>
                                    {user?.isRestricted ? 'Restricted' : 'Active'}
                                </span>
                            </div>
                        </Modal.Open>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Modal.Open opens='edit-form'>
                                <motion.button 
                                    className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Edit User"
                                >
                                    <IconPencil size={16} />
                                </motion.button>
                            </Modal.Open>

                            <Menus.Toggle id={user._id} className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border border-slate-200 dark:border-slate-700" />

                            {/* Delete & More Options */}
                            <Menus.List id={user._id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Modal.Open opens='delete'>
                                        <Menus.Button 
                                            icon={<IconTrash size={16} className="text-red-500" />}
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        >
                                            Delete User
                                        </Menus.Button>
                                    </Modal.Open>
                                </motion.div>
                            </Menus.List>
                        </div>

                        {/* Confirm Toggle Modal */}
                        <Modal.Window name='confirm-toggle' width='450px' padding={false}>
                            <ConfirmAction
                                title={user?.isRestricted ? 'Unrestrict User' : 'Restrict User'}
                                description={user?.isRestricted ? 'Are you sure you want to Unrestrict this user?' : 'Are you sure you want to Restrict this user?'}
                                confirmLabel={user?.isRestricted ? 'Unrestrict' : 'Restrict'}
                                disabled={isToggling}
                                onAction={() => {
                                    return new Promise((resolve) => {
                                        toggleStatus(user._id, {
                                            onSuccess: () => {
                                                setTimeout(resolve, 300);
                                            },
                                            onError: resolve
                                        });
                                    });
                                }}
                            />
                        </Modal.Window>

                        {/* Edit Form */}
                        <Modal.Window name='edit-form' width='500px'>
                            <CreateEditUserModal userToEdit={user} />
                        </Modal.Window>

                        {/* Delete Form */}
                        <Modal.Window name='delete' width='450px' padding={false}>
                            <ConfirmDelete type='user' disabled={isDeleting} onAction={() => deleteUser(user._id)} />
                        </Modal.Window>
                    </div>
                </Modal>
            </Table.Cell>
        </Table.Row>
    )
}
