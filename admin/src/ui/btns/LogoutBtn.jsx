import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom"

export default function LogoutBtn() {
    const { dispatch } = useAuth();
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onHandleLogout = async () => {
        setIsLoggingOut(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch({ type: 'auth/logout' });
        navigate('/login', { replace: true });
        setIsLoggingOut(false);
    };
    return (
        <button
            disabled={isLoggingOut}
            type="button"
            onClick={onHandleLogout}
            className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white rounded-full disabled:cursor-not-allowed bg-primary">
            {
                isLoggingOut ?
                    <>
                        <svg className="text-white size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Logging out...</span>
                    </>
                    : 'Logout'
            }
        </button>
    )
}
