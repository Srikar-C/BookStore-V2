import useFetch from "@/app/hooks/useFetch";

export function updateCart(userid, bookid, count) {
    return useFetch("put", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, "updateCart", { userid, bookid, count }, false);
}

export function getAllCarts(userid) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, userid, "", false);
}