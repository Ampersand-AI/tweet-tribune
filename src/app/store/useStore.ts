import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  isAuthenticated: boolean;
  user: any | null;
  setUser: (user: any) => void;
  logout: () => void;
}

interface SocialState {
  twitter: {
    isConnected: boolean;
    profile: any | null;
  };
  linkedin: {
    isConnected: boolean;
    profile: any | null;
  };
  setTwitterConnection: (isConnected: boolean, profile: any) => void;
  setLinkedInConnection: (isConnected: boolean, profile: any) => void;
}

interface ContentState {
  scheduledPosts: any[];
  generatedPosts: any[];
  addScheduledPost: (post: any) => void;
  removeScheduledPost: (id: string) => void;
  updateScheduledPost: (id: string, post: any) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      twitter: {
        isConnected: false,
        profile: null,
      },
      linkedin: {
        isConnected: false,
        profile: null,
      },
      setTwitterConnection: (isConnected, profile) =>
        set({ twitter: { isConnected, profile } }),
      setLinkedInConnection: (isConnected, profile) =>
        set({ linkedin: { isConnected, profile } }),
    }),
    {
      name: 'social-storage',
    }
  )
);

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      scheduledPosts: [],
      generatedPosts: [],
      addScheduledPost: (post) =>
        set((state) => ({
          scheduledPosts: [...state.scheduledPosts, post],
        })),
      removeScheduledPost: (id) =>
        set((state) => ({
          scheduledPosts: state.scheduledPosts.filter((post) => post.id !== id),
        })),
      updateScheduledPost: (id, updatedPost) =>
        set((state) => ({
          scheduledPosts: state.scheduledPosts.map((post) =>
            post.id === id ? updatedPost : post
          ),
        })),
    }),
    {
      name: 'content-storage',
    }
  )
); 