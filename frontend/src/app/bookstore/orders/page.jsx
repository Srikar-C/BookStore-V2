"use client"

import { getOrders } from "@/app/components/utils/orderUtils";
import { useUserStore } from "@/app/hooks/useStore"
import { useInfiniteQuery } from "@tanstack/react-query"
import OrderCard from "../components/OrderCard";
import OrderSkeleton from "@/app/components/skeletons/OrderSkeleton";
import "@/app/styles.css";

export default function Orders() {

    const { user } = useUserStore();

    //without pagination
    // const { data, isSuccess, isPending } = useQuery({
    //     queryKey: ["getOrders", user?.id],
    //     queryFn: () => getOrders(user?.id),
    //     select: (response) => response?.data?.data,
    //     enabled: !!user?.id
    // })

    //with pagination
    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["getOrders", user?.id],
        queryFn: ({ pageParam }) => getOrders(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            console.log("lastpage: ", lastPage);
            const pageData = lastPage?.data?.data;
            if (pageData?.isLast) {
                return undefined;
            }
            return pageData?.pageNumber + 1;
        },
        enabled: !!user?.id,
    })

    if (isPending) {
        return <OrderSkeleton />
    }

    const orders = data?.pages?.flatMap(
        (page) => page?.data?.data?.content ?? []
    ) ?? [];

    console.log("orders:", data, orders);

    return (
        <div className="flex flex-col overflow-y-auto w-full h-full bg-(--background) rounded-l-xl p-3 custom-scrollbar">
            {orders?.length <= 0 && <div className="text-gray-400 text-2xl text-center justify-center font-semibold py-5">No Orders Before</div>}
            {orders?.length > 0 && <h3 className="text-3xl font-serif">Orders</h3>}
            {orders?.map((order) => (
                <OrderCard key={order._id} order={order} />
            ))}
            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mx-auto mt-4 px-5 py-2 rounded-lg border-2 border-(--foreground)"
                >
                    {isFetchingNextPage
                        ? "Loading..."
                        : "Load More"}
                </button>
            )}
        </div>
    )
}