import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    userId: {
        type: String,
        required: true
    },
    books: [cartItemSchema]
}, {
    timestamps: true
});

export default mongoose.model("Cart", cartSchema);