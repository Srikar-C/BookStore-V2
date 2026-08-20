"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./AppContext";
import { useState } from "react";

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                {children}
            </AppProvider>
        </QueryClientProvider>
    )
}