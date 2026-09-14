import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function OrderPieChart() {
    const data = [
        {
            name: "Delivered",
            value: 75,
        },
        {
            name: "Shipped",
            value: 12,
        },
        {
            name: "Pending",
            value: 8,
        },
        {
            name: "Cancelled",
            value: 5,
        },
    ];

    const COLORS = [
        "#22c55e",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
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