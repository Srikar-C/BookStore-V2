"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SideBar from "./components/SideBar";
import TopNavBar from "./components/TopNavBar";
import { getCurrentUser } from "../components/utils/userUtils";
import { useEffect, useState } from "react";
import { useBookStore, useCartStore, useOrderStore, useUserAccessStore, useUserStore, useWishListStore } from "../hooks/useStore";
import { useAppContext } from "../hooks/AppContext";
import { getAllCarts } from "../components/utils/cartUtils";
import { getAllBooks } from "../components/utils/bookUtils";
import { getAccessDtls, getWishlist } from "../components/utils/commonUtils";
import BookStoreSkeleton from "../components/skeletons/BookStoreSkeleton";
import { getAllOrders } from "../components/utils/orderUtils";

export default function BookStoreLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { user, setUser, clearUser } = useUserStore();
    const { router, setCartId } = useAppContext();
    const { setCarts, clearCarts } = useCartStore();
    const { setBooks, clearBooks, setCategories, clearCategories } = useBookStore();
    const { setWishlist, clearWishlist } = useWishListStore();
    const { setUserAccess } = useUserAccessStore();
    const queryClient = useQueryClient();

    const { data: userData, isPending: userPending, isSuccess: userSuccess, isError: userError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        select: (response) => response?.data,
        refetchInterval: 5 * 60 * 1000,
        refetchIntervalInBackground: true,
    });

    useEffect(() => {
        if (userPending) return;
        if (userSuccess && userData?.success && userData?.data) {
            setUser(userData?.data);
            return;
        }
        else if (userError || (!userSuccess || !userData?.success)) {
            queryClient.clear();
            clearUser();
            clearBooks();
            clearCarts();
            clearCategories();
            clearWishlist();
            localStorage.clear();
            sessionStorage.clear();
            router.replace("/user/login");
        }
    }, [userData, userPending, userSuccess, userError, router])

    const { data: bookData, isPending: bookPending, isSuccess: bookSuccess } = useQuery({
        queryKey: ["allBooks"],
        queryFn: getAllBooks,
        select: (response) => response?.data,
        enabled: !!user?.id
    });

    useEffect(() => {
        if (bookPending) return;
        if (bookSuccess && bookData?.success && bookData?.data) {
            setBooks(bookData?.data.books);
            setCategories(bookData?.data.category);
            return;
        }
    }, [bookData, bookSuccess, setBooks, setCategories])

    const { data: cartData, isPending: cartPending, isSuccess: cartSuccess } = useQuery({
        queryKey: ["allCarts", user?.id],
        queryFn: getAllCarts,
        select: (response) => response?.data,
        enabled: !!user?.id
    })

    useEffect(() => {
        if (cartPending) return;
        if (cartSuccess && cartData?.success) {
            if (cartData.data) {
                setCarts(cartData.data.books ?? []);
                setCartId(cartData.data._id);
            } else {
                setCarts([]);
                setCartId(null);
            }
        }
    }, [cartData, cartSuccess, setCarts, setCartId]);

    const { data: wishlistData, isPending: wishlistPending, isSuccess: wishlistSuccess, isError: wishlistError } = useQuery({
        queryKey: ["wishlist", user?.id],
        queryFn: getWishlist,
        select: (response) => response?.data,
        enabled: !!user?.id
    })

    useEffect(() => {
        if (wishlistPending) return;
        if (wishlistSuccess && wishlistData?.success) {
            setWishlist(wishlistData?.data);
        }
    }, [wishlistData, wishlistSuccess, setWishlist]);

    const { data: accessData, isPending: accessPending, isSuccess: accessSuccess } = useQuery({
        queryKey: ["accessPrvilige", user?.id],
        queryFn: getAccessDtls,
        select: (response) => response?.data,
        enabled: !!user?.id
    })

    useEffect(() => {
        if (accessPending) return;
        if (accessSuccess && accessData?.success) {
            setUserAccess(accessData?.data);
        }
    }, [accessData, accessSuccess, setUserAccess]);

    if (userPending && !user) {
        return <BookStoreSkeleton />
    }

    // if (bookPending || cartPending) {
    //     return <div>...Loading</div>
    // }

    if (userError || !userData?.success || !userData?.data) {
        return <div>...Loading</div>;
    }

    if (
        // bookError || !bookData?.success || !bookData?.data ||
        // cartError || !cartData?.success ||
        wishlistError || !wishlistData?.success
    ) {
        return null;
    }


    return (
        <div className={`grid ${sidebarOpen ? "grid-cols-[0.15fr_1fr]" : "grid-cols-[0.5fr_1fr"} grid-rows-[0.05fr_1fr] py-2 px-1.5 gap-1 h-screen w-screen bg-gray-400`}>
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