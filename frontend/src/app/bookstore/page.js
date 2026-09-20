"use client"
import { useEffect, useState } from "react";
import { useBookStore, useCartStore } from "../hooks/useStore"
import BookCard from "./components/BookCard";
import Pagination from "@mui/material/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPagedBooks } from "../components/utils/bookUtils";
import BookSkeleton from "../components/skeletons/BookSkeleton";
import { useAppContext } from "../hooks/AppContext";
import "@/app/styles.css";

export default function BookStoreLandingPage() {

    const { categories, setCategories } = useBookStore();
    const { carts } = useCartStore();
    const [pageSize, setPageSize] = useState(9);
    const [pageNumber, setPageNumber] = useState(0);
    const [pagedBooks, setPagedBooks] = useState([]);
    const { search, selectedcategory, setSelectedCategory, sortBy } = useAppContext();
    const queryClient = useQueryClient();

    const { data, isPending } = useQuery({
        queryKey: ["allBooks", pageNumber, pageSize, search, selectedcategory, sortBy],
        queryFn: () => getPagedBooks(pageNumber, pageSize, search, selectedcategory, sortBy),
        select: (response) => response?.data,
    });

    useEffect(() => {
        if (isPending) return;
        if (data?.success && data?.data) {
            console.log("book list: ", data);
            setPagedBooks(data?.data?.content?.books?.content);
            const allCategory = [
                "All",
                ...(data?.data?.content?.category)
            ]
            setCategories(allCategory);
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

    // const sortedBooks = [
    //     ...(booksWithCartCount ?? []).filter(
    //         (book) => book.quantity > 0 && book.count > book.quantity
    //     ),
    //     ...(booksWithCartCount ?? []).filter(
    //         (book) => !(book.quantity > 0 && book.count > book.quantity)
    //     )
    // ];

    function handleBookSortByCategory(item) {
        console.log("item selected: ", item);
        setSelectedCategory(item);
        queryClient.invalidateQueries({
            queryKey: ["allBooks", 0, 0, search, item, sortBy]
        })
    }

    if (isPending) {
        return <BookSkeleton />
    }

    return (
        <div className="grid grid-rows-[auto_1fr_auto] items-start overflow-y-auto w-full h-full bg-(--background) rounded-l-xl p-3 custom-scrollbar">
            <div className="header flex justify-between gap-3 p-2 h-[10vh] w-full">
                <div className="categories flex min-w-0 flex-1 gap-3 w-65 overflow-x-auto overflow-y-hidden h-full items-center custom-scrollbar">
                    {categories?.map((item, index) => (
                        <p key={index} className={`px-3 py-1 whitespace-nowrap rounded-lg ${selectedcategory !== item ? "bg-(--background) text-(--foreground)" : "bg-(--foreground) text-(--background)"} shadow-xs shadow-(color:--shadow) cursor-pointer w-fit`} onClick={() => {
                            setPageNumber(0);
                            handleBookSortByCategory(item);
                        }}>
                            {item}
                        </p>
                    ))}
                </div>
                <div className="options shrink-0 flex gap-3 items-center">
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
                {booksWithCartCount?.map((item) => (
                    <BookCard key={item.id} book={item} mode="withLogin" />
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