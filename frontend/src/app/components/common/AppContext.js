"use client"
import { useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    const router = useRouter();

    return (
        <AppContext.Provider value={{ router }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext);
}