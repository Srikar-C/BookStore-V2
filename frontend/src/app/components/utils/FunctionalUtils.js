import { colors } from "@/app/user/styles/style";
import { FaTruckMoving } from "react-icons/fa";
import { FcShipped } from "react-icons/fc";
import { ImHome } from "react-icons/im";

export function HashTag({ icon, text }) {
    return (
        <div className="flex gap-5 items-center">
            <span className="text-2xl p-2 bg-white text-black rounded-2xl">{icon}</span>
            <p className="text-xl">{text}</p>
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

export function getDeliveryDate(setDate, orderedBooks) {
    const today = new Date();
    let daysToAdd;
    if (orderedBooks.length < 5) {
        daysToAdd = Math.floor(Math.random() * 3) + 3;
    } else {
        daysToAdd = Math.ceil(orderedBooks.length / 2);
    }
    today.setDate(today.getDate() + daysToAdd);
    setDate(today);
}

export function formattedDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}


export function getDeliveryStatus(deliveryDate) {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    today.setHours(0, 0, 0, 0);
    delivery.setHours(0, 0, 0, 0);

    if (delivery > today) {
        return {
            text: "On the Way",
            icon: <FaTruckMoving className="text-xl text-blue-700" />,
            subtext: "Delivery by"
        }
    } else if (delivery.getTime() === today.getTime()) {
        return {
            text: "Deliver Today",
            icon: <ImHome className="text-xl text-orange-500" />,
            subtext: "Delivery by"
        }
    } else {
        return {
            text: "Order Delivered",
            icon: <FcShipped className="text-xl" />,
            subtext: "Delivered On"
        }
    }
}