import counterSchema from "../Schema/counter.schema.js";

export async function generatedId() {
    const counter = await counterSchema.findByIdAndUpdate(
        "cartid",
        { $inc: { sequence: 1 } },
        {
            returnDocument: "after",
            upsert: true
        }
    );

    return `CRT${String(counter.sequence).padStart(13, "0")}`;
}

export function successResponse(message, data = null) {
    return { success: true, message: message, data: data, error: null };
}

export function errorResponse(errorMessage, error) {
    return { success: false, message: errorMessage, data: null, error: error };
}