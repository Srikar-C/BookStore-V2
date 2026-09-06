import express from "express";
import { generatedId } from "../util/orderUtil.js";
import useFetch from "../util/useFetch.js";
import orderModel from "../Schema/orders.schema.js";
import mongoose from "mongoose";

const router = express.Router();


router.post("/orders/checkout", async (req, res) => {
    const { orders } = req.body;
    console.log("Request: ", orders);
    try {
        const books = orders.books.filter(item => item.count > 0);
        const totalPrice = books.reduce((total, item) => {
            return total + (item.price * item.count);
        }, 0);

        // console.log("Checking cart existence");
        for (var i = 0; i < books.length; i++) {
            // console.log("id : ", books[i]);
            const bookResponse = await useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, books[i].bookId, "", false);
            const book = bookResponse.data.data;
            if (book.quantity < books[i].count) {
                console.log("Insufficient books");
                return res.status(409).json({ success: false, message: "Book Not Available, Please Cart again", data: null, error: "Insufficient Quantity" });
            }
        }

        //create order
        const order = new orderModel({
            _id: await generatedId(),
            userId: orders.userId,
            books: books,
            price: totalPrice,
            location: orders.location,
            userDtls: orders.userDtls,
            deliveryDate: orders.deliveryBy,
        })

        console.log("Created order: ", order);
        const createdOrder = await order.save();

        //updated Books
        const bookUpdate = await useFetch("put", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "", { books: order.books }, false);
        const bookRes = bookUpdate.data;
        if (bookRes.success) {
            console.log("books updation successful");
            const deleteCart = await useFetch("delete", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, orders.cartId, "", false);
            const deleteResponse = deleteCart.data;

            if (deleteResponse.success) {
                return res.status(200).json({ success: true, message: "Order Placed", data: null, error: null });
            }
        }
        return res.status(500).json({ success: false, message: "Error", data: null, error: null });
    } catch (error) {
        console.error("Error in creating order: ", error);
        return res.status(500).json({ success: false, message: "Error", data: null, error: error });
    }

});

router.get("/orders/:userid", async (req, res) => {
    const { userid } = req.params;
    console.log("userid of orders: ", userid);
    const page = Number(req.query.page) || 0;
    const size = Number(req.query.size) || 5;

    console.log(userid, page, size);

    //WITH PAGINATION
    try {
        const totalElements = await orderModel.countDocuments({ userId: userid });
        const totalPages = Math.ceil(totalElements / size);
        const orders = await orderModel.find({ userId: userid }).sort({ createdAt: -1 })
            .skip(page * size).limit(size)

        const data = {
            content: orders,
            totalElements: totalElements,
            totalPages: totalPages,
            isFirst: page === 0,
            isLast: page >= totalPages - 1,
            pageSize: size,
            pageNumber: page
        }
        return res.status(200).json({ success: true, message: "Orders Fetched Successfully", data: data, error: null });
    } catch (error) {
        console.error("Error in fetching user order: ", error);
        return res.status(500).json({ success: false, message: "Error", data: null, error: error });
    }

    //WITHOUT PAGINATION
    // try {
    //     const orders = await orderModel.find({ userId: userid });
    //     if (!orders) {
    //         return res.status(404).json({ success: true, message: "No orders", data: null, errror: null });
    //     }
    //     console.log("orders of userid: ", orders);
    //     return res.status(200).json({ success: true, message: "Orders Fetched Successfully", data: orders, errror: null });
    // } catch (error) {
    //     console.error("Error in fetching user order: ", error);
    //     return res.status(500).json({ success: false, message: "Error", data: null, error: error });
    // }
})

//with default id
router.post("/orders/orderId", async (req, res) => {
    const { orderid } = req.body;
    console.log(orderid);
    try {
        const orders = await orderModel.findOne({ _id: orderid });
        if (!orders) {
            return res.status(404).json({ success: true, message: "No orders", data: null, errror: null });
        }
        console.log("orders of userid: ", orders);
        return res.status(200).json({ success: true, message: "Order Fetched Successfully", data: orders, errror: null });
    } catch (error) {
        console.error("Error in fetching user order: ", error);
        return res.status(500).json({ success: false, message: "Error", data: null, error: error });
    }
})


export default router;