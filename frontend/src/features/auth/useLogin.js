import { useMutation } from "@tanstack/react-query"
import { logInUser as logInUserApi } from '@/services/apiAuth'
import toast from "react-hot-toast"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useDispatch } from 'react-redux';
import { setUser } from '@/features/user/userSlice'

const useLogin = () => {
    const { dispatch: authDispatch } = useAuth()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { mutate: logInUser, isPending: isLoggingIn } = useMutation({
        mutationFn: ({ email, password }) => logInUserApi({ email, password }),
        onSuccess: (data) => {
            console.log(data)
            toast.success('Logged in successfully.')
            dispatch(setUser(data.user))
            localStorage.setItem('accessToken', data.accessToken)
            authDispatch({ type: 'auth/login', payload: data.accessToken })
            navigate('/', { replace: true })
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        }
    })

    return { logInUser, isLoggingIn }
}

export default useLogin