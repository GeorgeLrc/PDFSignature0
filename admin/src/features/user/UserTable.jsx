import Menus from "@/ui/Menus";
import Spinner from "@/ui/Spinner";
import Table from '@/ui/Table'
import UserRow from "./UserRow";
import useUserLists from './useUserLists'
import Pagination from "@/ui/Pagination";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import UserTableOperation from "./UserTableOperation";
import { motion } from "framer-motion";
import { IconUsers, IconMail, IconLock, IconCalendarStats, IconAdjustmentsHorizontal } from "@tabler/icons-react";

export default function UserTable() {
    const { userLists, usersLoading } = useUserLists()
    const [searchParams] = useSearchParams()

    const columns = [
        { label: 'Name & ID', width: '26%', icon: IconUsers, hint: 'Primary identity' },
        { label: 'Email Access', width: '22%', icon: IconMail, hint: 'Login address' },
        { label: 'Password Control', width: '18%', icon: IconLock, hint: 'Protected credentials' },
        { label: 'Created', width: '18%', icon: IconCalendarStats, hint: 'Join timeline' },
        { label: 'Status & Actions', width: '16%', icon: IconAdjustmentsHorizontal, hint: 'State & tools' },
    ]

    //? status
    const status = searchParams.get('status') ?? 'all'

    let filteredUsers;
    if (status === 'all') filteredUsers = userLists
    if (status === 'true') filteredUsers = userLists?.filter(user => user.isRestricted)
    if (status === 'false') filteredUsers = userLists?.filter(user => !user.isRestricted)

    //? sortby
    const sortBy = searchParams.get('sortBy') || 'start-asc'
    const [field, direction] = sortBy.split('-')
    const modifier = direction === 'asc' ? 1 : -1
    const sortedUsers = filteredUsers?.sort((a, b) => {
        if (typeof a[field] === 'number' && typeof b[field] === 'number') {
            return (a[field] - b[field]) * modifier;
        }
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
            return a[field].localeCompare(b[field]) * modifier;
        }
        return 0;
    });

    //? pagination
    const currentPage = !searchParams.get('page') ? 1 : Number(searchParams.get('page'))
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE
    const paginateUsers = sortedUsers?.slice(from, to)

    if (usersLoading) return (
        <div className="glass-card p-12 flex items-center justify-center">
            <Spinner />
        </div>
    )

    if (!userLists.length) return (
        <div className="glass-card p-12 text-center">
            <IconUsers size={48} className="mx-auto text-slate-400 mb-4" />
            <h1 className="text-xl font-semibold text-slate-600 dark:text-slate-400">No Users Found</h1>
            <p className="text-slate-500 dark:text-slate-500 mt-2">Start by creating your first user account.</p>
        </div>
    )

    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Table Header and Controls */}
            <div className="glass-card p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IconUsers size={24} className="text-blue-600" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Current Users ({filteredUsers?.length || 0})
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Manage and monitor user accounts
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <UserTableOperation />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <motion.div 
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="overflow-x-auto">
                    <Menus>
                        <Table>
                            <colgroup>
                                {columns.map(({ width, label }) => (
                                    <col key={label} style={{ width }} />
                                ))}
                            </colgroup>
                            <Table.Header>
                                <Table.Row className="bg-slate-50/70 dark:bg-slate-800/70">
                                    {columns.map(({ label, hint, icon: IconComponent }) => (
                                        <Table.Head key={label} className="align-middle">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                    <IconComponent size={16} className="text-blue-500" />
                                                    <span className="text-xs font-semibold tracking-[0.15em] uppercase">{label}</span>
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
                                                    {hint}
                                                </span>
                                            </div>
                                        </Table.Head>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body
                                data={paginateUsers}
                                render={(user, index) => (
                                    <UserRow key={user._id} user={user} animationDelay={index * 0.05} />
                                )}
                            />
                        </Table>
                    </Menus>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30">
                    <Pagination count={sortedUsers?.length || 0} />
                </div>
            </motion.div>
        </motion.div>
    )
}
