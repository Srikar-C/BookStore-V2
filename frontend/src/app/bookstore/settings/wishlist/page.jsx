"use client"
import { useBookStore, useWishListStore } from "@/app/hooks/useStore";
import BookCard from "../../components/BookCard";
import "@/app/styles.css";

export default function Wishlist() {

    const { wishlist } = useWishListStore();
    const { books } = useBookStore();

    const wishlistBooks = (books ?? []).filter((book) => {
        return wishlist?.includes(book.id);
    })

    return (
        <div className="grid grid-cols-2 gap-3 p-4 custom-scrollbar h-full overflow-y-auto ">
            {wishlistBooks?.length <= 0 && <div className="text-gray-400 text-2xl text-center justify-center font-semibold py-5">No Books in your Wishlist</div>}
            {wishlistBooks?.map((item) => (
                <BookCard key={item.id} book={item} mode="wishList" />
            ))}
        </div>
    )
}