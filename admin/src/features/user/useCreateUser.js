import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createNewUser } from "@/services/apiUsers"
import toast from "react-hot-toast"

const useCreateUser = () => {
    const queryClient = useQueryClient()

    const { mutate: createUser, isPending: isCreating } = useMutation({
        mutationFn: createNewUser,
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: ['user-lists'] });
        },
        onError: (error) => {
            const backendMsg = error?.response?.data?.message || "Failed to create user";
            toast.error(backendMsg);
        }
    });

    return { createUser, isCreating }
}

export default useCreateUser