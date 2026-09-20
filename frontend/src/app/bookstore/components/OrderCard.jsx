"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { formattedDate, getDeliveryStatus } from "@/app/components/utils/FunctionalUtils";
import { useBookStore } from "@/app/hooks/useStore";
import { GoArrowRight } from "react-icons/go";

export default function OrderCard({ order }) {

    const { router } = useAppContext();

    const orderedBooks = order.books;

    const previewOrders = orderedBooks?.slice(0, 3);
    const status = getDeliveryStatus(order?.deliveryDtls || "");

    return (
        <div className="flex items-center gap-3 px-8 py-4 m-4 hover:scale-[1.01] cursor-pointer shadow-md shadow-(color:--shadow) rounded-xl justify-between" onClick={() => router.push(`/bookstore/orders/${order._id}`)}>
            <div className="books flex gap-2 w-125">
                {previewOrders.map((item) => {
                    return (
                        <div key={item.bookId} className="h-28 w-24">
                            <img src={item.url} className="h-full w-full rounded-xl object-cover shadow-sm" />
                        </div>
                    )
                })}
                {orderedBooks.length > 3 && (
                    <div className="flex h-28 w-24 flex-col items-center justify-center rounded-xl bg-gray-200 text-gray-700">
                        <span className="text-3xl font-bold">+{orderedBooks.length - 3}</span>
                        <span className="text-sm">more</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-3">
                    {status.icon}
                    <h2 className={`text-2xl font-medium ${status.color}`}>
                        {status.text}
                    </h2>
                </div>
                <p className="mt-2 text-base text-gray-500">
                    {status.subtext}
                </p>
                <p className="text-sm text-gray-400">
                    {orderedBooks.length} item{orderedBooks.length > 1 ? "s" : ""}
                </p>
            </div>
            <GoArrowRight className="text-5xl group-hover:-translate-x-3 transition-transform duration-300" />
        </div>
    )
}