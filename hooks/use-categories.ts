import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory } from "@/lib/api/categories";
import { toast } from "sonner";

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}