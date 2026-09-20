import { create } from "zustand";

export const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null })
}))

export const useUserAccessStore = create((set) => ({
    userAccess: null,
    setUserAccess: (userAccess) => set({ userAccess }),
    clearUserAccess: () => set({ userAccess: null })
}))

export const useBookStore = create((set) => ({
    books: [],
    categories: [],
    setBooks: (books) => set({ books }),
    setCategories: (categories) => set({ categories }),
    clearBooks: () => set({ books: null }),
    clearCategories: () => set({ categories: null }),
}));


export const useCartStore = create((set) => ({
    carts: [],

    setCarts: (carts) => set({ carts }),

    incrementCartItem: (book, userid, newCount) => set((state) => ({
        carts: state.carts.map((item) => (
            item.bookId === book.id ? { ...item, userid: userid, count: newCount } : item
        ))
    })),

    decrementCartItem: (book, userid, newCount) => set((state) => ({
        carts: state.carts.map((item) => (
            item.bookId === book.id ? { ...item, userid: userid, count: newCount } : item
        ))
    })),

    customCartItem: (book, userid, count) => ((state) => ({
        carts: state.carts.map((item) => (
            item.bookId === book.id ? { ...item, userid: userid, count: count } : item
        ))
    })),

    clearCarts: () => set({ carts: null })
}))

export const useWishListStore = create((set) => ({
    wishlist: [],
    setWishlist: (wishlist) => set({ wishlist }),
    clearWishlist: () => set({ wishlist: [] })
}))

export const useOrderStore = create((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    clearOrders: () => set({ orders: [] })
}))