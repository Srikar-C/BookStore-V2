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