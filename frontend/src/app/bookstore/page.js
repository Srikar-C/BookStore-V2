"use client"
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "../components/utils/bookUtils";
import { useBookStore } from "../hooks/useStore"
import BookCard from "./components/BookCard";
import { useEffect } from "react";
import { useAppContext } from "../components/common/AppContext";

export default function BookStoreLandingPage() {

    const { books, setBooks } = useBookStore();
    const { router } = useAppContext();

    const { data: bookData, isPending: bookPending, isSuccess: bookSuccess, isError: bookError } = useQuery({
        queryKey: ["allBooks"],
        queryFn: getAllBooks,
        select: (response) => response?.data,
    })

    useEffect(() => {
        if (bookPending) return;
        if (bookSuccess && bookData?.success && bookData?.data) {
            setBooks(bookData?.data);
            return;
        }
    }, [bookData, bookPending, bookSuccess, bookError, router])

    if (bookPending) {
        return <div>...Loading Books</div>
    }

    if (bookError || !bookData?.success || !bookData?.data) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            {books?.map((item) => (
                <BookCard key={item.id} item={item} />
            ))}
        </div>
    )
}