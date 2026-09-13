import useFetch from "@/app/hooks/useFetch";

// get with carts
// export function getAllBooks(cartItems) {
//     return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "", { books: cartItems }, false);
// }

//get without carts
export function getAllBooks() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "all", "", false);
}

//get without carts with paging
export function getPagedBooks(pageNumber, pageSize, search, category, sortBy) {
    console.log("FD", pageNumber, pageSize, search, category, sortBy);
    return useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, `?page=${pageNumber}&size=${pageSize}&search=${search}&category=${category}&sortBy=${sortBy}`, "", false);
}

export function getBook(id) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, id, "", false);
}

export function addBook(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "book", request, false);
}

export function editBook({ id, request }) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, id, request, false);
}

export function getBookSuggestions(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "suggestions", request, false);
}

export function deleteBook(id) {
    return useFetch("delete", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, id, "", false);
}