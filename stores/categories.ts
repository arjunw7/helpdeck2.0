import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "@/lib/api/categories";

interface CategoriesState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "tile" | "table";
  setViewMode: (mode: "tile" | "table") => void;
  accessibilityFilter: string;
  setAccessibilityFilter: (accessibility: string) => void;
  showCategoryModal: boolean;
  setShowCategoryModal: (show: boolean) => void;
  filteredCategories: (categories: Category[]) => Category[];
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      viewMode: "tile",
      setViewMode: (mode) => set({ viewMode: mode }),
      accessibilityFilter: "all",
      setAccessibilityFilter: (accessibility) => set({ accessibilityFilter: accessibility }),
      showCategoryModal: false,
      setShowCategoryModal: (show) => set({ showCategoryModal: show }),
      filteredCategories: (categories) => {
        const { searchQuery, accessibilityFilter } = get();
        return categories.filter((category) => {
          const matchesSearch = category.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesAccessibility =
            accessibilityFilter === "all" || category.accessibility === accessibilityFilter;
          return matchesSearch && matchesAccessibility;
        });
      },
    }),
    {
      name: "categories-storage",
    }
  )
);