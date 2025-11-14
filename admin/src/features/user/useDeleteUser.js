import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUser as deleteUserApi } from "@/services/apiUsers"
import useAuth from "@/hooks/useAuth"
import toast from "react-hot-toast"

const useDeleteUser = () => {
    const queryClient = useQueryClient()
    const { accessToken } = useAuth()

    const { mutate: deleteUser, isPending: isDeleting } = useMutation({
        mutationFn: (userId) => deleteUserApi({ accessToken, userId }),
        onSuccess: (message) => {
            toast.success(message)
            queryClient.invalidateQueries(["user-lists"])
        },
        onError: () => {
            toast.error("Failed to delete user")
        }
    })

    return { deleteUser, isDeleting }
}

export default useDeleteUser