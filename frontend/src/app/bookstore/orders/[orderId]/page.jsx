"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { formattedDate, getCancelStatus, getDeliveryStatus } from "@/app/components/utils/FunctionalUtils";
import { cancelOrder, getOrderById } from "@/app/components/utils/orderUtils";
import { useBookStore, useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { LuDot } from "react-icons/lu";
import { RiBillLine } from "react-icons/ri";
import { TbArrowBackUp, TbSum } from "react-icons/tb";
import { BsBasket3 } from "react-icons/bs";
import OrderInvoiceSkeleton from "@/app/components/skeletons/OrderInvoiceSkeleton";
import { showError, showSuccess } from "@/app/components/utils/showToasts";

export default function OrderInvoice() {
    const { orderId } = useParams();
    const { router } = useAppContext();
    const { books } = useBookStore();
    const { user } = useUserStore();
    const pathName = usePathname();
    const queryClient = useQueryClient();

    console.log("pathname: ", pathName);

    const { data, isPending } = useQuery({
        queryKey: ["getOrder", orderId],
        queryFn: () => getOrderById(orderId),
        select: (response) => response?.data
    })

    const order = data?.data;
    const orderedBooks = order?.books.filter((item) => item.count)

    const totalItems = orderedBooks?.reduce((sum, item) => sum + item.count, 0);
    const grandTotal = orderedBooks?.reduce((sum, item) => sum + (item.count * item.price), 0);

    const status = getDeliveryStatus(order?.deliveryDtls || "");
    const cancelStatus = getCancelStatus(order?.createdAt, order?.deliveryDtls?.deliveryDate || "");

    console.log("cancel: ", cancelStatus);

    const { mutate, isPending: cancelPending } = useMutation({
        mutationFn: cancelOrder,
        onSuccess: (response) => {
            console.log(response);
            router.replace("/bookstore");
            queryClient.invalidateQueries({
                queryKey: ["allBooks"],
            })
            showSuccess("Order Cancelled Successfully");
        },
        onError: (error) => {
            console.log(error);
            showError(error);
        }
    })

    function handleCancel() {
        mutate(orderId)
    }

    if (isPending) {
        return <OrderInvoiceSkeleton />
    }

    return (
        <div className="p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl flex flex-col gap-3">
            <div className="top-left flex justify-between">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => { router.replace("/bookstore/orders") }}>
                    <TbArrowBackUp className="text-xl" />
                    <p>Back to Orders</p>
                </div>
                {order?.deliveryDtls?.deliveryStatus !== "cancelled" && cancelStatus && <span className="text-white bg-red-600 cursor-pointer px-4 py-1 rounded-xl font-semibold" onClick={handleCancel}>Cancel Order</span>}
            </div>
            <div className="grid grid-cols-[0.8fr_0.8fr] gap-10">
                <div className="left flex flex-col gap-4">
                    <div className="flex justify-between items-cenetr">
                        <h3 className="text-3xl font-serif">OrderInvoice</h3>
                        <div className="flex items-center gap-1">
                            {status.icon}
                            <h2 className={`text-lg font-medium ${status.color}`}>
                                {status.text}
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 p-3 border-2 border-(--foreground) rounded-xl">
                        <h4 className="text-xl font-serif font-semibold flex items-center gap-1"><BsBasket3 /> Order Details</h4>
                        <div className="grid grid-cols-[1fr_1fr] gap-4">
                            <span className="font-semibold">Order Id</span>
                            <span>{order?._id}</span>
                            <span className="font-semibold">Delivery Address</span>
                            <span>{order?.locationDtls?.display_name || "Delivery Address Missed"}</span>
                            <span className="font-semibold">Order Placed On</span>
                            <span>{formattedDate(order?.createdAt)}</span>
                            <span className="font-semibold">Order Delivery By</span>
                            <span>{formattedDate(order?.deliveryDtls?.deliveryDate)}</span>
                            <span className="font-semibold">Receiver Details</span>
                            <span className="uppercase">{order?.userDtls?.deliveryname || user.name}</span>
                            <span className="font-semibold">Receiver Phone</span>
                            <span>{order?.userDtls?.deliveryphone || user.phone}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 p-3 border-2 border-(--foreground) rounded-xl">
                        <h4 className="text-xl font-serif font-semibold flex items-center gap-1"><RiBillLine /> Bill Summary</h4>
                        <div className="grid grid-cols-[1fr_1fr] gap-4">
                            <span className="font-semibold">Total Items</span>
                            <span>{totalItems}</span>
                            <span className="font-semibold flex gap-1 items-center"><TbSum className="text-xl" />Total Bill</span>
                            <span>₹ {grandTotal}</span>
                        </div>
                    </div>
                </div>
                <div className="right flex flex-col">
                    <h3 className="text-2xl font-semibold">Ordered Books</h3>
                    <div className="max-h-[70vh] overflow-y-auto">
                        {orderedBooks.map((item, index) => (
                            <div key={index} className="flex flex-col">
                                <div className="grid grid-cols-[0.2fr_0.5fr_0.2fr] gap-3 p-2 text-center  items-center content-center justify-center " key={index}>
                                    <span className="flex flex-col gap-1 h-24 w-20">
                                        <img src={item.url} alt={item.title} className="h-full w-full rounded-xl object-cover shadow-sm" />
                                    </span>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="font-semibold capitalize">
                                            {item.title}{" "}
                                            <span>
                                                (<span className="text-gray-500 font-normal">Written By</span>{" "}
                                                {item.author})
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <p className="text-gray-500">{item.count} units</p>
                                            <LuDot className="text-xl text-slate-500" />
                                            <p className="text-gray-500">₹{item.price}</p>
                                        </div>
                                    </div>
                                    <span>₹{item.count * item.price}</span>
                                </div>
                                <hr className="text-(--hr)" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}