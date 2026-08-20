"use client"
import { useBookStore } from "../hooks/useStore"
import BookCard from "./components/BookCard";

export default function BookStoreLandingPage() {

    const { books, categories } = useBookStore();

    return (
        <div className="grid grid-row-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            <div className="categories flex gap-3 h-[5vh] col-span-3">
                {categories?.map((item, index) => (
                    <p key={index} className="px-3 py-1 rounded-lg shadow-xs shadow-(color:--shadow) cursor-pointer">
                        {item}
                    </p>
                ))}
            </div>
            <hr className="text-(--hr) w-full col-span-3" />
            {books?.map((item) => (
                <BookCard key={item.id} book={item} />
            ))}
        </div>
    )
}