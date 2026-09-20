"use client"
import { useAppContext } from "@/app/hooks/AppContext";
import { removeBookFromCart, updateCart } from "@/app/components/utils/cartUtils";
import { addWishlist, removeWishlist } from "@/app/components/utils/commonUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useCartStore, useUserAccessStore, useUserStore, useWishListStore } from "@/app/hooks/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaRegStar, FaStar } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";
import { deleteBook } from "@/app/components/utils/bookUtils";
import Link from "next/link";

export default function BookCard({ book, mode }) {

    const { user } = useUserStore();
    const { router } = useAppContext();
    const { carts, incrementCartItem, decrementCartItem, customCartItem } = useCartStore();
    const count = carts?.find((item) => item.bookId === book.id)?.count || 0;
    const [customCount, setCustomCount] = useState(count);
    const queryClient = useQueryClient();
    const { wishlist } = useWishListStore();
    const [star, setStar] = useState(false);
    const { userAccess } = useUserAccessStore();

    useEffect(() => {
        setCustomCount(count);
        setStar(wishlist?.includes(book.id))
    }, [count, wishlist]);

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
            if (response.status === 200) {
                queryClient.invalidateQueries({
                    queryKey: ["allCarts", user?.id]
                })
            }
        },
        onError: (error) => {
            showError(error.data.error);
        }
    })

    const { mutate: addWishlistMutation } = useMutation({
        mutationFn: () => addWishlist(book.id),
        onSuccess: (response) => {
            console.log(response);
        },
        onError: (error) => {
            console.log(error);
            showError("Error in adding to wishlist");
            setStar(false);
        }
    })

    const { mutate: removeWishlistMutation } = useMutation({
        mutationFn: () => removeWishlist(book.id),
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

    async function updatingCart(bookid, count, action) {
        try {
            console.log(bookid, count);
            const currentCart = useCartStore.getState().carts;
            console.log("newcart", currentCart);
            await updateCart(bookid, count);
            setCustomCount(count);
        } catch (error) {
            if (action === "increment") {
                decrementCartItem(book, user.id);
            }

            if (action === "decrement") {
                incrementCartItem(book, user.id);
            }

            if (action === "custom") {
                customCartItem(book, user.id, count);
            }
            showError("Couldn't update Cart");
            console.log("Error in updating cart: ", error);
        }
    }


    function handleModal() {
        router.push(`/bookstore/modal/${book.id}`)
    }

    function handleIncrement() {
        console.log(updatePending, deletePending)
        if (updatePending || deletePending) return;
        if (customCount + 1 > book.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = customCount + 1;
        incrementCartItem(book, user.id, newCount);
        updateCartMutation({ bookid: book?.id, count: newCount, action: "increment" });
    }

    function handleDecrement() {
        if (updatePending || customCount === 0) return;
        var newCount = customCount - 1;
        if (customCount > book.quantity) {
            newCount = book.quantity;
        }
        decrementCartItem(book, user.id, newCount);
        updateCartMutation({ bookid: book?.id, count: newCount, action: "decrement" });
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
        decrementCartItem(book, user.id, newCount);
        updateCartMutation({ bookid: book?.id, count: newCount, action: "custom" });
    }

    function handleEdit() {
        router.push(`/bookstore/${book.id}`);
    }

    function handleDeleteCart() {
        deleteCartMutation({ bookid: book.id });
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

    return (
        <div className={` w-100 h-65 relative flex gap-1 shadow-md shadow-(color:--shadow) rounded-xl cursor-pointer p-1 m-1 overflow-hidden hover:scale-105 transition-transform group`}>
            {book.quantity <= 0 ?
                <div className="absolute -left-20 top-0 -rotate-45 bg-red-700 text-white w-100 flex text-center p-1 z-10 pl-20">
                    Not Available
                </div> :
                book.quantity < customCount && user?.role === "USER" ?
                    <div className="absolute -left-25 top-0 -rotate-45 bg-green-700 text-white w-100 flex text-center pl-25 p-1 z-10">
                        Invalid Stock
                    </div> : null
            }
            <img src={book?.url} className={`${book.quantity <= 0 ? "opacity-75" : "opacity-100"} left grid grid-cols-1 w-9/20 h-full object-cover rounded-l-xl`} />
            <div className="right w-55 flex flex-col gap-1 items-center justify-between py-2 px-3">
                <h4 className="font-bold text-2xl capitalize">{book?.title}</h4>
                <p className="line-clamp-4">{book?.description}</p>
                <div className="prices flex w-full justify-between items-center text-white font-semibold mt-auto">
                    <span className="bg-green-600 px-3 py-1 rounded-xl"> ₹{book?.price}</span>
                    <span className="flex items-center bg-blue-600 px-3 py-1 rounded-xl w-fit">Stock: {book?.quantity}</span>
                </div>
                <div className={`buttons grid 
                    ${mode === "withOutLogin"
                        ? "grid-cols-1 justify-items-center"
                        : user?.role === "ADMIN"
                            ? userAccess?.authenticated
                                ? "grid-cols-[1fr_1fr] w-fit"
                                : "grid-cols-1 justify-items-center"
                            : user?.role === "SUPERUSER"
                                ? "grid-cols-[1fr_1fr] w-fit"
                                : "grid-cols-[1fr_0.2fr]"} gap-1 items-center w-full mt-auto`}>
                    <div className="addTocart w-full border-2 border-(--foreground) justify-center flex p-1 rounded-xl cursor-pointer"
                    >
                        {mode === "withOutLogin"
                            ? <Link href="/user/login" className="w-full text-center">Login to Explore</Link>
                            : user?.role === "ADMIN"
                                ? userAccess?.authenticated
                                    ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span>
                                    : <span className="w-full text-center">No Access</span>
                                : user?.role === "SUPERUSER"
                                    ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span>
                                    : book.quantity === 0
                                        ? mode === "cartView"
                                            ? <span className="w-full text-center" onClick={handleDeleteCart}>Delete From Cart</span>
                                            : <span className="w-full text-center">Not Available</span>
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
                    {mode !== "withOutLogin" && ((user?.role === "ADMIN" && userAccess?.authenticated) || user?.role === "SUPERUSER") &&
                        <span onClick={handleDeleteBook} className="w-full text-center border-2 border-(--foreground) rounded-xl p-1 items-center bg-(--foreground) text-(--background)">Delete</span>}
                    {mode !== "withOutLogin" && user?.role == "USER" && mode !== "cart" ? star ? <FaStar className="text-2xl text-yellow-500 cursor-pointer" onClick={handleWishlist} /> :
                        <FaRegStar className=" text-2xl cursor-pointer" onClick={handleWishlist} /> : ""}
                </div>
            </div>

            {mode !== "withOutLogin" && <div className="absolute w-45 h-full top-0 left-0 translate-y-100 group-hover:translate-y-0 bg-black/60 text-white transition-all flex justify-center items-center font-bold capitalize"
                onClick={() => handleModal(book?.id)}>
                Read More
            </div>}
        </div>
    );
}
