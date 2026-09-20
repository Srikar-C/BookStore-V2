"use client";
import { useAppContext } from "@/app/hooks/AppContext";
import { deleteBook, getBook, getBookSuggestions } from "@/app/components/utils/bookUtils";
import { removeBookFromCart, updateCart } from "@/app/components/utils/cartUtils";
import { addWishlist, removeWishlist } from "@/app/components/utils/commonUtils";
import { showError } from "@/app/components/utils/showToasts";
import { useCartStore, useUserAccessStore, useUserStore, useWishListStore } from "@/app/hooks/useStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaRegStar, FaStar } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";
import BookCard from "../../components/BookCard";
import "@/app/styles.css";

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
    const { userAccess } = useUserAccessStore();

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
        queryKey: ["suggestions", bookData],
        queryFn: () => getBookSuggestions(bookData),
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

    const { mutate: updateCartMutation, isPending: updatePending } = useMutation({
        mutationFn: ({ bookid, count, action }) => updatingCart(bookid, count, action),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["allCarts", user?.id]
            });
        },
        onError: () => {
            showError("Couldn't update Cart");
        }
    })

    const { mutate: deleteCartMutation, isPending: deletePending } = useMutation({
        mutationFn: ({ bookid }) => removeBookFromCart(bookid),
        onSuccess: (response) => {
            //  const result = response.data;
            if (response.status === 200) {
                // showSuccess(result.message);
                queryClient.invalidateQueries({
                    queryKey: ["allCarts", user?.id]
                })
            }
        },
        onError: (error) => {
            showError(error.data.error);
        }
    })

    async function updatingCart(bookid, count, action) {
        try {
            console.log(bookid, count);
            const currentCart = useCartStore.getState().carts;
            console.log("newcart", currentCart);
            await updateCart(bookid, count);
            setCustomCount(count);
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

    function handleIncrement() {
        console.log(updatePending, deletePending)
        if (updatePending || deletePending) return;
        if (customCount + 1 > bookData.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = customCount + 1;
        console.log("data is: ", bookData, newCount);
        incrementCartItem(bookData, user.id, newCount);
        updateCartMutation({ bookid: bookData?.id, count: newCount, action: "increment" });
    }

    function handleDecrement() {
        if (updatePending || customCount === 0) return;
        var newCount = customCount - 1;
        if (customCount > bookData.quantity) {
            newCount = bookData.quantity;
        }
        decrementCartItem(bookData, user.id, newCount)
        updateCartMutation({ bookid: bookData?.id, count: newCount, action: "decrement" });
    }

    function handleCount(e) {
        setCustomCount(e.target.value);
        console.log("targetvalue: ", e.target.value);
        if (e.target.value === "" || e.target.value === " ") {
            return;
        }
        if (e.target?.value > bookData.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = e.target.value;
        decrementCartItem(bookData, user.id, newCount)
        updateCartMutation({ bookid: bookData?.id, count: newCount, action: "custom" });
    }

    function handleDeleteCart() {
        deleteCartMutation({ bookid: bookData.id });
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

    const { mutate: deletingBook, isPending: deleteBookPending } = useMutation({
        mutationFn: deleteBook,
        onSuccess: (response) => {
            showSuccess("Book Deleted");
            queryClient.invalidateQueries({
                queryKey: ["allBooks"]
            })
        },
        onError: (error) => {
            showError("Error in deletion");
            console.log(error);
        }
    })

    function handleDeleteBook() {
        console.log("clicked", deleteBookPending)
        if (deleteBookPending) return;
        deletingBook(book.id);
    }

    if (isPending) {
        return <div>Loading....</div>
    }

    return (
        <div className="relative flex flex-col gap-4 overflow-y-auto w-full h-full bg-(--background) rounded-l-xl p-3 custom-scrollbar">
            <div className="full-details h-80 flex gap-3 p-1 items-center">
                <img src={bookData.url} className="rounded-xl w-60 h-70" />
                <div className="details grid grid-cols-[0.2fr_1fr] gap-4 items-start content-start w-full">
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
                    <div className="col-span-2 flex gap-6 w-[70%]">
                        <div className="btns grid grid-cols-[1fr_1fr] mt-auto items-center gap-4 w-[60%]">
                            <div className="addTocart w-full bg-(--input-icon) text-white font-semibold justify-center flex px-1 py-2 rounded-xl cursor-pointer">
                                {user?.role === "ADMIN"
                                    ? userAccess?.authenticated
                                        ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span>
                                        : <span className="w-full text-center">No Access</span>
                                    : user?.role === "SUPERUSER"
                                        ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span>
                                        : bookData?.quantity == 0
                                            ? <span className="w-full text-center">Not Available</span>
                                            : customCount === 0
                                                ? <span onClick={handleIncrement} className="w-full text-center"> Add To Cart </span>
                                                : (
                                                    <div className="flex justify-around items-center w-full">
                                                        {customCount === 1 ? <MdOutlineDeleteForever className="text-xl" onClick={handleDecrement} /> :
                                                            <FaMinus className='text-xl' onClick={handleDecrement} />}
                                                        <input value={customCount} onChange={handleCount} className="w-10 text-center border-none" />
                                                        <FaPlus onClick={handleIncrement} />
                                                    </div>
                                                )
                                }
                            </div>
                            {((user?.role === "ADMIN" && userAccess?.authenticated) || user?.role === "SUPERUSER") &&
                                <div className="addTocart w-full bg-(--foreground) text-(--background) font-semibold justify-center flex px-1 py-2 rounded-xl cursor-pointer">
                                    <span onClick={handleDeleteBook}
                                        className="w-full text-center">
                                        Delete
                                    </span>
                                </div>}
                        </div>
                        {user?.role === "USER" && <div className="absolute top-5 right-5 border-2 border-(--foreground) p-2 rounded-full cursor-pointer">
                            {star ? <FaStar className="text-2xl text-yellow-500 ml-auto" onClick={handleWishlist} /> :
                                <FaRegStar className=" text-2xl" onClick={handleWishlist} />}
                        </div>}
                    </div>
                </div>
            </div>
            <hr className="text-(--hr)" />
            <div className="suggestions flex flex-col gap-3 p-1">
                <h3 className="text-3xl text-(--foreground) font-semibold">You May Also Like</h3>
                <div className="suggestions w-full h-full overflow-x-auto custom-scrollbar">
                    <div className="flex gap-3 w-max pb-3 items-center">
                        {suggestionsPending ? (
                            <p>Loading suggestions...</p>
                        ) : (
                            suggestBooks?.length > 0 ?
                                suggestBooks?.map((item, index) => (
                                    <BookCard key={index} book={item} mode="suggestions" />
                                )) : <p>No suggestions...</p>
                        )}
                        <span className="text-wrap w-fit text-center cursor-pointer shadow-sm shadow-(color:--shadow) p-2 rounded-2xl -ml-10 mr-1 bg-(--foreground) text-(--background) h-fit items-center" onClick={() => {
                            router.push("/bookstore")
                        }}>View More</span>
                    </div>
                </div>
            </div>
        </div>
    )
}