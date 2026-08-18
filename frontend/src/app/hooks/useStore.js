import { create } from "zustand";

export const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null })
}))

export const useBookStore = create((set) => ({
    books: [],
    setBooks: (books) => set({ books }),
}))