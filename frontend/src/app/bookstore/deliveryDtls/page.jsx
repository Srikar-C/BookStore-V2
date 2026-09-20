"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { formattedDate, getDeliveryDate, getDeliveryStatus, getDeliveryStatusForTracking } from "@/app/components/utils/FunctionalUtils";
import { setOrder } from "@/app/components/utils/orderUtils";
import { showError, showInfo, showSuccess } from "@/app/components/utils/showToasts";
import { useBookStore, useCartStore, useUserStore } from "@/app/hooks/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { TbSum } from "react-icons/tb";
import { PuffLoader } from "react-spinners";

export default function DeliveryDtls() {

    const { carts } = useCartStore();
    const { user } = useUserStore();
    const { books } = useBookStore();
    const [location, setLocation] = useState({
        latitude: "",
        longitude: "",
        display_name: "",
    });
    const { router, cartId, selectedcategory, search, sortBy } = useAppContext();
    const queryClient = useQueryClient();

    const [edit, setEdit] = useState(false);
    const [locLoad, setLocload] = useState(true);

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            name: user.name,
            phone: user.phone,
            address: ""
        }
    })

    useEffect(() => {
        setLocload(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );

                const data = await response.json();
                setValue("address", data.display_name);
                setLocation((prev) => ({
                    ...prev,
                    latitude: latitude,
                    longitude: longitude,
                    display_name: data.display_name
                }))
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLocload(false);
            }
        });
    }, []);

    const cartBooks = useMemo(() => {
        return carts.filter((item) => item.count)
            .map((item) => {
                const book = books.find((b) => b.id === item.bookId);
                return {
                    ...book, count: item.count
                }
            })
    }, [carts, books])

    const orderedBooks = useMemo(() => {
        return cartBooks.map((item) => ({
            bookId: item.id,
            bookQuantity: item.quantity,
            bookPrice: item.price,
            bookCount: item.count,
            bookUrl: item.url,
            bookName: item.title,
            bookAuthor: item.author,
        }))
    }, [cartBooks]);

    const deliveryDate = useMemo(() => {
        return getDeliveryDate(orderedBooks);
    }, [orderedBooks]);

    const previewBooks = useMemo(() => orderedBooks.slice(0, 7), [orderedBooks]);

    const totalItems = useMemo(() => orderedBooks.reduce((sum, item) => sum + item.bookCount, 0), [orderedBooks]);
    const grandTotal = useMemo(() => orderedBooks.reduce((sum, item) => sum + (item.bookCount * item.bookPrice), 0), [orderedBooks]);

    function onSubmit(data) {
        if (locLoad) return;
        setEdit(!edit);
    }

    const { mutate: bookOrder } = useMutation({
        mutationFn: setOrder,
        onSuccess: (response) => {
            console.log(response);
            const result = response.data;
            if (response.status === 200) {
                showSuccess(result.message);
                queryClient.invalidateQueries({
                    queryKey: ["allCarts", user?.id]
                })
                queryClient.invalidateQueries({
                    queryKey: ["allBooks", 0, 0, selectedcategory, search, sortBy]
                })
                router.replace("/bookstore");

            }
        },
        onError: (error) => {
            console.log("order error: ", error);
            showError(error.data.error);
            router.replace("/bookstore/carts");
        }
    })

    function handleOrder() {
        const orders = {
            cartId: cartId,
            books: orderedBooks.map((item) => {
                return {
                    bookId: item.bookId,
                    url: item.bookUrl,
                    count: item.bookCount,
                    price: item.bookPrice,
                    title: item.bookName,
                    author: item.bookAuthor,
                }
            }),
            locationDtls: {
                latitude: location.latitude,
                longitude: location.longitude,
                display_name: watch("address"),
            },
            userDtls: {
                deliveryname: watch("name"),
                deliveryphone: watch("phone"),
            },
            deliveryDtls: {
                deliveryDate: deliveryDate,
                deliveryStatus: "pending"
            }
        };
        bookOrder(orders);
    }

    return (
        <div className="grid grid-cols-[0.8fr_1fr] p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            <div className="left flex flex-col gap-6 w-fit">
                <div className="books flex flex-col gap-3 w-fit">
                    <h3 className="text-2xl font-semibold capitalize font-serif">Ordered Books</h3>
                    <div className="orders flex gap-3 items-center shadow-md p-3 rounded-xl shadow-(color:--shadow) w-125 flex-wrap">
                        {previewBooks.map((item, index) => {
                            return (
                                <div key={index} className="h-24 w-20">
                                    <img src={item.bookUrl} className="h-full w-full rounded-xl object-cover" />
                                </div>
                            )
                        })}
                        {orderedBooks.length > 7 && (
                            <div className="flex h-27.5 w-27.5 flex-col items-center justify-center rounded-xl bg-gray-200 text-gray-700">
                                <span className="text-3xl font-bold">+{orderedBooks.length - 7}</span>
                                <span className="text-sm">more</span>
                            </div>
                        )}
                    </div>
                    <button className="px-4 py-2 rounded-2xl cursor-pointer bg-(--input-icon) w-[30%] mx-auto font-semibold text-(--background)" onClick={() => router.push("/bookstore/carts")}>Edit Cart</button>
                </div>

                <div className="deliverydtls">
                    <div className="deliverydtls flex flex-col gap-2">
                        <h3 className="text-3xl font-semibold font-serif">Order Delivery Details</h3>
                        <div className="grid grid-flow-row grid-cols-[180px_0.8fr] gap-3 *:p-1 p-2 items-center ">
                            <span className="font-semibold text-start">Name</span>
                            {edit ? <input className="border-2 border-(--foreground) outline-none" type="text" {...register("name")} />
                                : <span className="bg-gray-300 text-black">{watch("name")}</span>}
                            <span className="font-semibold text-start">Phone</span>
                            {edit ? <input className="border-2 border-(--foreground) outline-none" type="text" {...register("phone")} />
                                : <span className="bg-gray-300 text-black">{watch("phone")}</span>}
                            <span className="font-semibold text-start">Delivery Address</span>
                            {locLoad ?
                                <div className="flex items-center gap-2">
                                    <PuffLoader size={40} />
                                    <h1>Fetching...</h1>
                                </div>
                                :
                                edit ?
                                    <input className="border-2 border-(--foreground) outline-none" type="text" {...register("address")} />
                                    : <span className="bg-gray-300 text-black">{watch("address")}</span>
                            }
                            <span className="font-semibold text-start">Delivery By</span>
                            <span className="bg-gray-300 text-black">{formattedDate(deliveryDate)}</span>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className={`btns flex items-center justify-around *:font-semibold`}>
                        <button disabled={locLoad} type="submit"
                            className={`${!locLoad ? "cursor-pointer" : "cursor-not-allowed"} p-2 rounded-xl border-2 border-(--foreground) text-(--foreground) hover:text-(--background) hover:bg-(--foreground)`}

                        >{edit ? "Save Details" : "Edit Details"}</button>
                        <button disabled={locLoad} className={`${!locLoad ? "cursor-pointer" : "cursor-not-allowed"} p-2 rounded-xl border-2 text-white bg-[#2c6727] hover:text-[#2c6727] hover:bg-white`}
                            onClick={handleOrder}
                        >Proceed to Order</button>
                    </form>
                </div>
            </div>

            <div className="right flex flex-col">
                <div className="grid grid-cols-6 gap-3 text-center font-semibold items-center justify-center border-b-2 p-3">
                    <span>Book</span>
                    <span>Units</span>
                    <span></span>
                    <span>Price</span>
                    <span></span>
                    <span>Total</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {orderedBooks.map((item, index) => (
                        <div key={index} className="flex flex-col">
                            <div className="grid grid-cols-6 gap-3 p-2 text-center  items-center content-center justify-center " key={index}>
                                <span>{item.bookName}</span>
                                <span>{item.bookCount}</span>
                                <span>x</span>
                                <span>{item.bookPrice}</span>
                                <span>=</span>
                                <span>₹{item.bookCount * item.bookPrice}</span>
                            </div>
                            <hr className="text-(--hr)" />
                        </div>
                    ))}
                </div>
                <div className="total grid grid-cols-6 gap-3 p-2 font-bold items-center justify-center text-center">
                    <span>Total Units : </span>
                    <span>{totalItems}</span>
                    <span></span>
                    <span className="flex gap-2 col-span-2 items-center justify-center text-center">
                        <TbSum className="text-xl" /> Grand Total = </span>
                    <span>₹{grandTotal}</span>
                </div>
            </div>
        </div>
    )
}