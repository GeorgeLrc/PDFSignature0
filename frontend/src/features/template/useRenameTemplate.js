import { useMutation, useQueryClient } from "@tanstack/react-query"
import { renameTemplate as renameTemplateApi } from "@/services/apiTemplates"
import useAuth from '@/hooks/useAuth'
import toast from "react-hot-toast"

const useRenameTemplate = () => {
    const { accessToken } = useAuth()
    const queryClient = useQueryClient()

    const { mutate: renameTemplate, isPending: isRenaming } = useMutation({
        mutationFn: ({ templateId, newTitle }) => renameTemplateApi({ accessToken, templateId, newTitle }),
        onSuccess: (message) => {
            toast.success(message)
            queryClient.invalidateQueries({ queryKey: ['templates'] })
        },
        onError: () => {
            toast.error('Something went wrong with renaming template.')
        }
    })

    return { renameTemplate, isRenaming }
}

export default useRenameTemplate