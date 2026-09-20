import { colors } from "@/app/user/styles/style";
import { FaTruckMoving } from "react-icons/fa";
import { FcCancel, FcShipped } from "react-icons/fc";
import { ImHome } from "react-icons/im";

export function HashTag({ icon, text }) {
    return (
        <div className="flex gap-5 items-center">
            <span className="text-xl p-2 bg-white text-black rounded-2xl">{icon}</span>
            <p className="text-lg">{text}</p>
        </div>
    )
}


export function getColor(field, focusedField, errors) {

    const fieldError = errors[field];

    if (fieldError?.type === "validation") {
        return colors.validation;
    }
    else if (fieldError?.type === "exists") {
        return colors.exists;
    }
    else {
        if (errors[field]) {
            return colors.error;
        }

        if (focusedField === field) {
            return colors.focus;
        }
        return colors.normal;
    }
};


export function Section({ icon, text, click, path, url, count }) {
    const active = path === url || ((path === "/bookstore/orders" && url.startsWith("/bookstore/orders"))) ||
        ((path === "/bookstore/settings" && url.startsWith("/bookstore/settings"))) ||
        (path === "/bookstore/settings/account" && url === "/bookstore/settings");
    const del = path === "/bookstore/settings/delete";
    const wish = path === "/bookstore/settings/wishlist";
    return (
        <div className={`flex gap-2 items-center justify-between ${del && "text-red-600 border-2 border-red-500 rounded-xl hover:text-white hover:bg-red-600"} ${active ? "bg-(--section-hover)" : "hover:bg-(--section-hover)"} p-2 cursor-pointer`} onClick={click}>
            <div className="text flex gap-2 items-center">
                <span className={`text-2xl ${wish && "text-yellow-500"}`}>{icon}</span>
                <h5>{text}</h5>
            </div>
            {path == "/bookstore/carts" && count != null && count > 0 && <span className="rounded-full w-7 h-7 flex items-center font-semibold text-md justify-center bg-red-500 text-white">{count > 10 ? "10+" : count}</span>}
        </div>
    )
}

export function getDeliveryDate(orderedBooks) {
    const today = new Date();
    let daysToAdd;
    if (orderedBooks.length < 5) {
        daysToAdd = Math.floor(Math.random() * 3) + 3;
    } else {
        daysToAdd = Math.ceil(orderedBooks.length / 2);
    }
    today.setDate(today.getDate() + daysToAdd);
    return today;
}

export function formattedDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}


export function getDeliveryStatus(deliveryDtls) {
    const status = deliveryDtls?.deliveryStatus;

    if (status === "pending") {
        return {
            text: "On the Way",
            icon: <FaTruckMoving className="text-xl text-blue-700" />,
            subtext: `Delivery by ${formattedDate(deliveryDtls?.deliveryDate)}`
        }
    } else if (status === "shipped") {
        return {
            text: "Shipped",
            icon: <ImHome className="text-xl text-orange-500" />,
            subtext: `Delivery by ${formattedDate(deliveryDtls?.deliveryDate)}`
        }
    } else if (status === "cancelled") {
        return {
            text: "Order Cancelled",
            icon: <FcCancel className="text-xl" />,
            subtext: `Order was Cancelled`
        }
    }
    else {
        return {
            text: "Order Delivered",
            icon: <FcShipped className="text-xl" />,
            subtext: `Delivered On ${formattedDate(deliveryDtls?.deliveryDate)}`
        }
    }
}

export function getCancelStatus(createdDate, deliveryDate) {
    const today = new Date();
    const created = new Date(createdDate);
    const delivery = new Date(deliveryDate);
    today.setHours(0, 0, 0, 0);
    created.setHours(0, 0, 0, 0);
    delivery.setHours(0, 0, 0, 0);
    const differenceToday = (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    const differenceDelivery = (delivery.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    console.log("Diff", differenceToday, differenceDelivery / 2);
    return (differenceDelivery / 2) <= differenceToday;
}

export function getDeliveryStatusForTracking(shippingDate, deliveryDate) {
    const createdAt = new Date(shippingDate);
    const delivery = new Date(deliveryDate);
    return new Date(
        createdAt.getTime() +
        (delivery.getTime() - createdAt.getTime()) / 2
    );
}