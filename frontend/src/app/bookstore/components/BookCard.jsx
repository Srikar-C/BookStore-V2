"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { showError } from "@/app/components/utils/showToasts";
import { useUserStore } from "@/app/hooks/useStore";
import { Card } from "flowbite-react";
import Image from "next/image";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";

export default function BookCard({ item }) {

    const [count, setCount] = useState(item.count);
    const { user } = useUserStore();
    const { router } = useAppContext();

    function handleCart() {
        setCount((prev) => prev + 1);
    }

    function handleModal() {
        // alert(item);
    }

    function handleIncrement() {
        console.log(count, item.quantity);
        if (count >= item.quantity) {
            showError("No More Stocks");
            return;
        }
        setCount((prev) => prev + 1);
    }

    function handleDecrement() {
        if (count === 0) return;
        setCount((prev) => prev - 1);
    }

    function handleDelete() {
        setCount(0);
    }

    function handleEdit() {
        router.push(`/bookstore/${item.id}`);
    }

    return (
        <div className="w-100 h-65 relative flex gap-1 shadow-lg rounded-xl cursor-pointer p-1 m-1 overflow-hidden hover:scale-105 transition-transform group" onClick={handleModal}>
            <img src={item.url} className="left flex w-9/20 h-full object-cover rounded-l-xl" />
            <div className="right w-55 flex flex-col gap-1 items-center justify-between py-2 px-3">
                <h4 className="font-bold text-2xl capitalize">{item.title}</h4>
                <p className="line-clamp-4">{item.description}</p>
                <div className="prices flex w-full justify-between items-center text-white font-semibold">
                    <span className="bg-green-600 px-3 py-1 rounded-xl"> ₹{item.price}</span>
                    <span className="flex items-center bg-blue-600 px-3 py-1 rounded-xl w-fit">Stock: {item.quantity}</span>
                </div>
                <div className="addTocart w-full border-2 border-black justify-center items-center flex p-1 rounded-xl cursor-pointer"
                >
                    {user.role === "ADMIN" ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span> :
                        count === 0 ? <span onClick={handleCart} className="w-full text-center"> Add To Cart </span> :
                            <div className="flex justify-between items-center w-full">
                                {count === 1 ? <MdOutlineDeleteForever className="text-xl" onClick={handleDelete} /> :
                                    <FaMinus className='text-xl' onClick={handleDecrement} />}
                                <span>{count}</span>
                                <FaPlus onClick={handleIncrement} />
                            </div>
                    }
                </div>
            </div>

            <div className="absolute w-45 h-full top-0 left-0 translate-y-100 group-hover:translate-y-0 bg-black/60 text-white transition-all flex justify-center items-center font-bold capitalize">
                Read More
            </div>
        </div>
        // <Card className="w-full h-full" imgSrc={item.url} horizontal>
        //     <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        //         {item.title}
        //     </h5>
        //     <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-4">
        //         {item.description}
        //     </p>
        //     <div className="prices">
        //         <span>{item.price}</span>
        //         <span>{item.quantity}</span>
        //     </div>
        // </Card>
    );
}
