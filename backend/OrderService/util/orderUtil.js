import counterSchema from "../Schema/counter.schema.js";

export async function generatedId() {
    const counter = await counterSchema.findByIdAndUpdate(
        "orderid",
        { $inc: { sequence: 1 } },
        {
            returnDocument: "after",
            upsert: true
        }
    );

    return `ORD${String(counter.sequence).padStart(13, "0")}`;
}