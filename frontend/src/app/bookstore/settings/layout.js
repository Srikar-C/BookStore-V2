"use client"
import { useQueryClient } from "@tanstack/react-query";
import SettingsAside from "../components/SettingsAside";
import { useUserStore } from "@/app/hooks/useStore";

export default function SettingsLayout({ children }) {

    const { user } = useUserStore();
    const queryClient = useQueryClient();

    queryClient.invalidateQueries({
        queryKey: ["wishlist", user?.id]
    })

    return (
        <div className="grid grid-cols-[0.3fr_1fr] gap-3 p-4 overflow-hidden w-full h-full bg-(--background) rounded-xl">
            <div className="h-full"><SettingsAside /></div>
            <div className="h-full overflow-y-auto">{children}</div>
        </div>
    )
}