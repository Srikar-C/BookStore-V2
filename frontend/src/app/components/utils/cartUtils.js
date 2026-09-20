import useFetch from "@/app/hooks/useFetch";

export function updateCart(bookid, count) {
    return useFetch("put", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, "updateCart", { bookid, count }, true);
}

export function getAllCarts() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, "me", "", true);
}

export function removeBookFromCart(bookid) {
    return useFetch("delete", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, "deleteBook", { bookid }, true);
}

export function clearCart() {
    return useFetch("delete", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, "", "", true);
}