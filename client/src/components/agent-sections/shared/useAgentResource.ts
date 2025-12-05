import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UseAgentResourceOptions<T, TCreate> {
  agentId: string;
  resourceKey: string;
  resourceName: string;
  resourceNamePlural?: string;
}

interface UseAgentResourceReturn<T, TCreate> {
  items: T[] | undefined;
  isLoading: boolean;
  create: (data: TCreate) => void;
  remove: (id: string) => void;
  isCreating: boolean;
  isDeleting: boolean;
}

export function useAgentResource<T, TCreate>({
  agentId,
  resourceKey,
  resourceName,
  resourceNamePlural,
}: UseAgentResourceOptions<T, TCreate>): UseAgentResourceReturn<T, TCreate> {
  const { toast } = useToast();
  const pluralName = resourceNamePlural || `${resourceName}s`;

  const queryKey = ["/api/agents", agentId, resourceKey];

  const { data: items, isLoading } = useQuery<T[]>({
    queryKey,
    enabled: !!agentId,
  });

  const createMutation = useMutation({
    mutationFn: (data: TCreate) =>
      apiRequest("POST", `/api/agents/${agentId}/${resourceKey}`, {
        ...data,
        agent_id: agentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: `${resourceName} added`,
        description: `New ${resourceName.toLowerCase()} has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${resourceName.toLowerCase()}.`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/${resourceKey}/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: `${resourceName} deleted`,
        description: `${resourceName} has been removed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${resourceName.toLowerCase()}.`,
        variant: "destructive",
      });
    },
  });

  return {
    items,
    isLoading,
    create: createMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
