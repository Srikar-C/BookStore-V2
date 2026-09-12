"use client"
import { useEffect, useState } from "react";
import { useBookStore, useCartStore } from "../hooks/useStore"
import BookCard from "./components/BookCard";
import Pagination from "@mui/material/Pagination";
import { useQuery } from "@tanstack/react-query";
import { getPagedBooks } from "../components/utils/bookUtils";
import BookSkeleton from "../components/skeletons/BookSkeleton";

export default function BookStoreLandingPage() {

    const { categories, setCategories } = useBookStore();
    const { carts } = useCartStore();
    const [pageSize, setPageSize] = useState(9);
    const [pageNumber, setPageNumber] = useState(0);
    const [pagedBooks, setPagedBooks] = useState([]);

    const { data, isPending } = useQuery({
        queryKey: ["allBooks", pageNumber, pageSize],
        queryFn: () => getPagedBooks(pageNumber, pageSize),
        select: (response) => response?.data,
    });

    useEffect(() => {
        if (isPending) return;
        if (data?.success && data?.data) {
            console.log("book list: ", data);
            setPagedBooks(data?.data?.content?.books?.content);
            setCategories(data?.data?.content?.category);
        }
    }, [isPending, data]);

    const booksWithCartCount = (pagedBooks ?? []).map((book) => {
        const cartItem = carts?.find(
            (item) => item.bookId === book.id
        );

        return {
            ...book,
            count: cartItem?.count ?? 0
        };
    });

    const sortedBooks = [
        ...(booksWithCartCount ?? []).filter(
            (book) => book.quantity > 0 && book.count > book.quantity
        ),
        ...(booksWithCartCount ?? []).filter(
            (book) => !(book.quantity > 0 && book.count > book.quantity)
        )
    ];

    if (isPending) {
        return <BookSkeleton />
    }

    return (
        <div className="grid grid-rows-[auto_1fr_auto] items-start overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3">
            <div className="categories flex justify-between gap-3 p-2 h-[7vh]">
                <div className="categories flex gap-3">
                    {categories?.map((item, index) => (
                        <p key={index} className="px-3 py-1 rounded-lg shadow-xs shadow-(color:--shadow) cursor-pointer">
                            {item}
                        </p>
                    ))}
                </div>
                <div className="options flex gap-3">
                    <div className="size flex items-center gap-2 border-2 border-gray-600 p-2">
                        <span>{data?.data?.isLast ? data?.data?.totalElements : pageSize * (pageNumber + 1)}</span>
                        <span>/</span>
                        <span>{data?.data?.totalElements}</span>
                    </div>
                    <div className="size flex items-center gap-2">
                        <span>Page Size</span>
                        <input type="text" className="w-7.5 text-center border-2 border-gray-600" value={pageSize} onChange={(e) => {
                            setPageSize(e.target.value)
                            setPageNumber(0);
                        }} />
                    </div>

                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
                {sortedBooks?.map((item) => (
                    <BookCard key={item.id} book={item} mode="display" />
                ))}
            </div>
            <div className="pagintion w-full flex justify-center">
                <Pagination count={Math.max(data?.data?.content?.books?.totalPages, 1)} page={pageNumber + 1} color="secondary"
                    shape="rounded" size="large" onChange={(event, page) => {
                        setPageNumber(page - 1);
                    }}
                    sx={{
                        "& .MuiPaginationItem-root": {
                            color: "var(--foreground)",
                            borderColor: "var(--foreground)",
                        },
                        "& .Mui-selected": {
                            backgroundColor: "var(--input-icon) !important",
                            color: "#fff",
                        },
                    }} />
            </div>
        </div>
    )
}