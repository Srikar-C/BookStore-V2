import express from "express";
import { errorResponse, generatedId, successResponse } from "../util/orderUtil.js";
import useFetch from "../util/useFetch.js";
import orderModel from "../Schema/orders.schema.js";
import { getAuthenticatedUserId } from "../util/auth.js";

const router = express.Router();


router.post("/orders/checkout", async (req, res) => {
    const { orders } = req.body;
    console.log("Request: ", orders);
    try {
        const userid = getAuthenticatedUserId(req);
        if (!userid) {
            return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
        }
        if (!orders || !Array.isArray(orders.books) || !orders.cartId || !orders.deliveryDtls) {
            return res.status(400).json(errorResponse("Invalid order request", "Missing required order fields"));
        }
        const books = orders.books.filter(item => item.count > 0);
        if (books.length === 0) {
            return res.status(400).json(errorResponse("Order must contain books", "No books to order"));
        }
        const totalPrice = books.reduce((total, item) => {
            return total + (item.price * item.count);
        }, 0);

        // console.log("Checking cart existence");
        for (var i = 0; i < books.length; i++) {
            // console.log("id : ", books[i]);
            const bookResponse = await useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, books[i].bookId, "", false, req.requestId);
            const book = bookResponse.data.data;
            if (book.quantity < books[i].count) {
                console.log("Insufficient books");
                return res.status(409).json(errorResponse("Book Not Available, Please Cart again", "Insufficient Quantity"));
            }
        }

        //create order
        const order = new orderModel({
            _id: await generatedId(),
            userId: userid,
            books: books,
            price: totalPrice,
            locationDtls: orders.locationDtls,
            userDtls: orders.userDtls,
            deliveryDtls: orders.deliveryDtls,
        })

        console.log("Created order: ", order);
        await order.save();

        //updated Books
        const bookUpdate = await useFetch("put", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "", { books: order.books }, false, req.requestId);
        const bookRes = bookUpdate.data;
        if (bookRes.success) {
            console.log("books updation successful");
            const deleteCart = await useFetch("delete", process.env.NEXT_PUBLIC_API_Cart, process.env.NEXT_PUBLIC_MAPPING_Cart, orders.cartId, "", false, req.requestId);
            const deleteResponse = deleteCart.data;

            if (deleteResponse.success) {
                return res.status(200).json(successResponse("Order Placed"));
            }
            return res.status(502).json(errorResponse("Order could not be completed", "Cart cleanup failed"));
        }
        return res.status(502).json(errorResponse("Order could not be completed", "Book stock update failed"));
    } catch (error) {
        console.error("Error in creating order: ", error);
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }

});

router.get("/orders/me", async (req, res) => {
    const userid = getAuthenticatedUserId(req);
    if (!userid) {
        return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
    }
    console.log("userid of orders: ", userid);
    const page = Number(req.query.page) || 0;
    const size = Number(req.query.size) || 5;

    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 100) {
        return res.status(400).json(errorResponse("Invalid pagination values", "Page must be non-negative and size must be 1-100"));
    }

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
        return res.status(200).json(successResponse("Orders Fetched Successfully", data));
    } catch (error) {
        console.error("Error in fetching user order: ", error);
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
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
    const userid = getAuthenticatedUserId(req);
    if (!userid) {
        return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
    }
    if (!orderid) {
        return res.status(400).json(errorResponse("Invalid order id", "Order id is required"));
    }
    try {
        const orders = await orderModel.findOne({ _id: orderid, userId: userid });
        if (!orders) {
            return res.status(404).json(errorResponse("Order not found", "Order not found"));
        }
        console.log("returing order dtls: ", orders);
        return res.status(200).json(successResponse("Order Fetched Successfully", orders));
    } catch (error) {
        console.error("Error in fetching user order: ", error);
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

router.post("/orders/count", async (req, res) => {
    const userid = getAuthenticatedUserId(req);
    if (!userid) {
        return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
    }
    console.log("userid for count: ", userid);
    try {

        const result = await orderModel.aggregate([
            {
                $match: { userId: userid },
            },
            {
                $project: {
                    bookCount: { $size: "$books" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBooks: { $sum: "$bookCount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ])

        const data = result[0] || {
            totalBooks: 0, totalOrders: 0,
        }

        // const count = await orderModel.countDocuments({ userId: userid });

        // const orders = await orderModel.find({ userId: userid });
        // console.log("all units: ", orders);

        // var units = 0;
        // for (var i = 0; i < orders.length; i++) {
        //     units += orders[i].books.length;
        // }

        // console.log("total units: ", units);

        return res.status(200).json(successResponse("Order count fetched successfully", data));
    } catch (error) {
        console.error("Error in fetching user order: ", error);
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

router.delete("/orders/:userid", async (req, res) => {
    const { userid } = req.params;
    console.log("delte userid: ", userid);
    try {
        const orders = await orderModel.deleteMany({ userId: userid });
        return res.status(200).json(successResponse("Orders Delete", null));
    } catch (error) {
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

router.post("/orders/countOrders", async (req, res) => {

    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0 || userIds.some(userId => !userId)) {
        return res.status(400).json(errorResponse("Invalid user ids", "A non-empty array of user ids is required"));
    }
    console.log("order count of user ", userIds);
    try {
        const result = await orderModel.aggregate([
            {
                $match: {
                    userId: { $in: userIds }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalElements: { $sum: 1 }
                }
            }
        ]);

        const orderCountByUserId = new Map(result.map(item => [item._id, item.totalElements]));
        const finalResult = userIds.map((userId) => {
            return {
                userId: userId,
                orderCount: orderCountByUserId.get(userId) ?? 0,
            }
        })

        console.log("result of order:", finalResult);
        return res.status(200).json(successResponse("Orders Count Fetched", finalResult));
    } catch (error) {
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

router.get("/orders", async (req, res) => {
    try {
        const allorders = await orderModel.find();
        return res.status(200).json(successResponse("Orders Fetched", allorders));
    } catch (error) {
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

router.delete("/orders/orders/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await orderModel.findOne({ _id: orderId });
        const books = order?.books.map((item) => {
            return {
                bookId: item.bookId,
                count: item.count,
            }
        })

        //revert books
        const bookResponse = await useFetch("put", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, "updateBooks", { books: books }, false, req.requestId)
        const bookResult = bookResponse.data;
        console.log("bookresult", bookResult);
        if (bookResult.success) {
            order.deliveryDtls.deliveryStatus = "cancelled";
            await order.save();
            return res.status(200).json(successResponse("Order Cancelled Successfully"));
        }
    } catch (error) {
        return res.status(500).json(errorResponse("Error occured in Placing Order", error));
    }
})

export default router;