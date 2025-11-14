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
    return cloneElement(children, { onClick: () => open(openWindowName) })
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
        <div className={`fixed px-6 z-[100] inset-0 flex items-center bg-black justify-center drop-shadow-lg bg-opacity-50 backdrop-blur-xs transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div ref={modalRef} className={`${width ? `md:w-[600px] w-[${width}]` : 'w-96'} ${padding && 'p-6'} bg-slate-50 dark:bg-slate-900 dark:border-slate-700 border transition-transform duration-300 dark:text-slate-50 rounded-lg shadow-lg ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}>
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
