"use client"
import { useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    const router = useRouter();
    const [cartId, setCartId] = useState("");
    const [mode, setMode] = useState("");

    return (
        <AppContext.Provider value={{ router, cartId, setCartId, mode, setMode }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext);
}