/* eslint-disable react/prop-types */
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { motion } from 'framer-motion'

export default function AdminPasswordConfirmModal({ onConfirm, onCancel, isLoading = false }) {
    const [password, setPassword] = useState('')
    const [isVisible, setIsVisible] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (!password.trim()) {
            setError('Password is required')
            return
        }
        setError('')
        onConfirm(password)
    }

    const handleCancel = () => {
        setPassword('')
        setError('')
        onCancel()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && password.trim()) {
            handleConfirm()
        }
        if (e.key === 'Escape') {
            handleCancel()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm p-6 bg-white rounded-lg shadow-2xl dark:bg-slate-900"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/30">
                        <IconLock size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            Confirm Your Password
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            This action requires authentication
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    For security purposes, please enter your admin password to confirm this user update.
                </p>

                {/* Password Input */}
                <div className="relative mb-4">
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Admin Password
                    </label>
                    <div className="relative">
                        <input
                            type={isVisible ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            className={cn(
                                'w-full px-4 py-2.5 text-sm transition-all duration-300 rounded-lg border',
                                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                                'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100',
                                error
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:focus:ring-red-600/20'
                                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'
                            )}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            disabled={isLoading}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                        >
                            {isVisible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
                            'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            isLoading && 'flex items-center justify-center gap-2'
                        )}
                    >
                        {isLoading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Verifying...' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
