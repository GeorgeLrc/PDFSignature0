import { useEffect, useRef } from "react"

const useOutsideClick = (handler, listenCapturing = true) => {
    const ref = useRef(null)
    const ready = useRef(false)

    useEffect(() => {
        const handleClick = (e) => {
            if (!ready.current) {
                ready.current = true;
                return;
            }
            if (ref.current && !ref.current.contains(e.target)) {
                handler()
            }
        }

        document.addEventListener('click', handleClick, listenCapturing)
        return () => {
            document.removeEventListener('click', handleClick, listenCapturing)
            ready.current = false;
        }
    }, [handler, listenCapturing])

    return ref
}

export default useOutsideClick