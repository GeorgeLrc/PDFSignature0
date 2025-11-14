import { useQuery } from "@tanstack/react-query"
import { getAllTemplates } from "@/services/apiTemplates"

const useAllTemplates = () => {
    const { data: templates, isPending: templatesLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: getAllTemplates
    })

    return { templates, templatesLoading }
}

export default useAllTemplates