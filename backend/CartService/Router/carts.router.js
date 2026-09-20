import axios from "axios";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cartModel from "../Schema/carts.schema.js";
import { errorResponse, generatedId, successResponse } from "../util/cartUtils.js";
import useFetch from "../util/useFetch.js";
import { getAuthenticatedUserId } from "../util/auth.js";

dotenv.config();

const router = express.Router();

router.put("/carts/updateCart", async (req, res) => {
    try {
        const { bookid, count } = req.body;
        const userid = getAuthenticatedUserId(req);
        if (!userid) {
            return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
        }
        if (!bookid || !Number.isInteger(count) || count < 0) {
            return res.status(400).json(errorResponse("Invalid cart request", "User, book, and non-negative integer count are required"));
        }
        console.log(userid, bookid, count);
        const bookResponse = await useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, bookid, "", false, req.requestId);
        const book = bookResponse.data.data;
        if (book.quantity >= count) {
            let cart = await cartModel.findOne({ userId: userid });
            if (!cart) {
                cart = new cartModel({
                    _id: await generatedId(),
                    userId: userid,
                    books: [{
                        bookId: bookid,
                        count: count
                    }]
                });
                const created = await cart.save();
                return res.status(201).json(successResponse("Cart Updated", created));
            }
            else {
                const cartItems = cart.books.find(item => item.bookId.toString() === bookid);
                if (cartItems) {
                    cartItems.count = count;
                    if (cartItems.count <= 0) {
                        cart.books.pull(cartItems._id);
                    }
                }
                else {
                    cart.books.push({
                        bookId: bookid,
                        count: count
                    })
                }
                const updated = await cart.save();
                return res.status(201).json(successResponse("Cart Updated", updated));
            }
        }
        return res.status(409).json(errorResponse("Cart quantity exceeds available stock", "Insufficient Quantity"));
    } catch (error) {
        console.error("Error in updating Cart: ", error);
        return res.status(500).json(errorResponse("Something Went Wrong", error));
    }
})

router.get("/carts/me", async (req, res) => {
    const userid = getAuthenticatedUserId(req);
    if (!userid) {
        return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
    }
    try {
        let carts = await cartModel.findOne({ userId: userid });
        return res.status(200).json(successResponse("Fetched Carts", carts));
    } catch (error) {
        console.error("Error in updating Cart: ", error);
        return res.status(500).json(errorResponse("Something Went Wrong", error));
    }
})

router.delete("/carts/deleteBook", async (req, res) => {
    try {
        const { bookid } = req.body;
        const userid = getAuthenticatedUserId(req);
        if (!userid) {
            return res.status(401).json(errorResponse("Not authenticated", "Valid credentials are required"));
        }
        if (!bookid) {
            return res.status(400).json(errorResponse("Invalid cart request", "Book is required"));
        }
        let cart = await cartModel.findOneAndUpdate(
            { userId: userid },
            {
                $pull: {
                    books: { bookId: bookid }
                }
            },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json(errorResponse("Cart not found", "Cart not found"));
        }
        return res.status(200).json(successResponse("Book removed from cart", cart));
    } catch (error) {
        console.error("Error in updating Cart: ", error);
        return res.status(500).json(errorResponse("Something Went Wrong", error));
    }
});


router.delete("/carts/:cartid", async (req, res) => {
    const { cartid } = req.params;
    try {
        const cart = await cartModel.findByIdAndDelete(cartid);
        if (!cart) {
            return res.status(404).json(errorResponse("Cart Not available", "Cart not found"));
        }
        return res.status(200).json(successResponse("Cart Reseted"));
    } catch (error) {
        console.error("Error in resetting cart: ", error);
        return res.status(500).json(errorResponse("Exception", error));
    }
});

router.delete("/carts", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json(errorResponse("Not authenticated", "Not authenticated"));
    }
    try {
        const userid = getAuthenticatedUserId(req);
        if (!userid) {
            return res.status(401).json(errorResponse("Not authenticated", "Invalid or expired token"));
        }
        let cart = await cartModel.findOneAndDelete({ userId: userid });
        if (!cart) {
            return res.status(404).json(errorResponse("Cart not found", "Cart not found"));
        }
        return res.status(200).json(successResponse("Cart removed for user"));

    } catch (error) {
        console.error("Error in updating Cart: ", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json(errorResponse("Not authenticated", "Invalid or expired token"));
        }
        return res.status(500).json(errorResponse("Something Went Wrong", error));
    }
})

router.delete("/carts/user/:userid", async (req, res) => {
    const { userid } = req.params;
    try {
        await cartModel.deleteMany({ userId: userid });
        return res.status(200).json(successResponse("Orders Deleted"));
    } catch (error) {
        return res.status(500).json(errorResponse("Error", error));
    }
})

export default router;