"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { updateCart } from "@/app/components/utils/cartUtils";
import { showError } from "@/app/components/utils/showToasts";
import { useCartItemsStore, useUserStore } from "@/app/hooks/useStore";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";

export default function BookCard({ book }) {

    const { user } = useUserStore();
    const { router } = useAppContext();
    const { cartItems, incrementCartItem, decrementCartItem } = useCartItemsStore();
    const count = cartItems.find((item) => item.bookId === book.id)?.count || 0;

    async function updatingCart(newCount, action) {
        try {
            console.log(user?.id, book?.id, newCount);
            const currentCart = useCartItemsStore.getState().cartItems;
            console.log("newcart", currentCart);
            await updateCart(user?.id, book?.id, newCount);
        } catch (error) {
            if (action === "increment") {
                decrementCartItem(book, user.id);
            }

            if (action === "decrement") {
                incrementCartItem(book, user.id);
            }
            showError("Couldn't update Cart");
            console.log("Error in updating cart: ", error);
        }
    }


    function handleModal() {
        router.push(`/bookstore/modal/${book.id}`)
    }

    function handleIncrement() {
        if (count >= book.quantity) {
            showError("No More Stocks");
            return;
        }
        const newCount = count + 1;
        incrementCartItem(book, user.id);
        updatingCart(newCount, "increment");
    }

    function handleDecrement() {
        if (count === 0) return;
        const newCount = count - 1;
        decrementCartItem(book, user.id)
        updatingCart(newCount, "decrement");
    }

    function handleEdit() {
        router.push(`/bookstore/${book.id}`);
    }

    return (
        <div className="w-100 h-65 relative flex gap-1 shadow-md shadow-(color:--shadow) rounded-xl cursor-pointer p-1 m-1 overflow-hidden hover:scale-105 transition-transform group">
            <img src={book?.url} className="left flex w-9/20 h-full object-cover rounded-l-xl" />
            <div className="right w-55 flex flex-col gap-1 items-center justify-between py-2 px-3">
                <h4 className="font-bold text-2xl capitalize">{book?.title}</h4>
                <p className="line-clamp-4">{book?.description}</p>
                <div className="prices flex w-full justify-between items-center text-white font-semibold">
                    <span className="bg-green-600 px-3 py-1 rounded-xl"> ₹{book?.price}</span>
                    <span className="flex items-center bg-blue-600 px-3 py-1 rounded-xl w-fit">Stock: {book?.quantity}</span>
                </div>
                <div className="addTocart w-full border-2 border-(--foreground) justify-center items-center flex p-1 rounded-xl cursor-pointer"
                >
                    {user?.role === "ADMIN" ? <span onClick={handleEdit} className="w-full text-center">Edit Book</span> :
                        count === 0 ? <span onClick={handleIncrement} className="w-full text-center"> Add To Cart </span> :
                            <div className="flex justify-around items-center w-full">
                                {count === 1 ? <MdOutlineDeleteForever className="text-xl" onClick={handleDecrement} /> :
                                    <FaMinus className='text-xl' onClick={handleDecrement} />}
                                <span>{count}</span>
                                <FaPlus onClick={handleIncrement} />
                            </div>
                    }
                </div>
            </div>

            <div className="absolute w-45 h-full top-0 left-0 translate-y-100 group-hover:translate-y-0 bg-black/60 text-white transition-all flex justify-center items-center font-bold capitalize"
                onClick={() => handleModal(book?.id)}>
                Read More
            </div>
        </div>
    );
}
