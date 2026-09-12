import useFetch from "@/app/hooks/useFetch";

export function setOrder(orders) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "checkout", { orders }, false);
}

//without pagination
// export function getOrders(userid) {
//     return useFetch("get", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, userid, "", false);
// }
//with pagination
export function getOrders(userid, pageNumber) {
    return useFetch("get", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, `${userid}?page=${pageNumber}&size=5`, "", false);
}


export function getOrderById(orderid) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "orderId", { orderid }, false);
}

export function countOrders(userid) {
    return useFetch("post", process.env.NEXT_PUBLIC_API_Order, process.env.NEXT_PUBLIC_MAPPING_Order, "count", { userid }, false);
}