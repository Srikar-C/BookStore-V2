import useFetch from "@/app/hooks/useFetch";

export function setOrder(orders) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "checkout", { orders }, true);
}

//without pagination
// export function getOrders(userid) {
//     return useFetch("get", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, userid, "", false);
// }
//with pagination
export function getOrders(pageNumber) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, `me?page=${pageNumber}&size=5`, "", true);
}

export function getAllOrders() {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "", "", false);
}


export function getOrderById(orderid) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "orderId", { orderid }, true);
}

export function countOrders() {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "count", "", true);
}

export function cancelOrder(orderId) {
    return useFetch("delete", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, `orders/${orderId}`, "", true);
}