import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MenuItem {
  id: string;
  label: string;
  url: string;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string | null;
}

export interface KnowledgeBaseSettings {
  general: {
    title: string;
    description: string;
    logo: string;
    favicon: string;
  };
  theme: ThemeSettings;
  navigation: {
    menuItems: MenuItem[];
  };
  content: {
    pinnedArticles: string[];
    popularArticles: string[];
    showContactSupport: boolean;
    contactEmail: string;
    categoriesPerRow: number;
    showChangeLogs: boolean;
  };
}

interface CustomizeStore {
  settings: KnowledgeBaseSettings;
  updateGeneralSettings: (settings: Partial<KnowledgeBaseSettings["general"]>) => void;
  updateThemeSettings: (settings: Partial<KnowledgeBaseSettings["theme"]>) => void;
  updateNavigationSettings: (settings: Partial<KnowledgeBaseSettings["navigation"]>) => void;
  updateContentSettings: (settings: Partial<KnowledgeBaseSettings["content"]>) => void;
  updateSettings: (settings: KnowledgeBaseSettings) => void;
}

const defaultSettings: KnowledgeBaseSettings = {
  general: {
    title: "Knowledge Base",
    description: "Find answers to your questions",
    logo: "",
    favicon: "",
  },
  theme: {
    primaryColor: "#0091FF",
    accentColor: "#00C2FF",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: null,
  },
  navigation: {
    menuItems: [],
  },
  content: {
    pinnedArticles: [],
    popularArticles: [],
    showContactSupport: true,
    contactEmail: "",
    categoriesPerRow: 3,
    showChangeLogs: false,
  },
};

export const useCustomizeStore = create<CustomizeStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateGeneralSettings: (generalSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...generalSettings },
          },
        })),
      updateThemeSettings: (themeSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, ...themeSettings },
          },
        })),
      updateNavigationSettings: (navigationSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            navigation: { ...state.settings.navigation, ...navigationSettings },
          },
        })),
      updateContentSettings: (contentSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            content: { ...state.settings.content, ...contentSettings },
          },
        })),
      updateSettings: (settings) => set({ settings }),
    }),
    {
      name: "knowledge-base-settings",
    }
  )
);