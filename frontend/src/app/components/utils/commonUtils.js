import useFetch from "@/app/hooks/useFetch";

export function addsuggestion(request) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Common, process.env.NEXT_PUBLIC_MAPPING_Common, "suggestion", request, true);
}

export function getSuggestions() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Common, process.env.NEXT_PUBLIC_MAPPING_Common, "suggestion", "", false);
}



export function addWishlist(bookid) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Common, process.env.NEXT_PUBLIC_MAPPING_Common, bookid, "", true);
}

export function removeWishlist(bookid) {
    return useFetch("put", process.env.NEXT_PUBLIC_API_Common, process.env.NEXT_PUBLIC_MAPPING_Common, bookid, "", true);
}

export function getWishlist() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Common, process.env.NEXT_PUBLIC_MAPPING_Common, "wishlist", "", true);
}