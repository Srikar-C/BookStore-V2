import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
    },
    books: [orderItemSchema],
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    locationDtls: {
        latitude: String,
        longitude: String,
        display_name: String,
    },
    userDtls: {
        deliveryname: String,
        deliveryphone: String,
    },
    deliveryDtls: {
        deliveryDate: {
            type: Date,
            required: true,
        },
        deliveryStatus: {
            type: String,
            enum: ["pending", "shipped", "delivered", "cancelled"],
            default: "pending"
        }
    },
}, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);