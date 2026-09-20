import cron from "node-cron";
import orderModel from "../Schema/orders.schema.js";

export function startOrderScheduler() {
    cron.schedule("* * * * *", async () => {
        console.log("Scheduler Running");
        const now = new Date();
        try {
            const startOfToday = new Date(now);

            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

            await orderModel.updateMany(
                {
                    "deliveryDtls.deliveryStatus": "shipped",
                    "deliveryDtls.deliveryDate": { $lt: startOfToday }
                },
                {
                    $set: {
                        "deliveryDtls.deliveryStatus": "delivered"
                    }
                }
            )

            const orders = await orderModel.find({
                "deliveryDtls.deliveryStatus": "pending",
                "deliveryDtls.deliveryDate": {
                    $gte: startOfTomorrow
                }
            });

            for (const order of orders) {
                const createdAt = new Date(order.createdAt);
                const deliveryDate = new Date(order.deliveryDtls.deliveryDate);
                const halfwayDate = new Date(createdAt.getTime() + (deliveryDate.getTime() - createdAt.getTime()) / 2);

                if (now >= halfwayDate) {
                    await orderModel.updateOne(
                        { _id: order._id },
                        {
                            $set: {
                                "deliveryDtls.deliveryStatus": "shipped"
                            }
                        }
                    );
                }
            }
        } catch (error) {
            console.error("Scheduler error:", error);
        } finally {
            console.log("Scheduler finished")
        }
    })
}