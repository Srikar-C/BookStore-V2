import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OrderRouter from "./Router/orders.router.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8083;
const mongoUri = process.env.NEXT_PUBLIC_API_Order || "mongodb://localhost:27017/bookstore-order";

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(OrderRouter);

mongoose
    .connect(mongoUri)
    .then((response) => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.log("Error connecting to database", err);
    });


app.listen(port, () => {
    console.log(`Order Server is running on http://localhost:${port}`);
});