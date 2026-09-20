import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import CartRouter from "./Router/carts.router.js";
import cookieParser from "cookie-parser";
import requestId from "./util/requestId.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8082;
const mongoUri = process.env.NEXT_PUBLIC_API_Cart || "mongodb://localhost:27017/bookstore-cart";

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(requestId);

app.use(CartRouter);

mongoose
    .connect(mongoUri)
    .then((response) => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.log("Error connecting to database", err);
    });


app.listen(port, () => {
    console.log(`Cart Server is running on http://localhost:${port}`);
});