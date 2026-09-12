"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { clearCart } from "@/app/components/utils/cartUtils";
import { showWarning } from "@/app/components/utils/showToasts";
import { useBookStore, useCartStore, useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react"
import { FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

export default function TopNavBar() {

    const [searchText, setSearchText] = useState("");
    const pathName = usePathname();
    const { router } = useAppContext();
    const { carts } = useCartStore();
    const { books } = useBookStore();
    const { user } = useUserStore();
    const queryClient = useQueryClient();

    const cartBooks = carts?.filter((item) => item.count)
        .map((item) => {
            const book = books?.find((b) => b.id === item.bookId);

            return {
                ...book,
                count: item.count
            };
        })

    const validBooks = cartBooks?.filter((book) => book.quantity >= book.count);
    const invalidBooks = cartBooks?.filter((book) => book.quantity < book.count);

    function handleCheckout() {
        if (validBooks.length <= 0) {
            showWarning("No Books in Cart");
            return;
        }
        if (invalidBooks.length > 0) {
            showWarning("Invalid Books, please update");
            return;
        }
        router.push("/bookstore/deliveryDtls");
    }

    const { mutate, isPending } = useMutation({
        mutationFn: clearCart,
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({
                queryKey: ["allCarts", user?.id]
            })
        },
        onError: (error) => {
            console.log(error);
        }
    })

    function handleClearCart() {
        mutate();
    }

    return (
        <div className="top flex items-center gap-3 justify-between bg-(--background) px-5 py-2 w-full rounded-lg h-[8vh]">
            <div className="left">
                <h2 className="text-xl font-semibold">Welcome Back!</h2>
            </div>
            <div className="right flex gap-6 mr-10">
                <div className="flex gap-2 items-center justify-between px-3 py-1 w-75 shadow-md bg-(--section-hover) rounded-xl" >
                    <FaSearch className="text-lg" />
                    <input type="search"
                        className="text-sm px-2 py-1 w-full border-none outline-none"
                        placeholder="Search By Title and Enter" />
                    {/* <RxCross2 className={`text-xl cursor-pointer ${searchText.length > 0 ? "opacity-100" : "opacity-0"}`} /> */}
                </div>
                {pathName == "/bookstore/carts" && <button type="submit"
                    className="text-white flex items-center font-semibold px-4 rounded-xl bg-green-500 cursor-pointer"
                    onClick={handleCheckout}>
                    Checkout</button>}
                {pathName == "/bookstore/carts" && <button type="submit"
                    className="text-white flex items-center font-semibold px-4 rounded-xl bg-red-500 cursor-pointer"
                    onClick={handleClearCart}>Clear Cart</button>}
            </div>
        </div>
    )
}