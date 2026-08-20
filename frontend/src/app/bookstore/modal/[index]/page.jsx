"use client";
import { useAppContext } from "@/app/components/common/AppContext";
import { getBook, getSuggestions } from "@/app/components/utils/bookUtils";
import { updateCart } from "@/app/components/utils/cartUtils";
import { useCartItemsStore, useUserStore } from "@/app/hooks/useStore";
import { Marquee } from "@/components/ui/marquee";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";

export default function Modal() {
    const { index } = useParams();
    const { user } = useUserStore();
    const { router } = useAppContext();
    const { cartItems, incrementCartItem, decrementCartItem } = useCartItemsStore();
    const count = cartItems.find((item) => item.bookId === index)?.count || 0;

    const { data: bookData, isPending } = useQuery({
        queryKey: ["indexedBook", index],
        queryFn: () => getBook(index),
        enabled: !!index,
        select: (response) => response.data.data
    });

    const { data: suggestBooks, isPending: suggestionsPending } = useQuery({
        queryKey: ["suggestions", bookData?.category],
        queryFn: () => getSuggestions(bookData.category),
        enabled: !!bookData?.category,
        select: (response) => response.data.data
    });

    const filteredSuggestions = suggestBooks?.filter((prev) => {
        return prev.id != index
    })

    if (isPending) {
        return <div>Loading....</div>
    }


    async function updatingCart(newCount, action) {
        try {
            console.log(user?.id, bookData.id, newCount);
            const currentCart = useCartItemsStore.getState().cartItems;
            console.log("newcart", currentCart);
            await updateCart(user?.id, bookData.id, newCount);
        } catch (error) {
            if (action === "increment") {
                decrementCartItem(bookData, user.id);
            }

            if (action === "decrement") {
                incrementCartItem(bookData, user.id);
            }
            showError("Couldn't update Cart");
            console.log("Error in updating cart: ", error);
        }
    }

    function handleModal(id) {
        router.push(`/bookstore/modal/${id}`)
    }

    function handleIncrement() {
        if (count >= bookData.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = count + 1;
        incrementCartItem(bookData, user.id);
        updatingCart(newCount, "increment");
    }

    function handleDecrement() {
        if (count === 0) return;
        const newCount = count - 1;
        decrementCartItem(bookData, user.id)
        updatingCart(newCount, "decrement");
    }

    function handleEdit() {
        router.push(`/bookstore/${bookData.id}`);
    }

    return (
        <div className="w-full h-screen min-h-0 bg-(--background) rounded-xl p-4 flex flex-col gap-5 overflow-y-auto">
            <div className="h-80 flex gap-3 p-1 items-center border-2 border-black">
                <img src={bookData.url} className="rounded-xl w-55 h-full" />
                <div className="grid grid-cols-[0.2fr_1fr] gap-3 lg:gap-5 items-start content-start w-full">
                    <span className="font-semibold ">Title </span>
                    <h4 className="font-normal">{bookData?.title}</h4>
                    <span className="font-semibold ">Author </span>
                    <h4 className="font-normal">{bookData?.author}</h4>
                    <span className="font-semibold ">Description </span>
                    <h4 className="font-normal text-justify">{bookData?.description}.</h4>
                    <span className="font-semibold ">Price </span>
                    <h4 className="font-normal text-justify">₹{bookData?.price}</h4>
                    <span className="font-semibold ">Stock </span>
                    <h4 className="font-normal text-justify">{bookData?.quantity}</h4>
                    <div className="addTocart col-span-2 w-[30%] bg-(--input-icon) text-white font-semibold justify-center items-center flex px-1 py-2 rounded-xl cursor-pointer"
                    >
                        {user?.role === "ADMIN" ? <span onClick={handleEdit} className="text-center">Edit Book</span> :
                            count === 0 ? <span onClick={handleIncrement} className="text-center"> Add To Cart </span> :
                                <div className="flex justify-around items-center w-full">
                                    {count === 1 ? <MdOutlineDeleteForever className="text-xl" onClick={handleDecrement} /> :
                                        <FaMinus className='text-xl' onClick={handleDecrement} />}
                                    <span>{count}</span>
                                    <FaPlus onClick={handleIncrement} />
                                </div>
                        }
                    </div>
                </div>
            </div>
            {/* <hr className="text-(--hr)" />
            <h3 className="text-3xl text-(--foreground) font-semibold">Reviews</h3>
            <div className="reviews">
                <Marquee pauseOnHover vertical className="suggestions [--duration:20s] h-fit">
                    {suggestionsPending ? (
                        <p>Loading suggestions...</p>
                    ) : (
                        filteredSuggestions?.map((item) => (
                            <div className="mx-5" key={item.id} onClick={() => handleModal(item.id)}>
                                <img src={item.url} className="w-[150px] h-[200px]" />
                                <h5 className="text-lg">{item.title}</h5>
                            </div>
                        ))
                    )}
                </Marquee>
            </div> */}

            <hr className="text-(--hr)" />
            <h3 className="text-3xl text-(--foreground) font-semibold">Suggestions</h3>
            <div className="suggestions">
                <Marquee pauseOnHover className="suggestions [--duration:20s] h-fit">
                    {suggestionsPending ? (
                        <p>Loading suggestions...</p>
                    ) : (
                        filteredSuggestions?.map((item) => (
                            <div className="mx-5 cursor-pointer" key={item.id} onClick={() => handleModal(item.id)}>
                                <img src={item.url} className="w-37.5 h-50" />
                                <h5 className="text-lg">{item.title}</h5>
                            </div>
                        ))
                    )}
                </Marquee>
            </div>
        </div>
    )
}