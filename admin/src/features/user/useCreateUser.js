import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createNewUser } from "@/services/apiUsers"
import toast from "react-hot-toast"

const useCreateUser = () => {
    const queryClient = useQueryClient()

    const { mutate: createUser, isPending: isCreating } = useMutation({
        mutationFn: createNewUser,
        onSuccess: () => {
            toast.success("User created successfully")
            queryClient.invalidateQueries({ queryKey: ['user-lists'] })
        },
        onError: () => {
            toast.error("Failed to create user")
        }
    })

    return { createUser, isCreating }
}

export default useCreateUser