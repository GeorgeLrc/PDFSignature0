import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleUserStatus } from "@/services/apiUsers"
import toast from "react-hot-toast"
import useAuth from "@/hooks/useAuth"

const useToggleStatus = () => {
    const { accessToken } = useAuth()
    const queryClient = useQueryClient()

    const { mutate: mutateStatus, isPending: isToggling } = useMutation({
        mutationFn: (userId) => toggleUserStatus({ accessToken, userId }),
        onSuccess: (message) => {
            toast.success(message)
            queryClient.invalidateQueries({ queryKey: ['user-lists'] })
        },
        onError: () => {
            toast.error("Failed to update user status")
        }
    })

    const toggleStatus = (userId, options = {}) => {
        return mutateStatus(userId, {
            onSuccess: (...args) => {
                options?.onSuccess?.(...args);
            },
            onError: (...args) => {
                options?.onError?.(...args);
            }
        });
    };

    return { toggleStatus, isToggling }
}

export default useToggleStatus