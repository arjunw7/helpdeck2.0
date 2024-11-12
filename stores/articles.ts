import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Article } from "@/lib/api/articles";

type ViewMode = "tile" | "table";

interface ArticlesState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredArticles: (articles: Article[]) => Article[];
}

export const useArticlesStore = create<ArticlesState>()(
  persist(
    (set, get) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      viewMode: "tile",
      setViewMode: (mode) => set({ viewMode: mode }),
      statusFilter: "all",
      setStatusFilter: (status) => set({ statusFilter: status }),
      filteredArticles: (articles) => {
        const { searchQuery, statusFilter } = get();
        return articles.filter((article) => {
          const matchesSearch = article.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesStatus =
            statusFilter === "all" || article.status === statusFilter;
          return matchesSearch && matchesStatus;
        });
      },
    }),
    {
      name: "articles-storage",
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);