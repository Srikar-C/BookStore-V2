"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { clearCart } from "@/app/components/utils/cartUtils";
import { showWarning } from "@/app/components/utils/showToasts";
import { useBookStore, useCartStore, useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react"
import { FaArrowDown, FaArrowUp, FaSearch } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { X } from "lucide-react";

export default function TopNavBar() {

    const pathName = usePathname();
    const { router, search, setSearch, selectedcategory, sortBy, setSortBy } = useAppContext();
    const [searchText, setSearchText] = useState(search);
    const { carts } = useCartStore();
    const { books } = useBookStore();
    const { user } = useUserStore();
    const [dropdown, setDropdown] = useState(false);
    const queryClient = useQueryClient();
    const [sortType, setSortType] = useState("Sort By");

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

    const { mutate } = useMutation({
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

    function handleSort(option) {
        if (option === "price,asc") {
            setSortType(<span className="flex gap-1 items-center">Price<FaArrowDown /></span>);
        }
        else if (option === "price,desc") {
            setSortType(<span className="flex gap-1 items-center">Price<FaArrowUp /></span>);
        }
        else if (option === "quantity,asc") {
            setSortType(<span className="flex gap-1 items-center">Stock<FaArrowDown /></span>);
        }
        else if (option === "quantity,desc") {
            setSortType(<span className="flex gap-1 items-center">Stock<FaArrowUp /></span>);
        }
        else {
            setSortType(<span className="flex gap-1 items-center">Sort By</span>);
        }
        setSortBy(option);
        setDropdown(!dropdown);
        queryClient.invalidateQueries({
            queryKey: ["allBooks", 0, 0, searchText, selectedcategory, option]
        })
    }

    return (
        <div className="top flex items-center gap-3 justify-between bg-(--background) px-5 py-2 w-full rounded-bl-xl h-[8vh]">
            <div className="left">
                <h2 className="text-xl font-semibold">Welcome Back!</h2>
            </div>
            <div className="right flex gap-6 mr-10">
                {pathName === "/bookstore" && <div className={`dropdown relative border-2 border-gray-600 rounded-2xl shadow-xs shadow-(color:--shadow) flex items-center justify-center`}>
                    <span className="font-semibold text-md mx-auto items-center px-3 cursor-pointer w-fit text-center" onClick={() => setDropdown(!dropdown)}>{sortType}</span>
                    <div className={`values absolute ${dropdown ? "flex" : "hidden"} *:cursor-pointer z-10 bg-(--background) flex-col gap-2 border-2 border-gray-500 rounded-b-2xl top-10 px-4 py-1 w-42.5`}>
                        <span className="flex gap-1" onClick={() => handleSort("title")}>Sort By Title</span>
                        <span className="flex gap-1" onClick={() => handleSort("price,asc")}>Price: Low to High</span>
                        <span onClick={() => handleSort("price,desc")}>Price: High to Low</span>
                        < span onClick={() => handleSort("quantity,asc")}>Stock: Low to High</span>
                        <span onClick={() => handleSort("quantity,desc")}>Stock: High to Low</span>
                    </div>
                </div>}
                {pathName === "/bookstore" && <div className="flex gap-2 items-center justify-between px-3 py-1 w-75 shadow-md bg-(--section-hover) rounded-xl" >
                    <FaSearch className="text-lg" />
                    <input type="text" value={searchText} onChange={(e) => {
                        setSearchText(e.target.value);
                    }}
                        className="text-sm px-2 py-1 w-full border-none outline-none"
                        placeholder="Search By Title and Enter" onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSearch(searchText)
                                queryClient.invalidateQueries({
                                    queryKey: ["allBooks", 0, 0, searchText, selectedcategory, sortBy]
                                })
                            }
                        }} />
                    {searchText.length > 0 && <X onClick={() => {
                        setSearch("");
                        queryClient.invalidateQueries({
                            queryKey: ["allBooks", 0, 0, searchText, selectedcategory, sortBy]
                        });
                        setSearchText("");
                    }} className="text-xl cursor-pointer" />}
                </div>}
                {pathName == "/bookstore/carts" && <button type="submit"
                    className="text-white flex items-center font-semibold px-4 py-2 rounded-xl bg-green-500 cursor-pointer"
                    onClick={handleCheckout}>
                    Checkout</button>}
                {pathName == "/bookstore/carts" && <button type="submit"
                    className="text-white flex items-center font-semibold px-4 rounded-xl bg-red-500 cursor-pointer"
                    onClick={handleClearCart}>Clear Cart</button>}
            </div>
        </div >
    )
}