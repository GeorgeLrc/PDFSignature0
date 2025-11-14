import { useQuery } from "@tanstack/react-query";
import { getUserTemplates } from "@/services/apiTemplates";
import useAuth from "@/hooks/useAuth";

const useUserTemplates = () => {
  const { accessToken } = useAuth();

  const { data: templates, isPending: templatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => getUserTemplates({ accessToken }),
    enabled: !!accessToken,
  });

  return { templates, templatesLoading };
};

export default useUserTemplates;
