import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReleaseNote } from "@/lib/api/release-notes";

interface ReleaseNotesState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  filteredReleaseNotes: (notes: ReleaseNote[]) => ReleaseNote[];
}

export const useReleaseNotesStore = create<ReleaseNotesState>()(
  persist(
    (set, get) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      typeFilter: "all",
      setTypeFilter: (type) => set({ typeFilter: type }),
      filteredReleaseNotes: (notes) => {
        const { searchQuery, typeFilter } = get();
        return notes.filter((note) => {
          const matchesSearch = 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.version.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType =
            typeFilter === "all" || 
            (Array.isArray(note.type) && note.type.includes(typeFilter));
          return matchesSearch && matchesType;
        });
      },
    }),
    {
      name: "release-notes-storage",
    }
  )
);