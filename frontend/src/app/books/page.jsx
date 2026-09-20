"use client"
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "../components/utils/bookUtils";
import BookCard from "../bookstore/components/BookCard";

export default function Books() {
    const { data: bookData, isPending: bookPending, isError: bookError } = useQuery({
        queryKey: ["allBooks"],
        queryFn: getAllBooks,
        select: (response) => response?.data
    });

    const books = bookData?.data?.books ?? [];

    if (bookPending) {
        return <div className="p-4 text-(--foreground)">Loading books...</div>;
    }

    if (bookError || !bookData?.success) {
        return <div className="p-4 text-red-500">Unable to load books right now.</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-5 items-start overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3">
            {books?.map((item) => (
                <BookCard key={item.id} book={item} mode="withOutLogin" />
            ))}
        </div>
    )
}