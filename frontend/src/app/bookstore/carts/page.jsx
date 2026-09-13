"use client";
import { useBookStore, useCartStore } from "@/app/hooks/useStore";
import BookCard from "../components/BookCard";

export default function Carts() {

    const { carts } = useCartStore();
    const { books } = useBookStore();

    const cartBooks = carts.filter((item) => item.count > 0)
        .map((item) => {
            const book = books.find((b) => b.id === item.bookId);

            return {
                ...book,
                count: item.count
            };
        })

    const validBooks = cartBooks.filter((book) => book.quantity >= book.count);
    const invalidBooks = cartBooks.filter((book) => book.quantity < book.count);

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto bg-(--background) rounded-xl gap-5 p-4">
            {validBooks.length <= 0 && invalidBooks.length <= 0 && <div className="text-gray-400 text-2xl text-center justify-center font-semibold py-5">No Cart Items</div>}
            {invalidBooks.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4 pb-10">
                {invalidBooks?.map((item, index) => (
                    <BookCard key={index} book={item} mode="cart" />
                ))}
            </div>}
            {invalidBooks.length > 0 && <hr />}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4 pb-10">
                {validBooks?.map((item, index) => (
                    <BookCard key={index} book={item} mode="cart" />
                ))}
            </div>
        </div>
    )
}