"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getArticles, createArticle, getArticle, updateArticle } from "@/lib/api/articles";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useArticles() {
  const queryClient = useQueryClient();

  const {
    data: articles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["articles"],
    queryFn: getArticles,
  });

  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create article");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateArticle>[1] }) =>
      updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update article");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    },
  });

  return {
    articles,
    isLoading,
    error,
    createArticle: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateArticle: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteArticle: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    getArticle,
  };
}