"use client";
import { useBookStore, useCartItemsStore, useUserStore } from "@/app/hooks/useStore"
import BookCard from "../components/BookCard";

export default function Carts() {

    const { cartItems } = useCartItemsStore();
    const { user } = useUserStore();
    const { books } = useBookStore();

    const cartBooks = cartItems.filter((item) => item.count)
        .map((item) => {
            const book = books.find((b) => b.id === item.bookId);

            return {
                ...book,
                count: item.count
            };
        })

    console.log(cartItems, books, cartBooks);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            {cartBooks?.map((item) => (
                <BookCard key={item.id} book={item} />
            ))}
        </div>
        // <div className="grid grid-row-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
        //     <div className="categories flex gap-3 h-[5vh] col-span-3 items-start content-start">

        //     </div>
        //     {cartBooks?.map((item) => (
        //         <BookCard key={item.id} book={item} />
        //     ))}
        // </div>
    )
}