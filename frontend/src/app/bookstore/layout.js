"use client"
import { useQuery } from "@tanstack/react-query";
import SideBar from "./components/SideBar";
import TopNavBar from "./components/TopNavBar";
import { getCurrentUser } from "../components/utils/userUtils";
import { useEffect, useState } from "react";
import { useUserStore } from "../hooks/useStore";
import { useAppContext } from "../components/common/AppContext";
import { showInfo } from "../components/utils/showToasts";

export default function BookStoreLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { setUser, clearUser } = useUserStore();
    const { router } = useAppContext();

    const { data: userData, isPending: userPending, isSuccess: userSuccess, isError: userError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        select: (response) => response?.data,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (userPending) return;
        if (userSuccess && userData?.success && userData?.data) {
            setUser(userData?.data);
            return;
        }
        else if (userError || (!userSuccess || !userData?.success)) {
            clearUser();
            showInfo("Session expired, Please Login");
            router.replace("/user/login");
        }
    }, [userData, userPending, userSuccess, userError, router])

    if (userPending) {
        return <div>...Loading</div>
    }

    if (userError || !userData?.success || !userData?.data) {
        return null;
    }

    return (
        <div className={`grid ${sidebarOpen ? "grid-cols-[0.15fr_1fr]" : "grid-cols-[60px_1fr"} grid-rows-[0.1fr_1fr] py-2 px-1.5 gap-2 h-screen w-screen bg-gray-400`}>
            <aside className="row-span-2">
                <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </aside>

            <header className="flex items-center">
                <TopNavBar />
            </header>

            <main className="overflow-auto h-full">
                {children}
            </main>
        </div>
    )
}