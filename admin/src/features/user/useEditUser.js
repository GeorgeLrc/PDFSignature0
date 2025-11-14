import { useMutation, useQueryClient } from "@tanstack/react-query"
import useAuth from "@/hooks/useAuth"
import { editUser as editUserApi } from "@/services/apiUsers"
import toast from "react-hot-toast"

const useEditUser = () => {
    const queryClient = useQueryClient()
    const { accessToken } = useAuth()

    const { mutate: editUser, isPending: isEditing } = useMutation({
        mutationFn: ({ userId, userData }) => editUserApi({ accessToken, userId, userData }),
        onSuccess: () => {
            toast.success("User edited successfully")
            queryClient.invalidateQueries({ queryKey: ['user-lists'] })
        },
        onError: () => [
            toast.error("Failed to edit user")
        ]
    })

    return { editUser, isEditing }
}

export default useEditUser