/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react"
import { createPortal } from "react-dom";
import { HiEllipsisVertical } from "react-icons/hi2";
import useOutsideClick from '@/hooks/useOutsideClick'

const MenuContext = createContext()

export default function Menus({ children }) {
    const [openId, setOpenId] = useState('')
    const [position, setPosition] = useState(null)

    const open = setOpenId
    const close = () => setOpenId('')

    return (
        <MenuContext.Provider value={{ openId, close, open, position, setPosition }}>
            {children}
        </MenuContext.Provider>
    )
}

const Toggle = ({ id }) => {
    const { openId, close, open, setPosition } = useContext(MenuContext)

    const handleClick = (e) => {
        //!
        e.stopPropagation()
        const rect = e.target.closest('button').getBoundingClientRect()
        setPosition({
            x: window.innerWidth - rect.width - rect.x,
            y: rect.y + rect.height + 8
        })

        openId === '' || openId !== id ? open(id) : close()
    }

    return <button className="toggle-btn" onClick={handleClick}>
        <HiEllipsisVertical className="w-6 h-6" />
    </button>
}

const List = ({ id, children }) => {
    const { openId, position, close } = useContext(MenuContext)
    const ref = useOutsideClick(close, false)

    if (openId !== id) return null

    return createPortal(
        <ul
            className="fixed z-50 border rounded-md shadow-md bg-slate-50 border-slate-300 dark:bg-slate-900 dark:border-slate-700"
            style={{
                top: position?.y,
                right: position?.x,
                position: 'fixed',
            }}
            ref={ref}
        >
            {children}
        </ul>,
        document.body
    )
}

const Button = ({ icon, children, onClick }) => {
    const { close } = useContext(MenuContext)

    const handleClick = () => {
        onClick?.()
        close()
    }

    return <li>
        <button className="flex items-center w-full gap-2 px-4 py-1 text-sm transition-all duration-200 border-none dark:text-slate-50 hover:rounded-md bg-none dark:hover:bg-slate-600 hover:bg-gray-100 " onClick={handleClick}>
            {icon}
            <span>{children}</span>
        </button>
    </li>
}

// Menus.Menu = Menu
Menus.Toggle = Toggle
Menus.List = List
Menus.Button = Button
