import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function OrderPieChart({ ordersData }) {

    const COLORS = [
        "#22c55e",
        "#f59e0b",
        "#3b82f6",
        "#ef4444",
    ];

    const allOrders = ordersData.data;

    const deliveryCount = allOrders.reduce((sum, order) => (
        sum + (order?.deliveryDtls?.deliveryStatus === "delivered")
    ), 0);

    const pendingCount = allOrders.reduce((sum, order) => (
        sum + (order?.deliveryDtls?.deliveryStatus === "pending")
    ), 0);

    const cancelledCount = allOrders.reduce((sum, order) => (
        sum + (order?.deliveryDtls?.deliveryStatus === "cancelled")
    ), 0);

    const shippedCount = allOrders.reduce((sum, order) => (
        sum + (order?.deliveryDtls?.deliveryStatus === "shipped")
    ), 0);



    const data = [
        {
            name: "Delivered",
            value: deliveryCount,
        },
        {
            name: "Shipped",
            value: shippedCount,
        },
        {
            name: "Packed",
            value: pendingCount,
        },
        {
            name: "Cancelled",
            value: cancelledCount,
        },
    ];

    return (
        <div className="w-[50%] h-90">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip />

                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}