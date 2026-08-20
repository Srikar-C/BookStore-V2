"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { getDeliveryDate } from "@/app/components/utils/FunctionalUtils";
import { useBookStore, useCartItemsStore, useUserStore } from "@/app/hooks/useStore";
import { useEffect, useState } from "react";
import { TbSum } from "react-icons/tb";

export default function DeliveryDtls() {

    const { cartItems } = useCartItemsStore();
    const { user } = useUserStore();
    const { books } = useBookStore();
    const [location, setLocation] = useState({
        latitude: "",
        longitude: "",
        display_name: "",
    });
    const [date, setDate] = useState(null);
    const { router } = useAppContext();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            setLocation((prev) => ({
                ...prev,
                latitude: latitude,
                longitude: longitude,
            }))
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );

            const data = await response.json();

            console.log(data);
            setLocation((prev) => ({
                ...prev,
                display_name: data.display_name
            }))
        });
    }, []);

    const cartBooks = cartItems.filter((item) => item.count)
        .map((item) => {
            const book = books.find((b) => b.id === item.bookId);

            return {
                ...book,
                count: item.count
            };
        });

    const orderedBooks = cartBooks.map((item) => {
        return {
            bookId: item.id,
            bookQuantity: item.quantity,
            bookPrice: item.price,
            bookCount: item.count,
            bookUrl: item.url,
            bookName: item.title,
        }
    })

    console.log(orderedBooks);

    const orders = {
        userId: user.id,
        books: orderedBooks,
        location: location,
        deliveryBy: date
    };

    useEffect(() => {
        if (orderedBooks.length > 0) {
            getDeliveryDate(setDate, orderedBooks);
        }
    }, [orderedBooks.length]);

    const previewBooks = orderedBooks.slice(0, 7);

    const totalItems = orderedBooks.reduce((sum, item) => sum + item.bookCount, 0);
    const grandTotal = orderedBooks.reduce((sum, item) => sum + (item.bookCount * item.bookPrice), 0);

    return (
        <div className="grid grid-cols-[0.8fr_1fr] p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl">
            <div className="left flex flex-col gap-3 w-fit">
                <h3 className="text-3xl font-semibold capitalize font-serif">Ordered Books</h3>
                <div className="orders flex gap-3 items-center shadow-md p-3 rounded-xl shadow-(color:--shadow) w-[500px] flex-wrap">
                    {previewBooks.map((item) => {
                        return (
                            <div key={item.bookId} className="h-27.5 w-27.5">
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
            <div className="right flex flex-col">
                <div className="grid grid-cols-6 gap-3 text-center font-semibold items-center justify-center border-b-2 p-3">
                    <span>Book</span>
                    <span>Units</span>
                    <span></span>
                    <span>Price</span>
                    <span></span>
                    <span>Total</span>
                </div>
                <div className="h-[50vh] overflow-y-auto">
                    {orderedBooks.map((item, index) => (
                        <div className="flex flex-col">
                            <div className="grid grid-cols-6 gap-3 p-2 text-center  items-center content-center justify-center " key={index}>
                                <span>{item.bookName}</span>
                                <span>{item.bookCount}</span>
                                <span>X</span>
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