import defaultImage from '@/assets/default.jpg';
import LogoutBtn from '../btns/LogoutBtn'
import useAuth from '@/hooks/useAuth'
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

export default function ProfileModal() {
    const { accessToken } = useAuth()
    const user = useSelector(store => store.user.user)

    if (!accessToken) return null

    const decoded = jwtDecode(accessToken)
    const expTime = decoded.exp
    const currentTime = Math.floor(Date.now() / 1000)

    return (
        <>
            <div className="py-10 text-sm font-medium text-center text-white bg-indigo-500 rounded-t-md">
                doitung.org.ac.th
            </div>
            <div className="flex flex-col items-center p-5 bg-white rounded-b-md dark:bg-slate-900">
                <img
                    src={user.image || defaultImage}
                    alt="Profile"
                    className="object-cover w-16 h-16 -mt-12 border-2 border-white rounded-full shadow-md"
                />
                <h2 className="mt-3 text-lg font-semibold dark:text-white">{user.first_name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                </p>
                <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                    Session expires in {Math.floor((expTime - currentTime) / 3600)} hours
                </p>
                <LogoutBtn />
            </div>
        </>
    )
}
