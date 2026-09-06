import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    bookId: {
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
    location: {
        latitude: String,
        longitude: String,
        display_name: String,
    },
    userDtls: {
        deliveryname: String,
        deliveryphone: String,
    },
    deliveryDate: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);