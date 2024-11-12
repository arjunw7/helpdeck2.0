"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSubscribers, createSubscriber, updateSubscriber, importSubscribers } from "@/lib/api/subscribers";
import { toast } from "sonner";

export function useSubscribers() {
  const queryClient = useQueryClient();

  const {
    data: subscribers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscribers"],
    queryFn: getSubscribers,
  });

  const createMutation = useMutation({
    mutationFn: createSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast.success("Subscriber added successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add subscriber");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSubscriber>[1] }) =>
      updateSubscriber(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast.success("Subscriber updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update subscriber");
    },
  });

  const importMutation = useMutation({
    mutationFn: importSubscribers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      toast.success(`${data.length} subscribers imported successfully`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to import subscribers");
    },
  });

  return {
    subscribers,
    isLoading,
    error,
    createSubscriber: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSubscriber: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    importSubscribers: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
  };
}