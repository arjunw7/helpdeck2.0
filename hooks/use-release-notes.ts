"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReleaseNotes, createReleaseNote, getReleaseNote, updateReleaseNote } from "@/lib/api/release-notes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useReleaseNotes() {
  const queryClient = useQueryClient();

  const {
    data: releaseNotes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["release-notes"],
    queryFn: getReleaseNotes,
  });

  const createMutation = useMutation({
    mutationFn: createReleaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes"] });
      toast.success("Release note created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create release note");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateReleaseNote>[1] }) =>
      updateReleaseNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes"] });
      toast.success("Release note updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update release note");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("release_notes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes"] });
      toast.success("Release note deleted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete release note");
    },
  });

  return {
    releaseNotes,
    isLoading,
    error,
    createReleaseNote: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReleaseNote: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReleaseNote: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    getReleaseNote,
  };
}