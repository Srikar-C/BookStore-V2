"use client";
import { useAppContext } from "@/app/components/common/AppContext";
import { getBook, getBookSuggestions } from "@/app/components/utils/bookUtils";
import { updateCart } from "@/app/components/utils/cartUtils";
import { addWishlist, removeWishlist } from "@/app/components/utils/commonUtils";
import { showError } from "@/app/components/utils/showToasts";
import { useCartStore, useUserStore, useWishListStore } from "@/app/hooks/useStore";
import { Marquee } from "@/components/ui/marquee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaRegStar, FaStar } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";

export default function Modal() {
    const { index } = useParams();
    const { user } = useUserStore();
    const { router } = useAppContext();
    const { carts, incrementCartItem, decrementCartItem } = useCartStore();
    const count = carts.find((item) => item.bookId === index)?.count || 0;
    const [customCount, setCustomCount] = useState(count);
    const { wishlist } = useWishListStore();
    const [star, setStar] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        setCustomCount(count);
        setStar(wishlist?.includes(index))
    }, [count, wishlist]);

    const { data: bookData, isPending } = useQuery({
        queryKey: ["indexedBook", index],
        queryFn: () => getBook(index),
        enabled: !!index,
        select: (response) => response.data.data
    });

    const { data: suggestBooks, isPending: suggestionsPending } = useQuery({
        queryKey: ["suggestions", bookData?.category],
        queryFn: () => getBookSuggestions(bookData.category),
        enabled: !!bookData?.category,
        select: (response) => response.data.data
    });

    const { mutate: addWishlistMutation } = useMutation({
        mutationFn: () => addWishlist(index),
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({
                queryKey: ["wishlist", user?.id]
            })
        },
        onError: (error) => {
            console.log(error);
            showError("Error in adding to wishlist");
            setStar(false);
        }
    })

    const { mutate: removeWishlistMutation } = useMutation({
        mutationFn: () => removeWishlist(index),
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({
                queryKey: ["wishlist", user?.id]
            })
        },
        onError: (error) => {
            console.log(error);
            showError("Error in removing to wishlist");
            setStar(true);
        }
    })

    const filteredSuggestions = suggestBooks?.filter((prev) => {
        return prev.id != index
    })

    if (isPending) {
        return <div>Loading....</div>
    }


    async function updatingCart(newCount, action) {
        try {
            console.log(user?.id, bookData.id, newCount);
            const currentCart = useCartStore.getState().carts;
            console.log("newcart", currentCart);
            await updateCart(user?.id, bookData.id, newCount);
            setCustomCount(newCount);
        } catch (error) {
            if (action === "increment") {
                decrementCartItem(bookData, user.id);
            }

            if (action === "decrement") {
                incrementCartItem(bookData, user.id);
            }

            if (action === "custom") {
                customCartItem(bookData, user.id, count);
            }
            showError("Couldn't update Cart");
            console.log("Error in updating cart: ", error);
        }
    }

    function handleModal(id) {
        router.push(`/bookstore/modal/${id}`)
    }

    function handleIncrement() {
        if (customCount + 1 > bookData.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = customCount + 1;
        incrementCartItem(bookData, user.id);
        updatingCart(newCount, "increment");
    }

    function handleDecrement() {
        if (customCount === 0) return;
        var newCount = customCount - 1;
        if (customCount > book.quantity) {
            newCount = book.quantity;
        }
        decrementCartItem(book, user.id, newCount)
        updatingCart(newCount, "decrement");
    }

    function handleCount(e) {
        setCustomCount(e.target.value);
        console.log("targetvalue: ", e.target.value);
        if (e.target.value === "" || e.target.value === " ") {
            return;
        }
        if (e.target?.value > book.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = e.target.value;
        decrementCartItem(book, user.id, newCount)
        updatingCart(newCount, "custom");
    }

    function handleEdit() {
        router.push(`/bookstore/${bookData.id}`);
    }

    function handleWishlist() {
        console.log("clicked", star);
        if (!star) {
            setStar(true);
            addWishlistMutation();
        }
        else {
            setStar(false);
            removeWishlistMutation();
        }
    }

    return (
        <div className="w-full relative h-screen min-h-0 bg-(--background) rounded-xl p-4 flex flex-col gap-5 overflow-y-auto">
            <div className="h-80 flex gap-3 p-1 items-center border-2 border-black">
                <img src={bookData.url} className="rounded-xl w-55 h-full" />
                <div className="grid grid-cols-[0.2fr_1fr] gap-3 items-start content-start w-full">
                    <span className="font-semibold ">Title </span>
                    <h4 className="font-normal">{bookData?.title}</h4>
                    <span className="font-semibold ">Author </span>
                    <h4 className="font-normal">{bookData?.author}</h4>
                    <span className="font-semibold ">Description </span>
                    <h4 className="font-normal text-justify max-w-[90%]">{bookData?.description}.</h4>
                    <span className="font-semibold ">Price </span>
                    <h4 className="font-normal text-justify">₹{bookData?.price}</h4>
                    <span className="font-semibold ">Stock </span>
                    <h4 className="font-normal text-justify">{bookData?.quantity}</h4>
                    <div className="addTocart col-span-2 w-[30%] bg-(--input-icon) text-white font-semibold justify-center items-center flex px-1 py-2 rounded-xl cursor-pointer"
                    >
                        {user?.role === "ADMIN" ?
                            <span onClick={handleEdit} className="w-full text-center">Edit Book</span> :
                            bookData.quantity === 0 ? <span className="w-full text-center cursor-not-allowed">Not Available</span> :
                                customCount === 0 ? <span onClick={handleIncrement} className="w-full text-center"> Add To Cart </span> :
                                    <div className="flex justify-around items-center w-full">
                                        {customCount === 1 ? <MdOutlineDeleteForever className="text-xl" onClick={handleDecrement} /> :
                                            <FaMinus className='text-xl' onClick={handleDecrement} />}
                                        <input value={customCount} onChange={handleCount} className="w-10 text-center border-none" />
                                        <FaPlus onClick={handleIncrement} />
                                    </div>
                        }
                    </div>
                    <div className="absolute top-5 right-5 border-2 border-(--foreground) p-2 rounded-full cursor-pointer">
                        {star ? <FaStar className="text-2xl text-yellow-500 ml-auto" onClick={handleWishlist} /> :
                            <FaRegStar className=" text-2xl" onClick={handleWishlist} />}
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