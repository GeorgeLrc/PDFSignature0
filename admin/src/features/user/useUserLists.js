import { useQuery } from "@tanstack/react-query"
import { getUserLists } from "@/services/apiUsers"
import useAuth from "@/hooks/useAuth"

const useUserLists = () => {
    const { accessToken } = useAuth()

    const { data: userLists, isPending: usersLoading } = useQuery({
        queryKey: ['user-lists'],
        queryFn: () => getUserLists(accessToken),
    })


    return { userLists, usersLoading }
}

export default useUserLists