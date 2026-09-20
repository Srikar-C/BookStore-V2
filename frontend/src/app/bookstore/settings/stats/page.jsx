"use client"
import { getDeliveryStatus } from "@/app/components/utils/FunctionalUtils";
import { getAllOrders } from "@/app/components/utils/orderUtils";
import { allUsersStats } from "@/app/components/utils/userUtils";
import { useBookStore } from "@/app/hooks/useStore"
import { useQuery } from "@tanstack/react-query";
import { BookOpenText, DollarSign, ShoppingBag, Users } from "lucide-react";
import OrderPieChart from "../components/OrderPieChart";
import "@/app/styles.css";

export default function Stats() {

    const { books } = useBookStore();

    const { data: ordersData, isPending: ordersPending } = useQuery({
        queryKey: ["allOrders"],
        queryFn: getAllOrders,
        select: (response) => response?.data,
    })

    const { data: usersData, isPending: usersPending } = useQuery({
        queryKey: ["allUsersStats"],
        queryFn: allUsersStats,
        select: (response) => response?.data,
    })

    if (ordersPending || usersPending) {
        return <div>....Loading</div>
    }

    const totalBooks = books?.length;

    const usersList = usersData?.data ?? [];
    const userCount = usersList?.user;
    const adminCount = usersList?.admin;
    const activeUsers = usersList?.active;

    const ordersList = ordersData?.data ?? [];
    const totalOrders = ordersList?.length ?? 0;
    const totalRevenue = ordersList?.reduce((sum, order) => sum + (order.price || 0), 0);
    const totalItemsSold = ordersList?.reduce((sum, order) =>
        sum + (order.books?.reduce((itemSum, item) => itemSum + (item.count || 0), 0))
        , 0);
    const deliveredOrders = ordersList?.reduce((sum, order) => {
        const deliveryStatus = getDeliveryStatus(order?.deliveryDtls);
        if (deliveryStatus.text === "Order Delivered") {
            return sum + 1;
        }
        return sum;
    }, 0)

    const stats = [
        {
            label: "Total Books",
            value: totalBooks,
            detail: "Available in Catalog",
            icon: BookOpenText,
            accent: "from-violet-500 to-indigo-500",
        },
        {
            label: "Total Orders",
            value: totalOrders,
            detail: "Placed till Date",
            icon: ShoppingBag,
            accent: "from-emerald-500 to-green-500",
        },
        {
            label: "Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            detail: `${totalItemsSold} items sold`,
            icon: DollarSign,
            accent: "from-amber-500 to-orange-500",
        },
        {
            label: "Delivered Orders",
            value: deliveredOrders,
            detail: `${deliveredOrders} items sold`,
            icon: DollarSign,
            accent: "from-amber-500 to-orange-500",
        }
    ]

    const userCats = [
        {
            label: "Total Users",
            value: userCount + adminCount
        },
        {
            label: "Active Users",
            value: activeUsers
        },
        {
            label: "Admins",
            value: adminCount
        },
        {
            label: "Users",
            value: userCount
        }
    ]

    return (
        // <div className="grid grid-rows-2">
        <div className="grid grid-cols-3 gap-4 justify-between items-center my-auto w-full h-full overflow-y-auto custom-scrollbar px-4">
            <div className={`rounded-2xl border border-(--border) bg-(--card) p-3 h-full w-full flex flex-col justify-center shadow-sm row-span-2`}>
                <div className={`mb-4 flex h-30 w-30 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 text-white`}>
                    <Users className="h-16 w-16" />
                </div>
                {userCats.map((item, index) => {
                    return (
                        <div key={index} className="flex justify-between px-2 items-center">
                            <p className="text-md text-(--muted-foreground)">{item.label}</p>
                            <h3 className="mt-2 text-2xl font-bold text-(--foreground)">{item.value}</h3>
                        </div>
                    )
                })}
                {/* <p className="mt-2 text-sm text-(--muted-foreground)">{detail}</p> */}
            </div>
            {stats.map(({ label, value, detail, icon: Icon, accent }, index) => (
                <div
                    key={index}
                    className={`rounded-2xl border border-(--border) bg-(--card) p-3 h-full w-full shadow-sm ${label === "Total Users" && "row-span-2"}`}
                >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${accent} text-white`}>
                        <Icon />
                    </div>
                    <p className="text-md text-(--muted-foreground)">{label}</p>
                    <h3 className="mt-2 text-3xl font-bold text-(--foreground)">{value}</h3>
                    <p className="mt-2 text-sm text-(--muted-foreground)">{detail}</p>
                </div>
            ))}
            <div className="flex w-full col-span-3 gap-5">
                <h2 className="text-3xl font-semibold w-fit">Orders Status</h2>
                <OrderPieChart ordersData={ordersData} />
            </div>
        </div>
        // </div>
    )
}