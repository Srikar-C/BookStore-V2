import useFetch from "@/app/hooks/useFetch";

export function getAllBooks() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "", "", false);
}

export function getBook(id) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, id, "", false);
}

export function addBook(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "book", request, false);
}

export function editBook({ id, request }) {
    console.log("editBook received:", id, request);
    return useFetch("post", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, id, request, false);
}