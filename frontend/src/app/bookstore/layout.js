"use client"
import { useQuery } from "@tanstack/react-query";
import SideBar from "./components/SideBar";
import TopNavBar from "./components/TopNavBar";
import { getCurrentUser } from "../components/utils/userUtils";
import { useEffect, useState } from "react";
import { useBookStore, useCartItemsStore, useUserStore } from "../hooks/useStore";
import { useAppContext } from "../components/common/AppContext";
import { showInfo } from "../components/utils/showToasts";
import { getAllCarts } from "../components/utils/cartUtils";
import { getAllBooks } from "../components/utils/bookUtils";

export default function BookStoreLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { user, setUser, clearUser } = useUserStore();
    const { router } = useAppContext();
    const { cartItems, setCartItems } = useCartItemsStore();
    const { setBooks, setCategories } = useBookStore();

    const { data: userData, isPending: userPending, isSuccess: userSuccess, isError: userError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        select: (response) => response?.data,
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


    const { data: cartData, isPending: cartPending, isSuccess: cartSuccess, isError: cartError } = useQuery({
        queryKey: ["allCarts", user?.id],
        queryFn: () => getAllCarts(user?.id),
        select: (response) => response?.data,
        enabled: !!user?.id
    })

    const { data: bookData, isPending: bookPending, isSuccess: bookSuccess, isError: bookError } = useQuery({
        queryKey: ["allBooks"],
        queryFn: () => getAllBooks(cartItems),
        select: (response) => response?.data,
        enabled: cartSuccess && cartItems !== undefined,
    });

    useEffect(() => {
        if (cartPending) return;
        if (cartSuccess && cartData?.success && cartData?.data) {
            console.log("cartdate:", cartData);
            setCartItems(cartData?.data.books);
        }
    }, [cartData, cartPending, cartSuccess, cartError, router]);

    useEffect(() => {
        if (bookPending || cartPending) return;
        if (bookSuccess && bookData?.success && bookData?.data) {
            setBooks(bookData?.data.books);
            setCategories(bookData?.data.category);
            return;
        }
    }, [bookData, bookPending, bookSuccess, bookError, router])


    if (userPending && !user) {
        return <div>...Loading</div>
    }

    if (bookPending || cartPending) {
        return <div>...Loading</div>
    }

    if (userError || !userData?.success || !userData?.data) {
        return null;
    }

    if (bookError || !bookData?.success || !bookData?.data ||
        cartError || !cartData?.success || !cartData?.data
    ) {
        return null;
    }

    return (
        <div className={`grid ${sidebarOpen ? "grid-cols-[0.15fr_1fr]" : "grid-cols-[60px_1fr"} grid-rows-[0.1fr_1fr] py-2 px-1.5 gap-1 h-screen w-screen bg-gray-400`}>
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