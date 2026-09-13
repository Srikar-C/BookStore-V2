"use client"
import { useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    const router = useRouter();
    const [cartId, setCartId] = useState("");
    const [mode, setMode] = useState("");
    const [selectedcategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("quantity,desc");

    return (
        <AppContext.Provider value={{ router, cartId, setCartId, mode, setMode, selectedcategory, setSelectedCategory, search, setSearch, sortBy, setSortBy }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext);
}