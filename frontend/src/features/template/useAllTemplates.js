import { useQuery } from "@tanstack/react-query";
import { getAllTemplates } from "@/services/apiTemplates";
import useAuth from "@/hooks/useAuth";

const useAllTemplates = () => {
  const { accessToken } = useAuth();

  const { data: publicTemplates, isPending: templatesLoading } = useQuery({
    queryKey: ["publicTemplates"],
    queryFn: () => getAllTemplates({ accessToken }),
    enabled: !!accessToken,
  });

  return { publicTemplates, templatesLoading };
};

export default useAllTemplates;
