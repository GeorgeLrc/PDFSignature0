/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react"
import { createPortal } from "react-dom";
import { IconDots } from "@tabler/icons-react";
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

    return <button className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm" onClick={handleClick}>
        <IconDots size={18} className="text-slate-600 dark:text-slate-400" />
    </button>
}

const List = ({ id, children }) => {
    const { openId, position, close } = useContext(MenuContext)
    const ref = useOutsideClick(close, false)

    if (openId !== id) return null

    return createPortal(
        <ul
            className="fixed z-50 min-w-[160px] p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl"
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

    const handleClick = (event) => {
        event.stopPropagation()
        onClick?.(event)
        close()
    }

    return <li>
        <button className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 hover:text-primary dark:hover:text-primary" onClick={handleClick}>
            {icon}
            <span>{children}</span>
        </button>
    </li>
}

// Menus.Menu = Menu
Menus.Toggle = Toggle
Menus.List = List
Menus.Button = Button
