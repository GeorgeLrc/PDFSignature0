import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTemplate as deleteTemplateApi } from "@/services/apiTemplates"
import useAuth from '@/hooks/useAuth'
import toast from "react-hot-toast"

const useDeleteTemplate = () => {
    const { accessToken } = useAuth()
    const queryClient = useQueryClient()

    const { mutate: deleteTemplate, isPending: isDeleting } = useMutation({
        mutationFn: (templateId) => deleteTemplateApi({ accessToken, templateId }),
        onSuccess: (message) => {
            toast.success(message)
            queryClient.invalidateQueries({ queryKey: ['templates'] })
        },
        onError: () => {
            toast.error('Something went wrong with deleting template.')
        }
    })

    return { deleteTemplate, isDeleting }
}

export default useDeleteTemplate