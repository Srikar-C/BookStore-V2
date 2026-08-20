import { create } from "zustand";

export const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null })
}))

export const useBookStore = create((set) => ({
    books: [],
    categories: [],
    setBooks: (books) => set({ books }),
    setCategories: (categories) => set({ categories })
}));

export const useCartItemsStore = create((set) => ({
    cartItems: [],

    setCartItems: (cartItems) => set({ cartItems }),

    incrementCartItem: (book, userid) => set((state) => ({
        cartItems: state.cartItems.map((item) => (
            item.bookId === book.id ? { ...item, userid: userid, count: item.count + 1 } : item
        ))
    })),

    decrementCartItem: (book, userid) => set((state) => ({
        cartItems: state.cartItems.map((item) => (
            item.bookId === book.id ? { ...item, userid: userid, count: item.count - 1 } : item
        ))
    })),
}))