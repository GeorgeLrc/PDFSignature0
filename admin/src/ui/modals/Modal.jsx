/* eslint-disable react/prop-types */
import { cloneElement, createContext, useContext, useState } from "react"
import { createPortal } from "react-dom";
import useOutsideClick from "@/hooks/useOutsideClick";

const ModalContext = createContext()

const Modal = ({ children }) => {
    const [openName, setOpenName] = useState('')
    const open = setOpenName
    const close = () => setOpenName('')
    return (
        <ModalContext.Provider value={{ openName, open, close }}>
            {children}
        </ModalContext.Provider>
    )
}

const Open = ({ children, opens: openWindowName }) => {
    const { open } = useContext(ModalContext)
    return cloneElement(children, { 
        onClick: (e) => {
            e.stopPropagation();
            open(openWindowName);
        }
    })
}

const Window = ({ children, name, width, padding = true }) => {
    const { openName, close } = useContext(ModalContext)
    const [isClosing, setIsClosing] = useState(false)

    const closeWithAnimation = () => {
        setIsClosing(true)
        setTimeout(() => {
            setIsClosing(false)
            close()
        }, 300)
    }

    const modalRef = useOutsideClick(() => {
        if (!isClosing) closeWithAnimation()
    })

    if (openName !== name && !isClosing) return null

    return createPortal(
        <div className={`fixed px-6 z-[100] inset-0 flex items-center bg-black/40 justify-center backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div
                ref={modalRef}
                style={width ? { width, maxWidth: '95vw' } : undefined}
                className={`${!width && 'w-96'} ${padding && 'p-6'} bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 transition-transform duration-300 text-slate-900 dark:text-slate-50 rounded-2xl shadow-2xl ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}
            >
                <div>
                    {cloneElement(children, { onCloseModal: closeWithAnimation })}
                </div>
            </div>
        </div>,
        document.body
    )
}

Modal.Open = Open
Modal.Window = Window

export default Modal
