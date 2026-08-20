import axios from "axios";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cartModel from "../Schema/carts.schema.js";
import { generatedId } from "../util/cartUtils.js";
import useFetch from "../util/useFetch.js";

dotenv.config();

const router = express.Router();

router.put("/carts/updateCart", async (req, res) => {
    try {
        const { userid, bookid, count } = req.body;
        console.log(userid, bookid, count);
        const bookResponse = await useFetch("get", process.env.NEXT_PUBLIC_API_Book, process.env.NEXT_PUBLIC_MAPPING_Book, bookid, "", false);
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
                console.log("Cart created: ", created);
                return res.status(201).json({ success: true, message: "Cart Updated", data: created, error: null });
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
                console.log("Cart Updated: ", updated);
                return res.status(201).json({ success: true, message: "Cart Updated", data: updated, error: null });
            }
        }
    } catch (error) {
        console.error("Error in updating Cart: ", error);
        return res.status(500).json({ success: false, message: "Something Went Wrong", data: null, error: error });
    }
})

router.get("/carts/:userid", async (req, res) => {
    const { userid } = req.params;
    console.log("userid: ", userid);
    try {
        let carts = await cartModel.findOne({ userId: userid });
        console.log("Fetched Carts: ", carts);
        return res.status(200).json({ success: true, message: "Fetched Carts", data: carts, error: null });
    } catch (error) {
        console.error("Error in updating Cart: ", error);
        return res.status(500).json({ success: false, message: "Something Went Wrong", data: null, error: error });
    }
})

export default router;